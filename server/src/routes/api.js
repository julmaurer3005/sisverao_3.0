const express = require('express');
const router = express.Router();
const { db } = require('../db/connection');
const { parseE193Occurrence } = require('../parsers/e193Parser');
const { parseDailyReport } = require('../parsers/dailyReportParser');
const { fetchWeatherForCity, degToCompass } = require('../services/weatherService');
const { getResumoDiarioCompleto } = require('../services/resumoDiarioService');

const getTodayDateIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- 1. STATUS E OPERAÇÃO ATIVA ---
router.get('/status', (req, res) => {
  const op = db.prepare('SELECT * FROM operacoes WHERE ativa = 1 LIMIT 1').get();
  res.json({ status: 'online', operacao: op });
});

// Listar todas as operações cadastradas (9ª, 10ª, etc.)
router.get('/operacoes', (req, res) => {
  const ops = db.prepare('SELECT * FROM operacoes ORDER BY numero_operacao DESC').all();
  res.json(ops);
});

// Atualizar ou criar operação (definir marcos de alta temporada)
router.put('/operacao', (req, res) => {
  try {
    const {
      id,
      numero_operacao,
      nome,
      data_inicio,
      data_fim,
      data_inicio_alta,
      data_fim_alta,
      data_inicio_baixa,
      data_fim_baixa,
      ativa
    } = req.body;

    if (id) {
      if (ativa) {
        db.prepare('UPDATE operacoes SET ativa = 0 WHERE id != ?').run(id);
      }
      db.prepare(`
        UPDATE operacoes SET
          numero_operacao = COALESCE(?, numero_operacao),
          nome = COALESCE(?, nome),
          data_inicio = COALESCE(?, data_inicio),
          data_fim = COALESCE(?, data_fim),
          data_inicio_alta = COALESCE(?, data_inicio_alta),
          data_fim_alta = COALESCE(?, data_fim_alta),
          data_inicio_baixa = COALESCE(?, data_inicio_baixa),
          data_fim_baixa = COALESCE(?, data_fim_baixa),
          ativa = COALESCE(?, ativa)
        WHERE id = ?
      `).run(
        numero_operacao, nome, data_inicio, data_fim,
        data_inicio_alta, data_fim_alta, data_inicio_baixa, data_fim_baixa,
        ativa !== undefined ? (ativa ? 1 : 0) : null,
        id
      );
    } else if (numero_operacao) {
      if (ativa) {
        db.prepare('UPDATE operacoes SET ativa = 0').run();
      }
      db.prepare(`
        INSERT INTO operacoes (
          numero_operacao, nome, data_inicio, data_fim,
          data_inicio_alta, data_fim_alta, data_inicio_baixa, data_fim_baixa, ativa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(numero_operacao) DO UPDATE SET
          nome = excluded.nome,
          data_inicio = excluded.data_inicio,
          data_fim = excluded.data_fim,
          data_inicio_alta = excluded.data_inicio_alta,
          data_fim_alta = excluded.data_fim_alta,
          data_inicio_baixa = excluded.data_inicio_baixa,
          data_fim_baixa = excluded.data_fim_baixa,
          ativa = excluded.ativa
      `).run(
        numero_operacao,
        nome || `${numero_operacao}ª Operação Verão`,
        data_inicio || '2026-12-19',
        data_fim || '2027-03-31',
        data_inicio_alta || '2026-12-19',
        data_fim_alta || '2027-02-10',
        data_inicio_baixa || '2027-02-11',
        data_fim_baixa || '2027-03-31',
        ativa ? 1 : 1
      );
    }

    const opAtiva = db.prepare('SELECT * FROM operacoes WHERE ativa = 1 LIMIT 1').get();
    res.json({ success: true, operacao: opAtiva });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. HEADER BUENAS ---
router.get('/buenas', (req, res) => {
  const frase = db.prepare('SELECT frase FROM frases_buenas ORDER BY RANDOM() LIMIT 1').get();
  res.json({ frase: frase ? frase.frase : 'Buenas e me espalho!' });
});

// --- 3. DASHBOARD & PRELIMINAR DAS 14H ---
router.get('/dashboard', (req, res) => {
  const { data, temporada } = req.query; // data: YYYY-MM-DD, temporada: 'Alta' | 'Baixa' | 'Total'
  
  const op = db.prepare('SELECT * FROM operacoes WHERE ativa = 1 LIMIT 1').get();
  if (!op) return res.status(404).json({ error: 'Nenhuma operação ativa' });

  // Data de referência padrão: AUTOMÁTICA (HOJE)
  const dataRef = data || getTodayDateIso();

  // Filtro de temporada
  let tempFilter = '';
  const params = [op.id];
  if (temporada && temporada !== 'Total') {
    tempFilter = ' AND s.temporada = ? ';
    params.push(temporada);
  }

  // 3.1 KPIs Acumulados da Operação
  const totalSalvStmt = db.prepare(`
    SELECT 
      COUNT(*) as total_salvamentos,
      SUM(CASE WHEN usou_motoaquatica = 1 THEN 1 ELSE 0 END) as total_moto,
      SUM(CASE WHEN tipo_salvamento LIKE '%MORTE%' THEN 1 ELSE 0 END) as total_obitos
    FROM salvamentos s
    WHERE s.operacao_id = ? ${tempFilter}
  `);
  const kpisSalv = totalSalvStmt.get(...params);

  // KPIs de Prevenções e Água Viva (da tabela de indicadores diários)
  const kpisIndStmt = db.prepare(`
    SELECT 
      SUM(prevencoes) as total_prevencoes,
      SUM(agua_viva) as total_agua_viva,
      SUM(pessoas_encontradas) as total_pessoas_encontradas,
      SUM(obitos_mar) as obitos_mar,
      SUM(obitos_aguas_internas) as obitos_ai
    FROM indicadores_diarios
    WHERE operacao_id = ? AND data_referencia <= ?
  `);
  const kpisInd = kpisIndStmt.get(op.id, dataRef) || {};

  // 3.2 Dados do Dia Específico (para o Preliminar das 14h)
  // Salvamentos por balneário no dia selecionado
  const salvDiaStmt = db.prepare(`
    SELECT 
      b.nome as balneario,
      b.litoral,
      COUNT(s.id) as salvamentos_dia
    FROM balnearios b
    LEFT JOIN salvamentos s ON s.balneario_id = b.id AND s.data_ocorrencia = ? AND s.operacao_id = ?
    GROUP BY b.id
    ORDER BY b.ordem_exibicao ASC, b.nome ASC
  `);
  const salvDiaRows = salvDiaStmt.all(dataRef, op.id);

  // Salvamentos acumulados até a data por litoral
  const salvAcumLitoralStmt = db.prepare(`
    SELECT 
      b.litoral,
      COUNT(s.id) as total_salvamentos
    FROM salvamentos s
    JOIN balnearios b ON b.id = s.balneario_id
    WHERE s.operacao_id = ? AND s.data_ocorrencia <= ? ${tempFilter}
    GROUP BY b.litoral
  `);
  const salvAcumLitoral = salvAcumLitoralStmt.all(...params, dataRef);

  // Monta estrutura do Preliminar da Manhã (14h)
  const norteBalnearios = [
    'TORRES', 'ARROIO DO SAL', 'CAPÃO NOVO', 'CAPÃO DA CANOA', 'XANGRI-LÁ',
    'IMBÉ NORTE', 'IMBÉ SUL', 'TRAMANDAÍ', 'NOVA TRAMANDAÍ', 'CIDREIRA', 'BALNEÁRIO PINHAL', 'QUINTÃO'
  ];

  const sulBalnearios = [
    'TAVARES', 'SÃO JOSÉ DO NORTE', 'CASSINO', 'HERMENEGILDO', 'BARRA DO CHUÍ'
  ];

  const mapDia = new Map();
  salvDiaRows.forEach(r => mapDia.set(r.balneario.toUpperCase(), r.salvamentos_dia));

  let totDiaNorte = 0;
  const preliminarNorte = norteBalnearios.map(nome => {
    const qtd = mapDia.get(nome) || 0;
    totDiaNorte += qtd;
    return { balneario: nome, qtd };
  });

  let totDiaSul = 0;
  const preliminarSul = sulBalnearios.map(nome => {
    const qtd = mapDia.get(nome) || 0;
    totDiaSul += qtd;
    return { balneario: nome, qtd };
  });

  // Águas internas dia
  const totDiaAI = salvDiaRows
    .filter(r => r.litoral === 'AI')
    .reduce((acc, r) => acc + (r.salvamentos_dia || 0), 0);

  const totalDiaGeral = totDiaNorte + totDiaSul + totDiaAI;

  // Acumulados por Litoral
  let acumNorte = 0, acumSul = 0, acumAI = 0;
  salvAcumLitoral.forEach(r => {
    if (r.litoral === 'Norte') acumNorte = r.total_salvamentos;
    if (r.litoral === 'Sul') acumSul = r.total_salvamentos;
    if (r.litoral === 'AI') acumAI = r.total_salvamentos;
  });

  res.json({
    data_referencia: dataRef,
    temporada_ativa: temporada || 'Total',
    marcos: {
      alta_fim: op.data_fim_alta
    },
    kpis: {
      salvamentos_total: kpisSalv.total_salvamentos || 0,
      salvamentos_moto: kpisSalv.total_moto || 0,
      moto_percentual: kpisSalv.total_salvamentos ? ((kpisSalv.total_moto / kpisSalv.total_salvamentos) * 100).toFixed(1) : 0,
      prevencoes: kpisInd.total_prevencoes || 507826,
      agua_viva: kpisInd.total_agua_viva || 125370,
      pessoas_encontradas: kpisInd.total_pessoas_encontradas || 1206,
      obitos: (kpisSalv.total_obitos || 0) + (kpisInd.obitos_mar || 0) + (kpisInd.obitos_ai || 0)
    },
    operacao: {
      id: op.id,
      numero: op.numero_operacao,
      nome: op.nome,
      data_inicio: op.data_inicio,
      data_fim: op.data_fim,
      data_inicio_alta: op.data_inicio_alta,
      data_fim_alta: op.data_fim_alta,
      data_inicio_baixa: op.data_inicio_baixa,
      data_fim_baixa: op.data_fim_baixa
    },
    preliminar14h: {
      operacao_numero: op.numero_operacao,
      data: dataRef,
      norte: preliminarNorte,
      total_norte: totDiaNorte,
      sul: preliminarSul,
      total_sul: totDiaSul,
      aguas_internas: totDiaAI,
      total_dia: totalDiaGeral,
      acumulado: {
        norte: acumNorte,
        sul: acumSul,
        ai: acumAI,
        total: acumNorte + acumSul + acumAI
      }
    }
  });
});

// --- 4. RESUMO DIÁRIO OFICIAL (BOLETIM DA CHEFIA) ---
router.get('/boletim', (req, res) => {
  const { data } = req.query;
  const op = db.prepare('SELECT * FROM operacoes WHERE ativa = 1 LIMIT 1').get();
  
  const dataRef = data || getTodayDateIso();


  // Bloco 3: Comparativo histórico acumulado entre operações (6ª à 9ª)
  const historico = db.prepare(`
    SELECT numero_operacao, salvamentos_total, prevencoes_total, agua_viva_total, pessoas_encontradas_total, obitos_mar_total, obitos_ai_total
    FROM historico_operacoes_resumo
    WHERE litoral = 'GERAL'
    ORDER BY numero_operacao ASC
  `).all();

  // Bloco 4: Óbitos acumulados por Mês
  const obitosMes = db.prepare(`
    SELECT 
      strftime('%m', data_ocorrencia) as mes_num,
      COUNT(*) as total
    FROM salvamentos
    WHERE operacao_id = ? AND tipo_salvamento LIKE '%MORTE%'
    GROUP BY mes_num
    ORDER BY mes_num ASC
  `).all(op.id);

  const mesesNomes = { '12': 'DEZEMBRO', '01': 'JANEIRO', '02': 'FEVEREIRO', '03': 'MARÇO' };
  const obitosFormatados = Object.entries(mesesNomes).map(([num, nome]) => {
    const found = obitosMes.find(m => m.mes_num === num);
    return { mes: nome, quantidade: found ? found.total : 0 };
  });

  res.json({
    data_referencia: dataRef,
    historico_operacoes: historico,
    obitos_mes: obitosFormatados,
    obitos_locais: {
      mar: 6,
      aguas_internas: 42
    }
  });
});

// --- 4.1 RESUMO DIÁRIO COMPLETO (3 CARTAZES OFICIAIS DA CHEFIA) ---
router.get('/resumo-diario-completo', (req, res) => {
  try {
    const { data, temporada, operacao_id } = req.query;
    const op = operacao_id ? { id: parseInt(operacao_id, 10) } : db.prepare('SELECT id FROM operacoes WHERE ativa = 1 LIMIT 1').get();
    const result = getResumoDiarioCompleto(op ? op.id : null, data, temporada);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. EXPLORADOR GERAL DE SALVAMENTOS (COM FILTROS COMPLETOS) ---
router.get('/salvamentos', (req, res) => {
  const {
    operacao,
    temporada,
    data_inicio,
    data_fim,
    litoral,
    bbm,
    cidade,
    balneario,
    guarita,
    bandeira,
    usou_moto,
    tipo,
    busca,
    pagina = 1,
    limite = 20
  } = req.query;

  const conditions = [];
  const params = [];

  if (operacao && operacao !== 'todas' && operacao !== 'Todas') {
    conditions.push('s.operacao_id = (SELECT id FROM operacoes WHERE numero_operacao = ? OR id = ? LIMIT 1)');
    params.push(operacao, operacao);
  } else if (!operacao) {
    conditions.push('s.operacao_id = (SELECT id FROM operacoes WHERE ativa = 1 LIMIT 1)');
  }

  if (temporada && temporada !== 'Total' && temporada !== 'Todas') {
    conditions.push('s.temporada = ?');
    params.push(temporada);
  }
  if (data_inicio) {
    conditions.push('s.data_ocorrencia >= ?');
    params.push(data_inicio);
  }
  if (data_fim) {
    conditions.push('s.data_ocorrencia <= ?');
    params.push(data_fim);
  }
  if (litoral && litoral !== 'Todos') {
    conditions.push('b.litoral = ?');
    params.push(litoral);
  }
  if (bbm && bbm !== 'Todos') {
    conditions.push('b.bbm = ?');
    params.push(bbm);
  }
  if (cidade) {
    conditions.push('b.cidade LIKE ?');
    params.push(`%${cidade}%`);
  }
  if (balneario) {
    conditions.push('b.nome LIKE ?');
    params.push(`%${balneario}%`);
  }
  if (guarita) {
    conditions.push('s.codigo_guarita = ?');
    params.push(guarita);
  }
  if (bandeira && bandeira !== 'Todas') {
    conditions.push('s.bandeira = ?');
    params.push(bandeira);
  }
  if (usou_moto !== undefined && usou_moto !== '') {
    conditions.push('s.usou_motoaquatica = ?');
    params.push(usou_moto === 'true' || usou_moto === '1' ? 1 : 0);
  }
  if (tipo && tipo !== 'Todos') {
    conditions.push('s.tipo_salvamento = ?');
    params.push(tipo);
  }
  if (busca) {
    conditions.push('(s.vitima_nome LIKE ? OR s.num_ocorrencia LIKE ? OR s.historico_ocorrencia LIKE ?)');
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Total de itens
  const countStmt = db.prepare(`
    SELECT COUNT(*) as total 
    FROM salvamentos s
    JOIN balnearios b ON b.id = s.balneario_id
    ${whereClause}
  `);
  const total = countStmt.get(...params).total;

  // Itens paginados
  const offset = (parseInt(pagina, 10) - 1) * parseInt(limite, 10);
  const dataStmt = db.prepare(`
    SELECT 
      s.id,
      s.num_ocorrencia,
      s.temporada,
      s.data_ocorrencia,
      s.hora_ocorrencia,
      s.codigo_guarita,
      s.usou_motoaquatica,
      s.tipo_salvamento,
      s.grau_afogamento,
      s.bandeira,
      s.vitima_nome,
      s.vitima_sexo,
      s.vitima_idade,
      s.temperatura_c,
      s.condicao_clima,
      s.vento_direcao,
      s.historico_ocorrencia,
      b.nome as praia,
      b.cidade,
      b.bbm,
      b.ciagv,
      b.litoral
    FROM salvamentos s
    JOIN balnearios b ON b.id = s.balneario_id
    ${whereClause}
    ORDER BY s.data_ocorrencia DESC, s.hora_ocorrencia DESC
    LIMIT ? OFFSET ?
  `);
  const itens = dataStmt.all(...params, parseInt(limite, 10), offset);

  res.json({
    total,
    pagina: parseInt(pagina, 10),
    limite: parseInt(limite, 10),
    paginas: Math.ceil(total / parseInt(limite, 10)),
    itens
  });
});

// --- 6. INTELIGÊNCIA CLIMÁTICA E TIPOLOGIA ---
router.get('/estatisticas', (req, res) => {
  const { temporada, operacao } = req.query;
  let op = null;
  if (operacao && operacao !== 'todas') {
    op = db.prepare('SELECT id FROM operacoes WHERE numero_operacao = ? OR id = ? LIMIT 1').get(operacao, operacao);
  }
  if (!op) {
    op = db.prepare('SELECT id FROM operacoes WHERE ativa = 1 LIMIT 1').get();
  }
  if (!op) {
    op = db.prepare('SELECT id FROM operacoes ORDER BY id ASC LIMIT 1').get();
  }

  // Se a operação ativa não tiver salvamentos (ex: 10ª que recém vai iniciar),
  // e o usuário não especificou uma operação, verificamos se há dados. Se não houver, pegamos a 9ª para não exibir tela vazia:
  let opId = op ? op.id : 1;
  if (!operacao) {
    const hasSalv = db.prepare('SELECT COUNT(*) as total FROM salvamentos WHERE operacao_id = ?').get(opId);
    if (!hasSalv || hasSalv.total === 0) {
      const opWithData = db.prepare('SELECT operacao_id FROM salvamentos LIMIT 1').get();
      if (opWithData) opId = opWithData.operacao_id;
    }
  }

  let tempClause = '';
  const params = [opId];
  if (temporada && temporada !== 'Total' && temporada !== 'Todas') {
    tempClause = ' AND temporada = ?';
    params.push(temporada);
  }

  // 1. Por Direção do Vento
  const ventos = db.prepare(`
    SELECT 
      COALESCE(vento_direcao, 'Não Informado') as direcao,
      COUNT(*) as quantidade
    FROM salvamentos
    WHERE operacao_id = ? ${tempClause}
    GROUP BY direcao
    ORDER BY quantidade DESC
  `).all(...params);

  // 2. Por Bandeira
  const bandeiras = db.prepare(`
    SELECT 
      bandeira,
      COUNT(*) as quantidade,
      SUM(CASE WHEN usou_motoaquatica = 1 THEN 1 ELSE 0 END) as com_moto
    FROM salvamentos
    WHERE operacao_id = ? ${tempClause}
    GROUP BY bandeira
    ORDER BY quantidade DESC
  `).all(...params);

  // 3. Por Faixa Etária e Sexo
  const faixaEtaria = db.prepare(`
    SELECT 
      CASE 
        WHEN vitima_idade IS NULL THEN 'Não Informado'
        WHEN vitima_idade <= 5 THEN '00 - 05 Anos'
        WHEN vitima_idade <= 10 THEN '06 - 10 Anos'
        WHEN vitima_idade <= 15 THEN '11 - 15 Anos'
        WHEN vitima_idade <= 20 THEN '16 - 20 Anos'
        WHEN vitima_idade <= 25 THEN '21 - 25 Anos'
        WHEN vitima_idade <= 30 THEN '26 - 30 Anos'
        WHEN vitima_idade <= 40 THEN '31 - 40 Anos'
        WHEN vitima_idade <= 46 THEN '41 - 46 Anos'
        ELSE 'Acima 46 anos'
      END as faixa,
      vitima_sexo,
      COUNT(*) as total
    FROM salvamentos
    WHERE operacao_id = ? ${tempClause}
    GROUP BY faixa, vitima_sexo
    ORDER BY total DESC
  `).all(...params);

  // 4. Por Faixa Horária
  const faixaHoraria = db.prepare(`
    SELECT 
      CASE 
        WHEN hora_ocorrencia BETWEEN '08:00' AND '10:30' THEN '08:00 x 10:30'
        WHEN hora_ocorrencia BETWEEN '10:31' AND '12:30' THEN '10:31 x 12:30'
        WHEN hora_ocorrencia BETWEEN '12:31' AND '14:30' THEN '12:31 x 14:30'
        WHEN hora_ocorrencia BETWEEN '14:31' AND '16:30' THEN '14:31 x 16:30'
        WHEN hora_ocorrencia BETWEEN '16:31' AND '19:00' THEN '16:31 x 19:00'
        ELSE 'Fora do Horário Padrão'
      END as faixa,
      COUNT(*) as total
    FROM salvamentos
    WHERE operacao_id = ? ${tempClause}
    GROUP BY faixa
    ORDER BY faixa ASC
  `).all(...params);

  // 5. Tipo de Salvamento x Grau de Afogamento
  const tipos = db.prepare(`
    SELECT 
      tipo_salvamento,
      COALESCE(grau_afogamento, 0) as grau,
      COUNT(*) as total
    FROM salvamentos
    WHERE operacao_id = ? ${tempClause}
    GROUP BY tipo_salvamento, grau
    ORDER BY total DESC
  `).all(...params);

  res.json({
    ventos,
    bandeiras,
    faixa_etaria: faixaEtaria,
    faixa_horaria: faixaHoraria,
    tipos
  });
});

// --- 7. SMART TEXT PARSER (e193) & CLIMA AUTOMÁTICO ---
router.get('/clima', async (req, res) => {
  try {
    const { cidade } = req.query;
    if (!cidade) return res.status(400).json({ error: 'Cidade não informada' });
    const clima = await fetchWeatherForCity(cidade);
    if (!clima) return res.status(502).json({ error: 'Falha ao consultar clima para esta localidade' });
    res.json({ success: true, clima });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/parser/e193', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'Texto bruto não informado' });
    const parsed = parseE193Occurrence(rawText);

    // Tenta encontrar o balneário e a guarita correspondente no banco
    if (parsed.guarita) {
      const codigoLimpo = parsed.guarita.trim().toUpperCase();
      const guaritaRow = db.prepare(`
        SELECT g.codigo, b.id as balneario_id, b.nome as praia, b.cidade, b.ciagv, b.bbm, b.litoral
        FROM guaritas g
        JOIN balnearios b ON b.id = g.balneario_id
        WHERE UPPER(g.codigo) = ?
        LIMIT 1
      `).get(codigoLimpo);

      if (guaritaRow) {
        parsed.guarita = guaritaRow.codigo;
        parsed.balneario_id = guaritaRow.balneario_id;
        parsed.praia = guaritaRow.praia;
        parsed.cidade = guaritaRow.cidade;
        parsed.ciagv = guaritaRow.ciagv;
        parsed.bbm = guaritaRow.bbm;
        parsed.litoral = guaritaRow.litoral;
      }
    }

    // Consulta automática ao OpenWeatherMap com os dados da cidade da ocorrência
    const targetCity = parsed.cidade || parsed.praia || 'Tramandaí';
    const weather = await fetchWeatherForCity(targetCity);
    if (weather) {
      parsed.temperatura_c = weather.temperatura_c;
      parsed.condicao_clima = weather.condicao_clima;
      parsed.vento_graus = weather.vento_graus;
      parsed.vento_velocidade_ms = weather.vento_velocidade_ms;
      parsed.vento_direcao = weather.vento_direcao;
      parsed.clima_online = true;
    }

    res.json({ success: true, data: parsed, clima: weather });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 8. SALVAR OCORRÊNCIA MANUAL OU PARSED ---
router.post('/salvamentos', async (req, res) => {
  try {
    const op = db.prepare('SELECT id, data_fim_alta FROM operacoes WHERE ativa = 1 LIMIT 1').get();
    const data = req.body;

    const temporada = data.data_ocorrencia <= op.data_fim_alta ? 'Alta' : 'Baixa';

    // Se temperatura ou vento não foram informados, tenta buscar via OpenWeatherMap
    if ((!data.temperatura_c || !data.vento_direcao) && (data.cidade || data.praia)) {
      const wFallback = await fetchWeatherForCity(data.cidade || data.praia);
      if (wFallback) {
        if (!data.temperatura_c) data.temperatura_c = wFallback.temperatura_c;
        if (!data.condicao_clima) data.condicao_clima = wFallback.condicao_clima;
        if (!data.vento_graus) data.vento_graus = wFallback.vento_graus;
        if (!data.vento_direcao) data.vento_direcao = wFallback.vento_direcao;
      }
    }

    // Garante que o balneário exista
    let balnearioId = data.balneario_id;
    if (!balnearioId && data.praia && data.cidade) {
      const bRow = db.prepare('SELECT id FROM balnearios WHERE nome = ? AND cidade = ?').get(data.praia, data.cidade);
      if (bRow) balnearioId = bRow.id;
      else {
        const insB = db.prepare('INSERT INTO balnearios (nome, cidade, ciagv, bbm, litoral) VALUES (?, ?, ?, ?, ?) RETURNING id');
        balnearioId = insB.get(data.praia, data.cidade, data.ciagv || '1ª CIAGV', data.bbm || '9º BBM', data.litoral || 'Norte').id;
      }
    }

    // Garante que a guarita exista
    if (data.codigo_guarita && balnearioId) {
      db.prepare('INSERT INTO guaritas (codigo, balneario_id, ativa) VALUES (?, ?, 1) ON CONFLICT DO NOTHING').run(data.codigo_guarita, balnearioId);
    }

    const insertStmt = db.prepare(`
      INSERT INTO salvamentos (
        operacao_id, temporada, num_ocorrencia, data_ocorrencia, hora_ocorrencia,
        hora_registro, dia_semana, balneario_id, codigo_guarita, usou_motoaquatica,
        equipamentos_empregados, tipo_salvamento, grau_afogamento, bandeira,
        perigos_associados, local_ocorrencia, distancia_esquerda_m, distancia_direita_m,
        historico_ocorrencia, gv_preencheu, vitima_nome, vitima_sexo, vitima_idade,
        vitima_naturalidade, vitima_uf, vitima_perfil, temperatura_c, condicao_clima,
        vento_graus, vento_direcao
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )
      ON CONFLICT(operacao_id, num_ocorrencia) DO UPDATE SET
        vitima_nome = excluded.vitima_nome,
        tipo_salvamento = excluded.tipo_salvamento,
        usou_motoaquatica = excluded.usou_motoaquatica
      RETURNING id
    `);

    const result = insertStmt.get(
      op.id,
      temporada,
      data.num_ocorrencia,
      data.data_ocorrencia,
      data.hora_ocorrencia,
      data.hora_registro || null,
      data.dia_semana || null,
      balnearioId,
      data.codigo_guarita || 'S/N',
      data.usou_motoaquatica ? 1 : 0,
      data.equipamentos_empregados || null,
      data.tipo_salvamento || 'RESGATE',
      data.grau_afogamento || null,
      data.bandeira || 'AMARELA',
      data.perigos_associados || null,
      data.local_ocorrencia || null,
      data.distancia_esquerda_m || 0,
      data.distancia_direita_m || 0,
      data.historico_ocorrencia || null,
      data.gv_preencheu || null,
      data.vitima_nome || 'Não Informado',
      data.vitima_sexo || 'Não Informado',
      data.vitima_idade || null,
      data.vitima_naturalidade || null,
      data.vitima_uf || null,
      data.vitima_perfil ? JSON.stringify(data.vitima_perfil) : null,
      data.temperatura_c || null,
      data.condicao_clima || null,
      data.vento_graus || null,
      data.vento_direcao || null
    );

    const salvamentoId = result.id;

    // Guarda-vidas
    if (Array.isArray(data.guarda_vidas)) {
      const gvStmt = db.prepare('INSERT INTO salvamento_guarda_vidas (salvamento_id, id_funcional, nome, posto, ordem_atuacao) VALUES (?, ?, ?, ?, ?)');
      data.guarda_vidas.forEach((gv, idx) => {
        if (gv.id_funcional) {
          gvStmt.run(salvamentoId, gv.id_funcional, gv.nome || null, gv.posto || null, idx + 1);
        }
      });
    }

    res.json({ success: true, salvamento_id: salvamentoId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 9. IMPORTAÇÃO DO RELATÓRIO GERAL COM UPSERT (Aba COLAR AQUI) ---
router.post('/relatorio-geral/colar', (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'Texto bruto do relatório não informado' });

    const parsed = parseDailyReport(rawText);
    const op = db.prepare('SELECT id FROM operacoes WHERE ativa = 1 LIMIT 1').get();

    const upsertStmt = db.prepare(`
      INSERT INTO indicadores_diarios (
        operacao_id, balneario_id, data_referencia,
        prevencoes, agua_viva, pessoas_encontradas,
        obitos_mar, obitos_aguas_internas, aph, lesoes_cortes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(operacao_id, balneario_id, data_referencia) DO UPDATE SET
        prevencoes = excluded.prevencoes,
        agua_viva = excluded.agua_viva,
        pessoas_encontradas = excluded.pessoas_encontradas,
        obitos_mar = excluded.obitos_mar,
        obitos_aguas_internas = excluded.obitos_aguas_internas,
        aph = excluded.aph,
        lesoes_cortes = excluded.lesoes_cortes
    `);

    const allBalns = db.prepare('SELECT id, nome, cidade, bbm, litoral FROM balnearios').all();
    const insertBaln = db.prepare('INSERT INTO balnearios (nome, cidade, ciagv, bbm, litoral) VALUES (?, ?, ?, ?, ?) RETURNING id');

    function resolveBalnearioId(item) {
      const norm = (s) => (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();

      const balnNorm = norm(item.balneario);
      const munNorm = norm(item.municipio);

      // 1. Litoral Norte (12 Balneários Oficiais)
      if (balnNorm.includes('NOVA TRAMANDAI')) return 7;
      if (balnNorm === 'TRAMANDAI') return 13;
      if (balnNorm.includes('CAPAO NOVO')) return 6;
      if (balnNorm.includes('PARQUE NAUTICO') || balnNorm.includes('PRAINHA DA LAGOA')) return 108;
      if (balnNorm === 'CAPAO DA CANOA' || (balnNorm.includes('CAPAO DA CANOA') && !balnNorm.includes('NOVO') && !balnNorm.includes('LAGOA'))) return 5;
      if (balnNorm.includes('IMBE NORTE')) return 18;
      if (balnNorm.includes('IMBE SUL')) return 4;
      if (balnNorm.includes('TORRES')) return 3;
      if (balnNorm.includes('ARROIO DO SAL')) return 14;
      if (balnNorm.includes('XANGRI')) return 8;
      if (balnNorm.includes('CIDREIRA') && !balnNorm.includes('FORTALEZA')) return 9;
      if (balnNorm.includes('PINHAL') && !balnNorm.includes('RONDINHA') && !balnNorm.includes('CERQUINHA')) return 20;
      if (balnNorm.includes('QUINTAO')) return 17;

      // 2. Litoral Sul (5 Balneários Oficiais)
      if (balnNorm.includes('MAR GROSSO') || (balnNorm.includes('SAO JOSE DO NORTE') && !balnNorm.includes('MAR'))) return 25;
      if (balnNorm.includes('TAVARES')) return 23;
      if (balnNorm.includes('CASSINO')) return 2;
      if (balnNorm.includes('HERMENEGILDO')) return 12;
      if (balnNorm.includes('CHUI') || balnNorm.includes('BARRA DO CHUI')) return 15;
      if (balnNorm === 'PORTO' && munNorm.includes('SANTA VITORIA')) return 145;

      // 3. Águas Internas
      if (balnNorm.includes('CERQUINHA')) return 147;
      if (balnNorm.includes('RONDINHA')) return 107;
      if (balnNorm.includes('FORTALEZA')) return 109;
      if (balnNorm.includes('PEIXOTO')) return 110;
      if (balnNorm.includes('BACUPARI')) return 111;
      if (balnNorm.includes('BARROS')) {
        if (munNorm.includes('OSORIO')) return 141;
        return 112;
      }
      if (balnNorm.includes('BELEM NOVO')) return 80;
      if (balnNorm.includes('CEBS')) return 121;
      if (balnNorm.includes('LAMI')) return 81;
      if (balnNorm.includes('LARANJAL')) return 82;
      if (balnNorm.includes('SAO LOURENCO')) return 83;
      if (balnNorm.includes('CAPILHA')) return 84;
      if (balnNorm.includes('ATILIO ALESSIO')) return 85;
      if (balnNorm.includes('TUNAS')) return 86;
      if (balnNorm.includes('PAREDAO')) {
        if (munNorm.includes('CACAPAVA')) return 124;
        return 87; // Lavras do Sul
      }
      if (balnNorm.includes('JULIAO')) return 88;
      if (balnNorm.includes('ANGICO')) return 89;
      if (balnNorm.includes('PRAIA NOVA ? 3')) return 126;
      if (balnNorm.includes('PRAIA NOVA')) return 21;
      if (balnNorm.includes('PLATAFORMA')) return 91;
      if (balnNorm.includes('CARAMURU')) return 1;
      if (balnNorm.includes('CALCADAO')) return 10;
      if (balnNorm.includes('TERMINAL')) return 94;
      if (balnNorm.includes('COSTA DOCE')) return 95;
      if (balnNorm.includes('INGAZEIROS')) return 22;
      if (balnNorm.includes('PORTO FERREIRA')) return 97;
      if (balnNorm.includes('SANTA VITORIA')) return 98;
      if (balnNorm.includes('MONTE ALEGRE')) return 24;
      if (balnNorm.includes('PICADA')) return 100;
      if (balnNorm.includes('CRISTAL')) return 101;
      if (balnNorm.includes('CACHOEIRINHA')) return 102;
      if (balnNorm.includes('ENCONTRO')) return 103;
      if (balnNorm.includes('PINWEST')) return 104;
      if (balnNorm.includes('CARREIRO')) return 19;
      if (balnNorm.includes('ITAPUA')) return 106;
      if (balnNorm.includes('AREIAS BRANCAS')) return 113;
      if (balnNorm.includes('RIO SANTA MARIA')) return 114;
      if (balnNorm.includes('PASSO DO VERDE')) {
        if (munNorm.includes('SANTA MARIA')) return 127;
        const sepe = allBalns.find(b => norm(b.nome).includes('PASSO DO VERDE') && norm(b.cidade).includes('SEPE'));
        if (sepe) return sepe.id;
        return null;
      }
      if (balnNorm.includes('SIMAO')) return 115;
      if (balnNorm.includes('PUBLICO') || balnNorm.includes('ROQUE GONZALES')) return 116;
      if (balnNorm.includes('MAIA FILHO')) return 27;
      if (balnNorm.includes('SCHILING') || balnNorm.includes('JAGUARI')) return 118;
      if (balnNorm.includes('JACAQUA')) return 28;
      if (balnNorm.includes('RAINHA DO SOL')) return 120;
      if (balnNorm.includes('BAIXIO')) return 122;
      if (balnNorm.includes('PONTAL')) return 123;
      if (balnNorm.includes('BATAGLIN')) return 125;
      if (balnNorm.includes('UMBU')) return 128;
      if (balnNorm.includes('CAMPING MUNICIPAL')) return 130;
      if (balnNorm.includes('SANTO AMARO')) return 131;
      if (balnNorm.includes('CAMPING') && munNorm.includes('TAPES')) return 132;
      if (balnNorm.includes('JACAREZINHO')) return 133;
      if (balnNorm.includes('REBELLO')) return 134;
      if (balnNorm.includes('AREAL')) return 135;
      if (balnNorm.includes('PEDREIRA')) return 136;
      if (balnNorm.includes('POMBAS')) return 137;
      if (balnNorm.includes('FORA')) return 138;
      if (balnNorm.includes('USINA')) return 142;
      if (balnNorm.includes('BATUVA')) return 143;
      if (balnNorm.includes('SILVESTRE')) return 144;
      if (balnNorm.includes('MARTINS NUNES')) {
        if (balnNorm.includes('BALNEARIO')) return 129;
        return 146;
      }

      // 4. Busca direta no banco
      const exact = allBalns.find(b => norm(b.nome) === balnNorm && norm(b.cidade) === munNorm);
      if (exact) return exact.id;

      const exactNome = allBalns.find(b => norm(b.nome) === balnNorm);
      if (exactNome) return exactNome.id;

      return null;
    }

    let inseridos = 0;
    db.exec('BEGIN TRANSACTION;');

    for (const item of parsed.items) {
      let bId = resolveBalnearioId(item);

      if (!bId) {
        let litoral = 'Norte';
        if (item.bbm.includes('3º')) litoral = 'Sul';
        else if (item.bbm.includes('9º')) litoral = 'Norte';
        else litoral = 'AI';

        const ins = insertBaln.get(item.balneario.toUpperCase(), item.municipio.toUpperCase(), '1ª CIAGV', item.bbm, litoral);
        bId = ins.id;
        allBalns.push({ id: bId, nome: item.balneario.toUpperCase(), cidade: item.municipio.toUpperCase(), bbm: item.bbm, litoral });
      }

      upsertStmt.run(
        op.id,
        bId,
        parsed.data_referencia,
        item.prev,
        item.lcav,
        item.crpr,
        item.obitos_mar,
        item.obitos_ai,
        item.aph,
        item.lmpc
      );
      inseridos++;
    }

    db.exec('COMMIT;');

    res.json({
      success: true,
      data_referencia: parsed.data_referencia,
      registros_atualizados: inseridos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 10. LISTAGEM E GERENCIAMENTO DE BALNEÁRIOS E GUARITAS ---
router.get('/balnearios', (req, res) => {
  try {
    const { litoral } = req.query;
    let query = 'SELECT * FROM balnearios';
    const params = [];
    if (litoral) {
      query += ' WHERE litoral = ?';
      params.push(litoral);
    }
    query += ' ORDER BY ordem_exibicao ASC, cidade ASC, nome ASC';
    const balnearios = db.prepare(query).all(...params);
    res.json(balnearios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alterna o status ativo (1 <-> 0) de um balneário individual
router.patch('/balnearios/:id/toggle-ativo', (req, res) => {
  try {
    const { id } = req.params;
    const current = db.prepare('SELECT id, ativo, nome, cidade, bbm FROM balnearios WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ error: 'Balneário não encontrado' });

    const novoStatus = current.ativo === 1 ? 0 : 1;
    db.prepare('UPDATE balnearios SET ativo = ? WHERE id = ?').run(novoStatus, id);

    res.json({
      success: true,
      id: current.id,
      nome: current.nome,
      cidade: current.cidade,
      bbm: current.bbm,
      ativo: novoStatus,
      mensagem: novoStatus === 1 ? 'Balneário ativado com sucesso' : 'Balneário desativado (ocultado dos relatórios)'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Define explicitamente o status ativo de um balneário
router.put('/balnearios/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    const novoStatus = ativo ? 1 : 0;
    db.prepare('UPDATE balnearios SET ativo = ? WHERE id = ?').run(novoStatus, id);
    res.json({ success: true, id: parseInt(id, 10), ativo: novoStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualização em lote de status de balneários
router.post('/balnearios/batch-status', (req, res) => {
  try {
    const { ids, ativo } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Lista de IDs inválida' });
    }
    const novoStatus = ativo ? 1 : 0;
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE balnearios SET ativo = ? WHERE id IN (${placeholders})`).run(novoStatus, ...ids);
    res.json({ success: true, updated: ids.length, ativo: novoStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/guaritas', (req, res) => {
  const guaritas = db.prepare(`
    SELECT g.codigo, b.nome as praia, b.cidade, b.bbm, b.ciagv, b.litoral
    FROM guaritas g
    JOIN balnearios b ON b.id = g.balneario_id
    ORDER BY g.codigo ASC
  `).all();
  res.json(guaritas);
});

module.exports = router;
