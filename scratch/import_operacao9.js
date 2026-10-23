const { db } = require('../server/src/db/connection');

async function executeImport9() {
  function parseVal(v) {
    if (!v) return 0;
    const clean = v.trim().replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : Math.round(n);
  }

  function parseDate(dStr) {
    if (!dStr) return null;
    const parts = dStr.trim().split('/');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 17 Litoral beaches (K:AA, AB:AR, AS:BI, BJ:BZ)
  const litoralBalnIds = [
    3,  // 0: Torres
    14, // 1: Arroio Do Sal
    6,  // 2: Capão Novo
    5,  // 3: Capão Da Canoa
    8,  // 4: Xangri-Lá
    18, // 5: Imbé Norte
    4,  // 6: Imbé Sul
    13, // 7: Tramandaí
    7,  // 8: Nova Tramandaí
    9,  // 9: Cidreira
    20, // 10: BALNEÁRIO PINHAL
    17, // 11: Quintão
    23, // 12: TAVARES
    25, // 13: MAR GROSSO / São José do Norte
    2,  // 14: CASSINO
    12, // 15: HERMENEGILDO
    15  // 16: BARRA DO CHUÍ
  ];

  // 59 Águas Internas beaches (BJ:DP, DR:FX, FZ:IF)
  const internaBalnIds = [
    1,   // 61: CARAMURU
    10,  // 62: CENTRAL (CALÇADÃO)
    95,  // 63: COSTA DOCE
    91,  // 64: PLATAFORMA
    94,  // 65: TERMINAL TURÍSTICO
    147, // 66: LAGOA CERQUINHA
    107, // 67: LAGOA RONDINHA
    130, // 68: CAMPING MUNICIPAL
    100, // 69: PRAIA DA PICADA
    124, // 70: PAREDAO (Caçapava)
    115, // 71: SÃO SIMÃO
    21,  // 72: PRAIA NOVA
    142, // 73: PRAIA DA USINA
    108, // 74: PRAINHA DA LAGOA
    109, // 75: LAGOA FORTALEZA
    101, // 76: CRISTAL
    27,  // 77: MAIA FILHO
    114, // 78: RIO SANTA MARIA
    102, // 79: CACHOEIRINHA
    131, // 80: SANTO AMARO
    118, // 81: FERNANDO SCHILING
    87,  // 82: PAREDÃO (Lavras do Sul)
    120, // 83: RAINHA DO SOL
    125, // 84: WALDIR BATAGLIN
    111, // 85: BACUPARI
    85,  // 86: PRAIA ATÍLIO ALÉSSIO
    126, // 87: PRAIA NOVA ? 3
    141, // 88: LAGOA BARROS
    110, // 89: LAGOA PEIXOTO
    82,  // 90: LARANJAL
    80,  // 91: BELÉM NOVO
    81,  // 92: LAMI
    86,  // 93: PASSO DAS TUNAS
    84,  // 94: PRAIA DA CAPILHA
    22,  // 95: INGAZEIROS (RIO JACUÍ)
    97,  // 96: PORTO FERREIRA
    98,  // 97: SANTA VITÓRIA (RIO JACUÍ)
    116, // 98: CAMPING PÚBLICO
    113, // 99: AREIAS BRANCAS
    127, // 100: PASSO DO VERDE (Santa Maria)
    143, // 101: LAGO BATUVA
    112, // 102: LAGOA DOS BARROS (SAP)
    28,  // 103: JACAQUÁ
    103, // 104: PRAIA DO ENCONTRO
    83,  // 105: SÃO LOURENÇO DO SUL
    88,  // 106: PASSO DO JULIÃO2
    148, // 107: PASSO DO VERDE (São Sepé)
    128, // 108: PASSO DO ÚMBU
    19,  // 109: CAMPING CARREIRO
    132, // 110: CENTRAL (CAMPING)
    133, // 111: JACAREZINHO
    104, // 112: PINWEST
    134, // 113: REBELLO
    89,  // 114: PASSO DO ANGICO
    24,  // 115: MONTE ALEGRE
    106, // 116: ITAPUÃ
    136, // 117: PRAIA DA PEDREIRA
    137, // 118: PRAIA DAS POMBAS
    138  // 119: PRAIA DE FORA
  ];

  const op = db.prepare('SELECT id FROM operacoes WHERE numero_operacao = 9 LIMIT 1').get() || { id: 1 };
  console.log('Operação ID alvo:', op.id);

  const url1 = 'https://docs.google.com/spreadsheets/d/1gUzYF0YbFUKl2DMp46Rq0_ghYiNuIichPp_fERWTyHQ/export?format=csv&gid=808564704';
  const url2 = 'https://docs.google.com/spreadsheets/d/1gUzYF0YbFUKl2DMp46Rq0_ghYiNuIichPp_fERWTyHQ/export?format=csv&gid=1223657917';

  console.log('Baixando planilhas...');
  const [t1, t2] = await Promise.all([
    fetch(url1).then(r => r.text()),
    fetch(url2).then(r => r.text())
  ]);

  const lines1 = t1.split('\n');
  const lines2 = t2.split('\n');

  const upsertStmt = db.prepare(`
    INSERT INTO indicadores_diarios (
      operacao_id, balneario_id, data_referencia,
      prevencoes, agua_viva, pessoas_encontradas,
      obitos_mar, obitos_aguas_internas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(operacao_id, balneario_id, data_referencia) DO UPDATE SET
      prevencoes = excluded.prevencoes,
      agua_viva = excluded.agua_viva,
      pessoas_encontradas = excluded.pessoas_encontradas,
      obitos_mar = excluded.obitos_mar,
      obitos_aguas_internas = excluded.obitos_aguas_internas
  `);

  db.exec('BEGIN TRANSACTION;');
  let totalInseridos = 0;
  let datesCount = 0;

  for (let r = 141; r < lines1.length; r++) {
    const row1 = lines1[r].split(',');
    const row2 = lines2[r].split(',');
    const dateStr = row1[0]?.trim();
    const isoDate = parseDate(dateStr);
    if (!isoDate) continue;

    datesCount++;

    // 1. Litoral (17 praias)
    for (let i = 0; i < 17; i++) {
      const bId = litoralBalnIds[i];
      const prev = parseVal(row1[10 + i]);
      const av = parseVal(row1[27 + i]);
      const pe = parseVal(row1[44 + i]);
      const ob = parseVal(row1[61 + i]);

      upsertStmt.run(op.id, bId, isoDate, prev, av, pe, ob, 0);
      totalInseridos++;
    }

    // 2. Águas Internas (59 praias)
    for (let j = 0; j < 59; j++) {
      const bId = internaBalnIds[j];
      const prev = parseVal(row2[61 + j]);
      const pe = parseVal(row2[121 + j]);
      const ob = parseVal(row2[181 + j]);

      upsertStmt.run(op.id, bId, isoDate, prev, 0, pe, 0, ob);
      totalInseridos++;
    }
  }

  db.exec('COMMIT;');
  console.log(`✅ Carga concluída com sucesso!`);
  console.log(`Total de datas processadas: ${datesCount}`);
  console.log(`Total de registros gravados em indicadores_diarios: ${totalInseridos}`);
}

executeImport9();
