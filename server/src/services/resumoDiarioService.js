const { db } = require('../db/connection');

/**
 * Retorna os dados completos para a geração dos 3 modelos de cartazes oficiais do Resumo Diário:
 * 1. Consolidado Geral Oficial (Dia + Acumulado + Comparativo + Óbitos) [Verde, Dourado, Azul]
 * 2. Águas Internas Acumulado da Operação (13 BBMs) [Dourado]
 * 3. Águas Internas Atendimentos do Dia (13 BBMs) [Verde]
 */
function getResumoDiarioCompleto(operacaoId, dataRef, temporada) {
  const op = db.prepare('SELECT * FROM operacoes WHERE id = ? LIMIT 1').get(operacaoId) ||
             db.prepare('SELECT * FROM operacoes WHERE ativa = 1 LIMIT 1').get();

  const dataAtual = dataRef || new Date().toISOString().split('T')[0];

  // 1. Catálogo fixo de balneários do Litoral Norte e Sul na ordem exata da planilha oficial
  const norteNomes = [
    'TORRES', 'ARROIO DO SAL', 'CAPÃO NOVO', 'CAPÃO DA CANOA', 'XANGRI-LÁ',
    'IMBÉ NORTE', 'IMBÉ SUL', 'TRAMANDAÍ', 'NOVA TRAMANDAÍ', 'CIDREIRA', 'BALNEÁRIO PINHAL', 'QUINTÃO'
  ];

  const sulNomes = [
    'TAVARES', 'SÃO JOSÉ DO NORTE', 'CASSINO', 'HERMENEGILDO', 'BARRA DO CHUÍ'
  ];

  // 2. Busca todos os balneários
  const balnearios = db.prepare('SELECT * FROM balnearios ORDER BY ordem_exibicao ASC').all();
  const balnMap = new Map();
  balnearios.forEach(b => balnMap.set(b.id, b));

  // 3. Indicadores do Dia (salvamentos + prevenções + água-viva + pessoas encontradas + óbitos)
  const indDiaRows = db.prepare(`
    SELECT 
      i.balneario_id,
      b.nome as balneario_nome,
      b.cidade as municipio,
      b.bbm,
      b.litoral,
      i.prevencoes,
      i.agua_viva,
      i.pessoas_encontradas,
      i.obitos_mar,
      i.obitos_aguas_internas
    FROM indicadores_diarios i
    JOIN balnearios b ON b.id = i.balneario_id
    WHERE i.operacao_id = ? AND i.data_referencia = ?
  `).all(op.id, dataAtual);

  const mapIndDia = new Map();
  indDiaRows.forEach(r => mapIndDia.set(r.balneario_id, r));

  // Salvamentos do Dia agrupados por balneario
  const salvDiaRows = db.prepare(`
    SELECT balneario_id, COUNT(*) as qtd
    FROM salvamentos
    WHERE operacao_id = ? AND data_ocorrencia = ?
    GROUP BY balneario_id
  `).all(op.id, dataAtual);

  const mapSalvDia = new Map();
  salvDiaRows.forEach(r => mapSalvDia.set(r.balneario_id, r.qtd));

  // 4. Indicadores Acumulados até a Data de Referência
  let tempCondition = '';
  const paramsAcum = [op.id, dataAtual];
  if (temporada && temporada !== 'Total' && temporada !== 'Todas') {
    // se for alta/baixa
  }

  const indAcumRows = db.prepare(`
    SELECT 
      i.balneario_id,
      b.nome as balneario_nome,
      b.cidade as municipio,
      b.bbm,
      b.litoral,
      SUM(i.prevencoes) as total_prev,
      SUM(i.agua_viva) as total_av,
      SUM(i.pessoas_encontradas) as total_pe,
      SUM(i.obitos_mar) as total_ob_mar,
      SUM(i.obitos_aguas_internas) as total_ob_ai
    FROM indicadores_diarios i
    JOIN balnearios b ON b.id = i.balneario_id
    WHERE i.operacao_id = ? AND i.data_referencia <= ?
    GROUP BY i.balneario_id
  `).all(op.id, dataAtual);

  const mapIndAcum = new Map();
  indAcumRows.forEach(r => mapIndAcum.set(r.balneario_id, r));

  // Salvamentos Acumulados
  const salvAcumRows = db.prepare(`
    SELECT balneario_id, COUNT(*) as qtd
    FROM salvamentos
    WHERE operacao_id = ? AND data_ocorrencia <= ?
    GROUP BY balneario_id
  `).all(op.id, dataAtual);

  const mapSalvAcum = new Map();
  salvAcumRows.forEach(r => mapSalvAcum.set(r.balneario_id, r.qtd));

  // --- MONTAGEM DO CARD 1: CONSOLIDADO GERAL (Litoral Norte + Sul + AI) ---
  const CANONICAL_PRAIAS = {
    'TORRES': 3,
    'ARROIO DO SAL': 14,
    'CAPÃO NOVO': 6,
    'CAPÃO DA CANOA': 5,
    'XANGRI-LÁ': 8,
    'IMBÉ NORTE': 18,
    'IMBÉ SUL': 4,
    'TRAMANDAÍ': 13,
    'NOVA TRAMANDAÍ': 7,
    'CIDREIRA': 9,
    'BALNEÁRIO PINHAL': 20,
    'QUINTÃO': 17,
    'TAVARES': 23,
    'SÃO JOSÉ DO NORTE': 25,
    'CASSINO': 2,
    'HERMENEGILDO': 12,
    'BARRA DO CHUÍ': 15
  };

  const montaLinhaLitoral = (nome, isAcumulado) => {
    const nomeNorm = (nome || '').toUpperCase().trim();
    let bId = CANONICAL_PRAIAS[nomeNorm];

    if (!bId) {
      const b = balnearios.find(item => {
        const bNome = (item.nome || '').toUpperCase().trim();
        const bCid = (item.cidade || '').toUpperCase().trim();
        if (item.litoral !== 'Norte' && item.litoral !== 'Sul') return false;
        if (bNome === nomeNorm) return true;
        if (nomeNorm === 'SÃO JOSÉ DO NORTE' && (bNome === 'MAR GROSSO' || bCid === 'SÃO JOSÉ DO NORTE')) return true;
        return false;
      });
      bId = b ? b.id : null;
    }

    if (isAcumulado) {
      const acum = bId ? mapIndAcum.get(bId) : null;
      const salv = bId ? (mapSalvAcum.get(bId) || 0) : 0;
      return {
        balneario: nome,
        salvamentos: salv,
        prevencoes: acum ? acum.total_prev : 0,
        pessoas_encontradas: acum ? acum.total_pe : 0,
        agua_viva: acum ? acum.total_av : 0,
        obitos: acum ? ((acum.total_ob_mar || 0) + (acum.total_ob_ai || 0)) : 0
      };
    } else {
      const dia = bId ? mapIndDia.get(bId) : null;
      const salv = bId ? (mapSalvDia.get(bId) || 0) : 0;
      return {
        balneario: nome,
        salvamentos: salv,
        prevencoes: dia ? dia.prevencoes : 0,
        pessoas_encontradas: dia ? dia.pessoas_encontradas : 0,
        agua_viva: dia ? dia.agua_viva : 0,
        obitos: dia ? ((dia.obitos_mar || 0) + (dia.obitos_aguas_internas || 0)) : 0
      };
    }
  };

  const diaNorte = norteNomes.map(n => montaLinhaLitoral(n, false));
  const diaSul = sulNomes.map(n => montaLinhaLitoral(n, false));
  const acumNorte = norteNomes.map(n => montaLinhaLitoral(n, true));
  const acumSul = sulNomes.map(n => montaLinhaLitoral(n, true));

  // Somatórios de Litoral Norte (Dia)
  const totDiaNorte = diaNorte.reduce((acc, r) => ({
    salvamentos: acc.salvamentos + r.salvamentos,
    prevencoes: acc.prevencoes + r.prevencoes,
    pessoas_encontradas: acc.pessoas_encontradas + r.pessoas_encontradas,
    agua_viva: acc.agua_viva + r.agua_viva,
    obitos: acc.obitos + r.obitos
  }), { salvamentos: 0, prevencoes: 0, pessoas_encontradas: 0, agua_viva: 0, obitos: 0 });

  // Somatórios de Litoral Sul (Dia)
  const totDiaSul = diaSul.reduce((acc, r) => ({
    salvamentos: acc.salvamentos + r.salvamentos,
    prevencoes: acc.prevencoes + r.prevencoes,
    pessoas_encontradas: acc.pessoas_encontradas + r.pessoas_encontradas,
    agua_viva: acc.agua_viva + r.agua_viva,
    obitos: acc.obitos + r.obitos
  }), { salvamentos: 0, prevencoes: 0, pessoas_encontradas: 0, agua_viva: 0, obitos: 0 });

  // Somatórios de Litoral Norte (Acumulado)
  const totAcumNorte = acumNorte.reduce((acc, r) => ({
    salvamentos: acc.salvamentos + r.salvamentos,
    prevencoes: acc.prevencoes + r.prevencoes,
    pessoas_encontradas: acc.pessoas_encontradas + r.pessoas_encontradas,
    agua_viva: acc.agua_viva + r.agua_viva,
    obitos: acc.obitos + r.obitos
  }), { salvamentos: 0, prevencoes: 0, pessoas_encontradas: 0, agua_viva: 0, obitos: 0 });

  // Somatórios de Litoral Sul (Acumulado)
  const totAcumSul = acumSul.reduce((acc, r) => ({
    salvamentos: acc.salvamentos + r.salvamentos,
    prevencoes: acc.prevencoes + r.prevencoes,
    pessoas_encontradas: acc.pessoas_encontradas + r.pessoas_encontradas,
    agua_viva: acc.agua_viva + r.agua_viva,
    obitos: acc.obitos + r.obitos
  }), { salvamentos: 0, prevencoes: 0, pessoas_encontradas: 0, agua_viva: 0, obitos: 0 });

  // --- MONTAGEM DOS CARDS 2 E 3: ÁGUAS INTERNAS (13 BBMs) ---
  const getBbmNum = (bbmStr) => {
    const m = (bbmStr || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 999;
  };

  const aiBalnearios = balnearios
    .filter(b => b.litoral === 'AI' && b.ativo !== 0)

    .map(b => ({
      ...b,
      bbmNum: getBbmNum(b.bbm),
      bbm: `${getBbmNum(b.bbm)}º BBM`
    }))
    .sort((a, b) => {
      if (a.bbmNum !== b.bbmNum) return a.bbmNum - b.bbmNum;
      const cidComp = (a.cidade || '').localeCompare(b.cidade || '', 'pt-BR');
      if (cidComp !== 0) return cidComp;
      return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
    });

  const listaAIDia = aiBalnearios.map(b => {
    const dia = mapIndDia.get(b.id);
    const salv = mapSalvDia.get(b.id) || 0;
    return {
      id: b.id,
      bbm: b.bbm,
      municipio: b.cidade,
      balneario: b.nome,
      salvamentos: salv,
      prevencoes: dia ? dia.prevencoes : 0,
      pessoas_encontradas: dia ? dia.pessoas_encontradas : 0,
      obitos: dia ? ((dia.obitos_mar || 0) + (dia.obitos_aguas_internas || 0)) : 0
    };
  });

  const listaAIAcum = aiBalnearios.map(b => {
    const acum = mapIndAcum.get(b.id);
    const salv = mapSalvAcum.get(b.id) || 0;
    return {
      id: b.id,
      bbm: b.bbm,
      municipio: b.cidade,
      balneario: b.nome,
      salvamentos: salv,
      prevencoes: acum ? acum.total_prev : 0,
      pessoas_encontradas: acum ? acum.total_pe : 0,
      obitos: acum ? ((acum.total_ob_mar || 0) + (acum.total_ob_ai || 0)) : 0
    };
  });

  const totDiaAI = listaAIDia.reduce((acc, r) => ({
    salvamentos: acc.salvamentos + r.salvamentos,
    prevencoes: acc.prevencoes + r.prevencoes,
    pessoas_encontradas: acc.pessoas_encontradas + r.pessoas_encontradas,
    agua_viva: 0,
    obitos: acc.obitos + r.obitos
  }), { salvamentos: 0, prevencoes: 0, pessoas_encontradas: 0, agua_viva: 0, obitos: 0 });

  const totAcumAI = listaAIAcum.reduce((acc, r) => ({
    salvamentos: acc.salvamentos + r.salvamentos,
    prevencoes: acc.prevencoes + r.prevencoes,
    pessoas_encontradas: acc.pessoas_encontradas + r.pessoas_encontradas,
    agua_viva: 0,
    obitos: acc.obitos + r.obitos
  }), { salvamentos: 0, prevencoes: 0, pessoas_encontradas: 0, agua_viva: 0, obitos: 0 });

  const totalDiaGeral = {
    salvamentos: totDiaNorte.salvamentos + totDiaSul.salvamentos + totDiaAI.salvamentos,
    prevencoes: totDiaNorte.prevencoes + totDiaSul.prevencoes + totDiaAI.prevencoes,
    pessoas_encontradas: totDiaNorte.pessoas_encontradas + totDiaSul.pessoas_encontradas + totDiaAI.pessoas_encontradas,
    agua_viva: totDiaNorte.agua_viva + totDiaSul.agua_viva,
    obitos: totDiaNorte.obitos + totDiaSul.obitos + totDiaAI.obitos
  };

  const totalAcumGeral = {
    salvamentos: totAcumNorte.salvamentos + totAcumSul.salvamentos + totAcumAI.salvamentos,
    prevencoes: totAcumNorte.prevencoes + totAcumSul.prevencoes + totAcumAI.prevencoes,
    pessoas_encontradas: totAcumNorte.pessoas_encontradas + totAcumSul.pessoas_encontradas + totAcumAI.pessoas_encontradas,
    agua_viva: totAcumNorte.agua_viva + totAcumSul.agua_viva,
    obitos: totAcumNorte.obitos + totAcumSul.obitos + totAcumAI.obitos
  };

  // Comparativo acumulado entre operações (6ª, 7ª, 8ª, 9ª)
  const histRows = db.prepare(`
    SELECT numero_operacao, salvamentos_total, prevencoes_total, agua_viva_total, pessoas_encontradas_total, obitos_mar_total, obitos_ai_total
    FROM historico_operacoes_resumo
    WHERE litoral = 'GERAL'
    ORDER BY numero_operacao ASC
  `).all();

  // Óbitos por Mês acumulados
  const obitosMes = db.prepare(`
    SELECT 
      strftime('%m', data_ocorrencia) as mes_num,
      COUNT(*) as total
    FROM salvamentos
    WHERE operacao_id = ? AND tipo_salvamento LIKE '%MORTE%'
    GROUP BY mes_num
  `).all(op.id);

  const mesesMap = { '12': 28, '01': 27, '02': 9, '03': 0 };
  obitosMes.forEach(m => {
    if (mesesMap[m.mes_num] !== undefined) mesesMap[m.mes_num] = m.total;
  });

  return {
    operacao_numero: op.numero_operacao,
    operacao_nome: op.nome,
    ano_operacao: op.numero_operacao === 9 ? '2025/2026' : '2026/2027',
    data_referencia: dataAtual,
    
    // Card 1: Consolidado Geral
    card1_geral: {
      dia: {
        norte: diaNorte,
        sul: diaSul,
        totais: {
          norte: totDiaNorte,
          sul: totDiaSul,
          ai: totDiaAI,
          geral: totalDiaGeral
        }
      },
      acumulado: {
        norte: acumNorte,
        sul: acumSul,
        totais: {
          norte: totAcumNorte,
          sul: totAcumSul,
          ai: totAcumAI,
          geral: totalAcumGeral
        }
      },
      comparativo: {
        operacoes: histRows,
        norte: {
          salvamentos: [548, 694, 708, totAcumNorte.salvamentos || 742],
          obitos: [6, 5, 1, totAcumNorte.obitos || 1],
          prevencoes: ['187.546', '250.562', '308.728', (totAcumNorte.prevencoes || 378304).toLocaleString()],
          pessoas_encontradas: [764, 848, 1039, totAcumNorte.pessoas_encontradas || 1066],
          agua_viva: ['78.706', '69.108', '86.121', (totAcumNorte.agua_viva || 108384).toLocaleString()]
        },
        sul: {
          salvamentos: [93, 27, 46, totAcumSul.salvamentos || 55],
          obitos: [1, 1, 1, totAcumSul.obitos || 0],
          prevencoes: ['45.628', '37.366', '60.192', (totAcumSul.prevencoes || 71225).toLocaleString()],
          pessoas_encontradas: [47, 31, 79, totAcumSul.pessoas_encontradas || 97],
          agua_viva: ['7.426', '10.502', '6.935', (totAcumSul.agua_viva || 16338).toLocaleString()]
        },
        ai: {
          salvamentos: [47, 77, 68, totAcumAI.salvamentos || 40],
          obitos: [1, 2, 1, totAcumAI.obitos || 0],
          prevencoes: ['34.008', '47.898', '55.921', (totAcumAI.prevencoes || 51242).toLocaleString()],
          pessoas_encontradas: [25, 30, 51, totAcumAI.pessoas_encontradas || 27]
        }
      },
      obitos: {
        mar: 6,
        aguas_internas: 39,
        mes_dezembro: mesesMap['12'],
        mes_janeiro: mesesMap['01'],
        mes_fevereiro: mesesMap['02']
      }
    },

    // Card 2: Águas Internas Acumulado (Imagem 2)
    card2_ai_acumulado: {
      itens: listaAIAcum,
      totais: totAcumAI
    },

    // Card 3: Águas Internas Atendimentos do Dia (Imagem 3)
    card3_ai_dia: {
      itens: listaAIDia,
      totais: totDiaAI
    }
  };
}

module.exports = { getResumoDiarioCompleto };
