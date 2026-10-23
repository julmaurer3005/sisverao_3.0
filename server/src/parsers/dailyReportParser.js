/**
 * Parser para o "RELATÓRIO GERAL DA OPERAÇÃO VERÃO" (Aba COLAR AQUI)
 */
function parseDailyReport(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Texto do relatório geral não informado');
  }

  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n');

  // 1. Extração do período / data de referência
  let dataReferencia = null;
  const periodoMatch = text.match(/PER[ÍI]ODO\s*DE\s*(\d{2}\/\d{2}\/\d{4})\s*A\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (periodoMatch) {
    // Usa a data final do período como data de referência
    const [d, m, y] = periodoMatch[2].split('/');
    dataReferencia = `${y}-${m}-${d}`;
  } else {
    // Se não achar período, tenta qualquer data no cabeçalho ou usa a data atual
    const anyDate = text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (anyDate) {
      const [d, m, y] = anyDate[1].split('/');
      dataReferencia = `${y}-${m}-${d}`;
    } else {
      dataReferencia = new Date().toISOString().split('T')[0];
    }
  }

  const items = [];
  let currentBBM = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detecta mudança de BBM (Ex: "1º BBM", "9º BBM")
    const bbmMatch = line.match(/^(\d+[º°]?\s*BBM)/i);
    if (bbmMatch && !line.includes('TOTAL')) {
      currentBBM = bbmMatch[1].replace('°', 'º');
      continue;
    }

    // Ignora cabeçalhos de colunas ou linhas de total
    if (
      line.startsWith('Município') ||
      line.startsWith('COMANDO') ||
      line.startsWith('RELATÓRIO') ||
      line.startsWith('PERÍODO') ||
      line.startsWith('TOTAL') ||
      line.startsWith('BATALHÃO') ||
      line.startsWith('"OS VALORES') ||
      line.startsWith('Legenda')
    ) {
      continue;
    }

    // Suporta linhas separadas por vírgula (CSV) ou tabulação (copiado direto da planilha/tabela)
    let parts = [];
    if (line.includes('\t')) {
      parts = line.split('\t').map((p) => p.trim());
    } else if (line.includes(',')) {
      // split simples de csv respeitando aspas básicas
      parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    }

    // Deve ter pelo menos Município, Balneário e contadores
    if (parts.length >= 10 && parts[0] && parts[1]) {
      const municipio = parts[0];
      const balneario = parts[1];

      // Se for linha de TOTAL do BBM, pula
      if (municipio.toUpperCase().includes('TOTAL') || balneario.toUpperCase().includes('TOTAL')) {
        continue;
      }

      const getNum = (idx) => (idx < parts.length && !isNaN(parseInt(parts[idx], 10)) ? parseInt(parts[idx], 10) : 0);

      // Mapeamento das colunas:
      // Município,Balneário / Posto,GV,RES,ARAD,ARAS,AMAD,AMAS,EMDV,LMPC,CRPR,LCAV,VTIS,QPRS,PREV,NAEM,APH,TOTAL
      const gv = getNum(2);
      const res = getNum(3);
      const arad = getNum(4);
      const aras = getNum(5);
      const amad = getNum(6);
      const amas = getNum(7);
      const emdv = getNum(8);
      const lmpc = getNum(9);
      const crpr = getNum(10); // Crianças perdidas / pessoas encontradas
      const lcav = getNum(11); // Água-viva
      const vtis = getNum(12); // Insolação
      const qprs = getNum(13); // Queimadura solar
      const prev = getNum(14); // Prevenções
      const naem = getNum(15); // Naufrágio
      const aph = getNum(16);  // APH

      items.push({
        bbm: currentBBM || '9º BBM',
        municipio,
        balneario,
        gv,
        res,
        arad,
        aras,
        amad,
        amas,
        obitos_mar: amas,
        obitos_ai: amad,
        emdv,
        lmpc,
        crpr,
        lcav,
        vtis,
        qprs,
        prev,
        naem,
        aph
      });
    }
  }

  return {
    data_referencia: dataReferencia,
    total_registros: items.length,
    items
  };
}

module.exports = { parseDailyReport };
