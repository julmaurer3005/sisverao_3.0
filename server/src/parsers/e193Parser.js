/**
 * Parser inteligente de relatórios copiados do modal do e193 (CBMRS)
 */
function parseE193Occurrence(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Texto do relatório não informado');
  }

  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const result = {
    num_ocorrencia: null,
    hora_registro: null,
    data_ocorrencia: null,
    hora_ocorrencia: null,
    dia_semana: null,
    praia: null,
    guarita: null,
    cidade: null,
    tipo_salvamento: 'RESGATE',
    grau_afogamento: null,
    gv_preencheu: null,
    guarda_vidas: [],
    historico_ocorrencia: null,
    vitima_nome: 'Não Informado',
    vitima_idade: null,
    vitima_sexo: 'Não Informado',
    vitima_naturalidade: null,
    vitima_uf: null,
    vitima_perfil: {},
    distancia_esquerda_m: 0,
    distancia_direita_m: 0,
    local_ocorrencia: null,
    equipamentos_empregados: null,
    usou_motoaquatica: false,
    bandeira: 'AMARELA',
    perigos_associados: null,
    vento_direcao: null,
    condicao_clima: null
  };

  // 1. Extração de campos chave com Regex flexível
  const getField = (pattern) => {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  };

  // Nº de Registro
  const numOco = getField(/N[º°]\s*DE\s*REGISTRO:\s*(\d+)/i);
  if (numOco) result.num_ocorrencia = parseInt(numOco, 10);

  // Hora do Registro
  const horaReg = getField(/Hora\s*do\s*Registro:\s*([\d\- :]+)/i);
  if (horaReg) result.hora_registro = horaReg;

  // Data da Ocorrência
  const dataOco = getField(/DATA:\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (dataOco) {
    const [d, m, y] = dataOco.split('/');
    result.data_ocorrencia = `${y}-${m}-${d}`;
  }

  // Horário
  const horaOco = getField(/HORARIO:\s*(\d{2}:\d{2})/i);
  if (horaOco) result.hora_ocorrencia = horaOco;

  // Dia da Semana
  result.dia_semana = getField(/DIA\s*DA\s*SEMANA:\s*([^\n]+)/i);

  // Praia / Balneário
  const rawPraia = getField(/PRAIA:\s*([^\n]+)/i);
  if (rawPraia) {
    result.praia = rawPraia.replace(/\s*(GUARITA|CIDADE|COD|BBM|GRAU):.*$/i, '').trim();
  }

  // Guarita
  const rawGuarita = getField(/GUARITA:\s*([^\n]+)/i);
  if (rawGuarita) {
    result.guarita = rawGuarita.replace(/\s*(CIDADE|PRAIA|COD|BBM|GRAU):.*$/i, '').trim();
  }

  // Cidade
  const rawCidade = getField(/CIDADE:\s*([^\n]+)/i);
  if (rawCidade) {
    result.cidade = rawCidade.replace(/\s*(COD|DE|OCORR[ÊE]NCIA|PRAIA|GUARITA|GRAU):.*$/i, '').trim();
  }

  // Tipo de Ocorrência
  const tipoOco = getField(/COD\.\s*DE\s*OCORR[ÊE]NCIA:\s*([^\n]+)/i);
  if (tipoOco) {
    result.tipo_salvamento = tipoOco.toUpperCase();
  }

  // Grau
  const grau = getField(/GRAU:\s*([^\n]+)/i);
  if (grau && !grau.toLowerCase().includes('sem grau')) {
    const numGrau = grau.match(/\d+/);
    if (numGrau) result.grau_afogamento = parseInt(numGrau[0], 10);
  }

  // GV que preencheu formulário
  result.gv_preencheu = getField(/G\.V\.\s*QUE\s*PREENCHEU\s*FORMUL[ÁA]RIO:\s*([^\n]+)/i);

  // Guarda-Vidas que atuaram
  const gvBlockMatch = text.match(/GUARDA-VIDAS\s*QUE\s*ATUARAM[\s\S]*?(?=HIST[ÓO]RICO\s*DA\s*OCORR[ÊE]NCIA|DADOS\s*V[ÍI]TIMA|$)/i);
  if (gvBlockMatch) {
    const gvBlock = gvBlockMatch[0];
    const idMatches = [...gvBlock.matchAll(/ID\s*FUNC\/CPF:\s*([^\n]+)\s*NOME:\s*([^\n]+)\s*POSTO:\s*([^\n]+)/gi)];
    for (const match of idMatches) {
      result.guarda_vidas.push({
        id_funcional: match[1].trim(),
        nome: match[2].trim(),
        posto: match[3].trim()
      });
    }
  }

  // Histórico da Ocorrência
  const histMatch = text.match(/HIST[ÓO]RICO\s*DA\s*OCORR[ÊE]NCIA\s*([\s\S]*?)(?=DADOS\s*V[ÍI]TIMA|$)/i);
  if (histMatch) {
    result.historico_ocorrencia = histMatch[1].trim();
  }

  // Dados da Vítima
  const nomeVitima = getField(/NOME\s*DA\s*V[ÍI]TIMA:\s*([^\n]+)/i);
  if (nomeVitima) result.vitima_nome = nomeVitima;

  const idadeVitima = getField(/IDADE:\s*(\d+)/i);
  if (idadeVitima) result.vitima_idade = parseInt(idadeVitima, 10);

  const sexoVitima = getField(/SEXO:\s*([^\n]+)/i);
  if (sexoVitima) {
    const s = sexoVitima.toUpperCase();
    if (s.startsWith('F')) result.vitima_sexo = 'F';
    else if (s.startsWith('M')) result.vitima_sexo = 'M';
    else result.vitima_sexo = 'Não Informado';
  }

  result.vitima_naturalidade = getField(/NATURALIDADE:\s*([^\n]+)/i);
  result.vitima_uf = getField(/ESTADO:\s*([A-Za-z]{2})/i);

  // Perfil da Vítima
  result.vitima_perfil = {
    familiaridade: getField(/FAMILIAR(?:I)?EDADE\s*COM\s*A\s*PRAIA:\s*([^\n]+)/i),
    tipo_usuario: getField(/TIPO\s*DE\s*USU[ÁA]RIO:\s*([^\n]+)/i),
    habilidade_natacao: getField(/HABILIDADE\s*DE\s*NATA[ÇC][ÃA]O:\s*([^\n]+)/i),
    situacao: getField(/SITUA[ÇC][ÃA]O\s*DA\s*V[ÍI]TIMA:\s*([^\n]+)/i),
    comportamento: getField(/COMPORTAMENTO\s*DA\s*V[ÍI]TIMA:\s*([^\n]+)/i),
    lesoes: getField(/LES[ÕO]ES\s*ASSOCIADAS\s*AO\s*ACIDENTE:\s*([^\n]+)/i),
    abordagem: getField(/ABORDAGEM:\s*([^\n]+)/i)
  };

  // Distância da Guarita
  const distEsq = getField(/[ÀA]\s*ESQUERDA\s*\(m\):\s*(\d+)/i);
  if (distEsq) result.distancia_esquerda_m = parseInt(distEsq, 10);

  const distDir = getField(/[ÀA]\s*DIREITA\s*\(m\):\s*(\d+)/i);
  if (distDir) result.distancia_direita_m = parseInt(distDir, 10);

  // Dados do Resgate
  result.local_ocorrencia = getField(/LOCAL\s*DA\s*OCORR[ÊE]NCIA:\s*([^\n]+)/i);
  
  const equip = getField(/EQUIPAMENTO\s*EMPREGADO\s*NO\s*RESGATE:\s*([^\n]+)/i);
  if (equip) {
    result.equipamentos_empregados = equip;
    if (/MOTO\s*AQU[ÁA]TICA|JET\s*SKI/i.test(equip)) {
      result.usou_motoaquatica = true;
    }
  }

  // Se o histórico mencionar Jet Ski ou Motoaquática
  if (result.historico_ocorrencia && /JET\s*SKI|MOTO\s*AQU[ÁA]TICA/i.test(result.historico_ocorrencia)) {
    result.usou_motoaquatica = true;
  }

  const bandeira = getField(/BANDEIRA\s*SINALIZADA\s*NO\s*POSTO:\s*([^\n]+)/i);
  if (bandeira) {
    const b = bandeira.toUpperCase();
    if (b.includes('VERDE')) result.bandeira = 'VERDE';
    else if (b.includes('VERMELHA')) result.bandeira = 'VERMELHA';
    else if (b.includes('PRETA')) result.bandeira = 'PRETA';
    else if (b.includes('NÃO') || b.includes('NAO')) result.bandeira = 'NÃO HAVIA';
    else result.bandeira = 'AMARELA';
  }

  result.perigos_associados = getField(/PERIGOS\s*DA\s*PRAIA\s*ASSOCIADOS\s*AO\s*ACIDENTE:\s*([^\n]+)/i);

  // Dados Praia
  result.condicao_clima = getField(/CONDI[ÇC][ÕO]ES\s*METEOROL[ÓO]GICAS:\s*([^\n]+)/i);
  result.vento_direcao = getField(/DIRE[ÇC][ÃA]O\s*DO\s*VENTO:\s*([^\n]+)/i);

  return result;
}

module.exports = { parseE193Occurrence };
