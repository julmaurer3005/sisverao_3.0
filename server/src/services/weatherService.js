/**
 * Serviço de Integração com OpenWeatherMap para o SISVERÃO (CBMRS)
 * Chave e parâmetros oficiais utilizados pela Operação Verão do CBMRS.
 */

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '3fdd4dbaabc95616a399ed323326f0ce';

/**
 * Converte graus de direção do vento (0° a 360°) para os 8 quadrantes em Português
 * correspondentes aos termos estatísticos da planilha oficial do CBMRS.
 */
function degToCompass(deg) {
  if (deg === null || deg === undefined) return null;
  const val = Math.floor((deg / 45) + 0.5);
  const arr = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
  return arr[(val % 8)];
}

/**
 * Normaliza o nome da cidade para localização precisa na API OpenWeatherMap
 */
function normalizeCityName(cidade) {
  if (!cidade) return 'Tramandai';
  let clean = cidade.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (/XANGRI/i.test(clean)) clean = 'Xangri-la';
  else if (/CAPAO DA CANOA|CAPAO NOVO/i.test(clean)) clean = 'Capao da Canoa';
  else if (/IMBE/i.test(clean)) clean = 'Imbe';
  else if (/TRAMANDAI/i.test(clean)) clean = 'Tramandai';
  else if (/ARROIO DO SAL/i.test(clean)) clean = 'Arroio do Sal';
  else if (/PINHAL/i.test(clean)) clean = 'Balneario Pinhal';
  else if (/CIDREIRA/i.test(clean)) clean = 'Cidreira';
  else if (/TORRES/i.test(clean)) clean = 'Torres';
  else if (/RIO GRANDE|CASSINO/i.test(clean)) clean = 'Rio Grande';
  else if (/SANTA VITORIA|HERMENEGILDO|CHUI/i.test(clean)) clean = 'Santa Vitoria do Palmar';
  else if (/SAO JOSE DO NORTE/i.test(clean)) clean = 'Sao Jose do Norte';
  else if (/TAVARES/i.test(clean)) clean = 'Tavares';
  else if (/MOSTARDAS/i.test(clean)) clean = 'Mostardas';
  else if (/PELOTAS|LARANJAL/i.test(clean)) clean = 'Pelotas';
  else if (/SAO LOURENCO/i.test(clean)) clean = 'Sao Lourenco do Sul';

  return clean;
}

/**
 * Consulta clima em tempo real para a cidade da ocorrência
 */
async function fetchWeatherForCity(cidade) {
  try {
    const queryCity = normalizeCityName(cidade);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(queryCity)},br&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;
    
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn(`[Weather] Falha ao consultar clima para ${cidade} (${queryCity}): status ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const temp = data?.main?.temp !== undefined ? Math.round(data.main.temp * 10) / 10 : null;
    const condicao = data?.weather?.[0]?.description ? data.weather[0].description : null;
    const ventoGraus = data?.wind?.deg !== undefined ? data.wind.deg : null;
    const ventoVelocidade = data?.wind?.speed !== undefined ? data.wind.speed : null;
    const ventoDirecao = degToCompass(ventoGraus);

    return {
      cidade: data.name || cidade,
      cidade_buscada: queryCity,
      temperatura_c: temp,
      condicao_clima: condicao,
      vento_graus: ventoGraus,
      vento_velocidade_ms: ventoVelocidade,
      vento_direcao: ventoDirecao,
      umidade: data?.main?.humidity,
      pressao: data?.main?.pressure,
      sucesso: true
    };
  } catch (err) {
    console.error(`[Weather] Erro na consulta do clima:`, err.message);
    return null;
  }
}

module.exports = {
  fetchWeatherForCity,
  degToCompass,
  normalizeCityName
};
