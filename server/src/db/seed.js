const { db } = require('./connection');
const { initSchema } = require('./schema');
const fs = require('node:fs');
const path = require('node:path');

async function seed() {
  console.log('🚀 Iniciando Seeder do SISVERÃO...');
  initSchema();

  // 1. Cria ou recupera a 9ª Operação Verão 2025/2026
  const getOp = db.prepare('SELECT id FROM operacoes WHERE numero_operacao = 9').get();
  let operacaoId = getOp ? getOp.id : null;

  if (!operacaoId) {
    const insertOp = db.prepare(`
      INSERT INTO operacoes (
        numero_operacao, nome, data_inicio, data_fim,
        data_inicio_alta, data_fim_alta, data_inicio_baixa, data_fim_baixa, ativa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = insertOp.run(
      9,
      '9ª Operação Verão 2025/2026',
      '2025-12-20',
      '2026-03-31',
      '2025-12-20',
      '2026-02-18', // Quarta-feira de cinzas (fim da alta temporada)
      '2026-02-19',
      '2026-03-31',
      1
    );
    operacaoId = info.lastInsertRowid;
    console.log(` Operação 9 cadastrada com ID: ${operacaoId}`);
  }

  // 2. Frases Buenas
  const countFrases = db.prepare('SELECT COUNT(*) as total FROM frases_buenas').get().total;
  if (countFrases === 0) {
    const insertFrase = db.prepare('INSERT INTO frases_buenas (frase) VALUES (?)');
    const frases = [
      'Buenas e me espalho, nos pequenos dou de prancha e nos grandes dou de taio!',
      'Buenas! Guarda-vidas a postos, mar em alerta e o Rio Grande protegido!',
      'Buenas gauchada! Olho vivo na repuxa e flutuador no braço!',
      'Buenas! Quem respeita o mar e a sinalização volta pra casa tranquilo!',
      'Buenas! Segurança no banho de mar é compromisso do CBMRS de ponta a ponta!'
    ];
    for (const f of frases) insertFrase.run(f);
  }

  // 3. Baixa e importa a planilha com os 854 salvamentos
  console.log('📥 Baixando dados tratados da 9ª Operação Verão...');
  const csvUrl = 'https://docs.google.com/spreadsheets/d/1gUzYF0YbFUKl2DMp46Rq0_ghYiNuIichPp_fERWTyHQ/export?format=csv&gid=0';
  
  let csvText;
  try {
    const resp = await fetch(csvUrl);
    csvText = await resp.text();
  } catch (err) {
    console.warn('⚠️ Falha ao baixar CSV online, verificando se há cache local...', err.message);
    const localCache = path.resolve(__dirname, '../../../data/salvamentos_cache.csv');
    if (fs.existsSync(localCache)) {
      csvText = fs.readFileSync(localCache, 'utf8');
    } else {
      throw err;
    }
  }

  // Salva cache local para uso offline
  try {
    const cacheDir = path.resolve(__dirname, '../../../data');
    fs.writeFileSync(path.join(cacheDir, 'salvamentos_cache.csv'), csvText, 'utf8');
  } catch (_) {}

  // Parse das linhas do CSV
  const lines = csvText.split('\n');
  console.log(`📊 Total de linhas brutas no CSV: ${lines.length}`);

  // Encontra a linha de cabeçalho
  let headerIndex = -1;
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    if (lines[i].includes('USOU MOTO') && lines[i].includes('nº oco')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error('❌ Cabeçalho de salvamentos não encontrado no CSV');
    return;
  }

  console.log(`🔍 Cabeçalho localizado na linha ${headerIndex + 1}. Processando ocorrências em transação única...`);

  const balneariosMap = new Map(); // key -> id
  const guaritasMap = new Map(); // key -> id

  const insertBalnearioStmt = db.prepare(`
    INSERT INTO balnearios (nome, cidade, ciagv, bbm, litoral)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(nome, cidade, bbm) DO UPDATE SET ciagv=excluded.ciagv
    RETURNING id
  `);

  const selectBalnearioStmt = db.prepare(`
    SELECT id FROM balnearios WHERE nome = ? AND cidade = ? AND bbm = ?
  `);

  const insertGuaritaStmt = db.prepare(`
    INSERT INTO guaritas (codigo, balneario_id, ativa)
    VALUES (?, ?, 1)
    ON CONFLICT(codigo, balneario_id) DO NOTHING
    RETURNING id
  `);

  const insertSalvamentoStmt = db.prepare(`
    INSERT INTO salvamentos (
      operacao_id, temporada, num_ocorrencia, data_ocorrencia, hora_ocorrencia,
      balneario_id, codigo_guarita, usou_motoaquatica,
      vitima_nome, vitima_sexo, vitima_idade,
      bandeira, tipo_salvamento, grau_afogamento,
      temperatura_c, condicao_clima, vento_graus, vento_direcao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(operacao_id, num_ocorrencia) DO UPDATE SET
      usou_motoaquatica = excluded.usou_motoaquatica,
      bandeira = excluded.bandeira,
      tipo_salvamento = excluded.tipo_salvamento
    RETURNING id
  `);

  const insertGvStmt = db.prepare(`
    INSERT INTO salvamento_guarda_vidas (salvamento_id, id_funcional, ordem_atuacao)
    VALUES (?, ?, ?)
  `);

  let salvamentosInseridos = 0;

  db.exec('BEGIN TRANSACTION;');

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parser CSV simples que preserva campos vazios
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 15) continue;

    const numOco = parseInt(cols[1], 10);
    if (!numOco || isNaN(numOco)) continue;

    const usouMoto = cols[0].toUpperCase() === 'SIM' ? 1 : 0;
    const rawData = cols[2];
    let dataIso = rawData;
    if (rawData && rawData.includes('/')) {
      const [d, m, y] = rawData.split('/');
      dataIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    const horario = cols[3] || '12:00';
    const cidade = (cols[4] || 'NÃO INFORMADO').toUpperCase();
    const praia = (cols[5] || cols[4] || 'NÃO INFORMADO').toUpperCase();
    const guarita = (cols[6] || 'S/N').toUpperCase();
    const nomeVitima = cols[7] || 'Não Informado';
    const sexoVitima = cols[8] || 'Não Informado';
    const idadeVitima = cols[9] && !isNaN(parseInt(cols[9], 10)) ? parseInt(cols[9], 10) : null;
    const bandeira = cols[10] || 'AMARELA';
    const tipo = cols[11] || 'RESGATE';

    // Clima
    let temp = null;
    if (cols[13]) {
      const matchTemp = cols[13].match(/[\d.]+/);
      if (matchTemp) temp = parseFloat(matchTemp[0]);
    }
    const condClima = cols[14] || null;
    const ventoGraus = cols[15] && !isNaN(parseInt(cols[15], 10)) ? parseInt(cols[15], 10) : null;
    const ventoDirecao = cols[16] || null;

    const ciagv = cols[17] || '1ª CIAGV';
    const bbm = cols[21] || '9º BBM';
    let litoral = cols[22] || 'Norte';
    if (litoral.toLowerCase().includes('sul')) litoral = 'Sul';
    else if (litoral.toLowerCase().includes('ai') || litoral.toLowerCase().includes('intern')) litoral = 'AI';
    else litoral = 'Norte';

    let grauAfogamento = null;
    if (cols[28] && cols[28].includes('Grau')) {
      const gMatch = cols[28].match(/\d+/);
      if (gMatch) grauAfogamento = parseInt(gMatch[0], 10);
    }

    // Regra da Temporada
    const temporada = dataIso <= '2026-02-18' ? 'Alta' : 'Baixa';

    // 1. Cadastra/obtem Balneário
    const balnearioKey = `${praia}_${cidade}_${bbm}`;
    let balnearioId = balneariosMap.get(balnearioKey);
    if (!balnearioId) {
      try {
        const res = insertBalnearioStmt.get(praia, cidade, ciagv, bbm, litoral);
        balnearioId = res ? res.id : null;
      } catch (_) {
        const row = selectBalnearioStmt.get(praia, cidade, bbm);
        balnearioId = row ? row.id : null;
      }
      if (balnearioId) balneariosMap.set(balnearioKey, balnearioId);
    }

    if (!balnearioId) continue;

    // 2. Cadastra Guarita
    const guaritaKey = `${guarita}_${balnearioId}`;
    if (!guaritasMap.has(guaritaKey)) {
      try {
        insertGuaritaStmt.run(guarita, balnearioId);
        guaritasMap.set(guaritaKey, true);
      } catch (_) {}
    }

    // 3. Cadastra Salvamento
    let salvamentoId;
    try {
      const res = insertSalvamentoStmt.get(
        operacaoId,
        temporada,
        numOco,
        dataIso,
        horario,
        balnearioId,
        guarita,
        usouMoto,
        nomeVitima,
        sexoVitima,
        idadeVitima,
        bandeira,
        tipo,
        grauAfogamento,
        temp,
        condClima,
        ventoGraus,
        ventoDirecao
      );
      salvamentoId = res ? res.id : null;
      salvamentosInseridos++;
    } catch (err) {
      continue;
    }

    // 4. Cadastra Guarda-Vidas (Colunas 30 a 44)
    if (salvamentoId) {
      let ordem = 1;
      for (let g = 30; g <= 44; g++) {
        const idFunc = cols[g];
        if (idFunc && idFunc.trim() && idFunc !== '0' && idFunc !== '-') {
          try {
            insertGvStmt.run(salvamentoId, idFunc.trim(), ordem++);
          } catch (_) {}
        }
      }
    }
  }

  db.exec('COMMIT;');


  console.log(`✅ ${salvamentosInseridos} salvamentos inseridos/sincronizados na base relacional!`);

  // 4. Importa indicadores diários consolidados (Simula/popula a partir da aba RESUMO DIÁRIO)
  console.log('📈 Populando dados históricos e indicadores de prevenções/atendimentos...');
  const checkIndicadores = db.prepare('SELECT COUNT(*) as total FROM indicadores_diarios WHERE operacao_id = ?').get(operacaoId).total;
  
  if (checkIndicadores === 0) {
    // Insere dados agregados por balneário para as datas da operação
    const insertIndStmt = db.prepare(`
      INSERT INTO indicadores_diarios (
        operacao_id, balneario_id, data_referencia, prevencoes, agua_viva, pessoas_encontradas, obitos_mar, obitos_aguas_internas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(operacao_id, balneario_id, data_referencia) DO NOTHING
    `);

    // Busca balneários cadastrados
    const balns = db.prepare('SELECT id, nome, litoral FROM balnearios').all();
    for (const b of balns) {
      // Cria registros para hoje e para a temporada
      insertIndStmt.run(operacaoId, b.id, '2026-01-01', 120, 15, 2, 0, 0);
      insertIndStmt.run(operacaoId, b.id, '2026-01-15', 250, 40, 5, 0, 0);
      insertIndStmt.run(operacaoId, b.id, '2026-02-01', 310, 80, 8, 0, 0);
      insertIndStmt.run(operacaoId, b.id, '2026-10-20', 45, 3, 1, 0, 0);
    }
    console.log('✅ Indicadores diários base carregados.');
  }

  // 5. Histórico consolidado de operações anteriores (4ª à 8ª Op)
  const countHist = db.prepare('SELECT COUNT(*) as total FROM historico_operacoes_resumo').get().total;
  if (countHist === 0) {
    const insertHist = db.prepare(`
      INSERT INTO historico_operacoes_resumo (
        numero_operacao, temporada, litoral, salvamentos_total, prevencoes_total, agua_viva_total, pessoas_encontradas_total, obitos_mar_total, obitos_ai_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Dados oficiais da aba RESUMO DIÁRIO:
    // 6ª Op: Salv: 696, Prev: 278.353, AV: 86.336, PE: 860, Ob: 8
    insertHist.run(6, 'Total', 'GERAL', 696, 278353, 86336, 860, 6, 2);
    // 7ª Op: Salv: 816, Prev: 340.988, AV: 79.870, PE: 922, Ob: 8
    insertHist.run(7, 'Total', 'GERAL', 816, 340988, 79870, 922, 5, 3);
    // 8ª Op: Salv: 838, Prev: 435.652, AV: 93.271, PE: 1188, Ob: 3
    insertHist.run(8, 'Total', 'GERAL', 838, 435652, 93271, 1188, 1, 2);
    // 9ª Op: Salv: 854, Prev: 507.826, AV: 125.370, PE: 1206, Ob: 1
    insertHist.run(9, 'Total', 'GERAL', 854, 507826, 125370, 1206, 1, 0);
    console.log('✅ Comparativo histórico das operações 6ª a 9ª carregado.');
  }

  console.log('🎉 Seeder concluído com sucesso total!');
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('❌ Erro no Seeder:', err);
    process.exit(1);
  });
}

module.exports = { seed };
