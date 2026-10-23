import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Camera, Copy, Check } from 'lucide-react';

export default function CardResumoAIDia({ data }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data || !data.card3_ai_dia) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Carregando dados de Águas Internas (Dia)...</div>;
  }

  const { operacao_numero, ano_operacao, data_referencia, card3_ai_dia } = data;
  const { itens, totais } = card3_ai_dia;

  const formatDateHeader = (dStr) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-');
      const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return `${parseInt(d, 10)}/${meses[parseInt(m, 10) - 1]}`;
    } catch {
      return dStr;
    }
  };

  // 1. Extração numérica do BBM para agrupamento e ordenação estrita (1º a 13º BBM)
  const getBbmNum = (bbmStr) => {
    const m = (bbmStr || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 999;
  };

  // 2. Agrupa todos os municípios e praias de um batalhão no mesmo bloco (sem fragmentação)
  const bbmMap = new Map();
  itens.forEach(item => {
    const num = getBbmNum(item.bbm);
    const canonicalBbm = `${num}º BBM`;
    if (!bbmMap.has(num)) {
      bbmMap.set(num, {
        bbmNum: num,
        bbm: canonicalBbm,
        rows: []
      });
    }
    bbmMap.get(num).rows.push({
      ...item,
      bbm: canonicalBbm
    });
  });

  // 3. Ordena os batalhões rigorosamente na sequência 1º, 2º, 3º ... 13º BBM
  const bbmsAgrupados = Array.from(bbmMap.values()).sort((a, b) => a.bbmNum - b.bbmNum);

  // 4. Ordena as cidades e praias dentro de cada BBM
  bbmsAgrupados.forEach(group => {
    group.rows.sort((a, b) => {
      const cmpCid = (a.municipio || '').localeCompare(b.municipio || '', 'pt-BR');
      if (cmpCid !== 0) return cmpCid;
      return (a.balneario || '').localeCompare(b.balneario || '', 'pt-BR');
    });
  });


  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `resumo-ai-dia-${operacao_numero}op-${data_referencia}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    let t = `📢 *${operacao_numero}ª OPERAÇÃO VERÃO (${ano_operacao})*\n`;
    t += `📅 *ATENDIMENTOS DO DIA EM ${formatDateHeader(data_referencia)} — ÁGUAS INTERNAS*\n\n`;
    bbmsAgrupados.forEach(g => {
      t += `📍 *${g.bbm}*\n`;
      g.rows.forEach(r => {
        if (r.salvamentos > 0 || r.prevencoes > 0 || r.pessoas_encontradas > 0) {
          t += `• ${r.municipio} - ${r.balneario}: ${r.salvamentos} salv | ${r.prevencoes} prev | ${r.pessoas_encontradas} pess. | ${r.obitos} ób\n`;
        }
      });
      t += `\n`;
    });
    t += `👉 *TOTAL DO DIA ÁGUAS INTERNAS:*\n`;
    t += `• Salvamentos: ${totais.salvamentos}\n`;
    t += `• Prevenções: ${totais.prevencoes.toLocaleString()}\n`;
    t += `• Pessoas Encontradas: ${totais.pessoas_encontradas}\n`;
    t += `• Óbitos: ${totais.obitos}\n\n`;
    t += `_Corpo de Bombeiros Militar do RS (CBMRS)_`;

    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      {/* Botões de Ação */}
      <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '640px', justifyContent: 'space-between' }}>
        <button onClick={handleDownload} disabled={downloading} className="btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
          <Camera size={15} />
          {downloading ? 'Gerando Imagem...' : '📸 Baixar Imagem (PNG)'}
        </button>
        <button onClick={handleCopyText} className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
          {copied ? <Check size={15} color="#2ec4b6" /> : <Copy size={15} />}
          {copied ? 'Copiado para WhatsApp!' : '📋 Copiar Texto Formatado'}
        </button>
      </div>

      {/* Cartaz Oficial Idêntico à Imagem 3 */}
      <div
        ref={cardRef}
        style={{
          width: '640px',
          background: '#2d5a27',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Topo / Logo e Cabeçalho de Colunas */}
        <div
          style={{
            padding: '8px 10px 8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid rgba(0,0,0,0.3)',
            background: '#24481f',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '9px', textTransform: 'lowercase', color: '#ffea00', fontWeight: 'bold' }}>operação</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#ff3b30' }}>verão</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00b4d8' }}>total</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '72px 72px 76px 50px',
              textAlign: 'right',
              gap: '6px',
              fontSize: '9px',
              fontWeight: 'bold',
              color: '#fff',
              width: '288px',
              flexShrink: 0,
              boxSizing: 'border-box',
              alignItems: 'end'
            }}
          >
            <div style={{ paddingRight: '2px' }}>Salvamentos</div>
            <div style={{ paddingRight: '2px' }}>Prevenções</div>
            <div style={{ paddingRight: '2px', lineHeight: 1.1 }}>Pessoas<br/>encontradas</div>
            <div style={{ paddingRight: '2px' }}>Óbitos</div>
          </div>
        </div>

        {/* Corpo com Barra Lateral e Tabela dos 13 BBMs */}
        <div style={{ display: 'flex', width: '100%', boxSizing: 'border-box' }}>
          {/* Barra Lateral Vertical Verde */}
          <div
            style={{
              width: '30px',
              flexShrink: 0,
              background: '#1d3b19',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontWeight: 'bold',
              fontSize: '12px',
              color: '#fff',
              letterSpacing: '1px',
              padding: '12px 0',
              boxSizing: 'border-box'
            }}
          >
            Atendimentos em {formatDateHeader(data_referencia)}
          </div>

          {/* Tabela dos 13 BBMs */}
          <div style={{ flex: 1, minWidth: 0, padding: '4px 10px 4px 6px', boxSizing: 'border-box' }}>
            {bbmsAgrupados.map((grupo) => (
              <div
                key={grupo.bbm}
                style={{
                  display: 'flex',
                  width: '100%',
                  borderBottom: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(0,0,0,0.06)',
                  boxSizing: 'border-box'
                }}
              >
                {/* Coluna do BBM */}
                <div
                  style={{
                    width: '60px',
                    flexShrink: 0,
                    background: 'rgba(0,0,0,0.22)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: '#dcfce7',
                    borderRight: '1px solid rgba(255,255,255,0.18)',
                    padding: '2px 4px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {grupo.bbm}
                </div>

                {/* Linhas de Municípios e Balneários do BBM */}
                <div style={{ flex: 1, minWidth: 0, boxSizing: 'border-box' }}>
                  {grupo.rows.map((row, rIdx) => (
                    <div
                      key={`${row.municipio}-${row.balneario}-${rIdx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '2px 0 2px 6px',
                        fontSize: '9.5px',
                        borderBottom: rIdx < grupo.rows.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                        background: rIdx % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: 0, paddingRight: '6px', alignItems: 'center' }}>
                        <span
                          style={{
                            fontWeight: 'bold',
                            width: '115px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={row.municipio}
                        >
                          {row.municipio}
                        </span>
                        <span
                          style={{
                            color: '#bbf7d0',
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={row.balneario}
                        >
                          {row.balneario}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '72px 72px 76px 50px',
                          textAlign: 'right',
                          gap: '6px',
                          width: '288px',
                          flexShrink: 0,
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ fontWeight: row.salvamentos ? 'bold' : 'normal', color: row.salvamentos ? '#ffea00' : 'inherit', paddingRight: '2px' }}>
                          {row.salvamentos}
                        </span>
                        <span style={{ paddingRight: '2px' }}>{(row.prevencoes || 0).toLocaleString()}</span>
                        <span style={{ paddingRight: '2px' }}>{row.pessoas_encontradas}</span>
                        <span style={{ paddingRight: '2px' }}>{row.obitos}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Totalizador Geral do Dia de Águas Internas */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '5px 0 5px 6px',
                background: '#193415',
                fontWeight: 900,
                fontSize: '10.5px',
                marginTop: '4px',
                borderTop: '2px solid rgba(0,0,0,0.4)',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ paddingLeft: '2px' }}>TOTAL DIA ÁGUAS INTERNAS</span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 72px 76px 50px',
                  textAlign: 'right',
                  gap: '6px',
                  width: '288px',
                  flexShrink: 0,
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ color: '#ffea00', paddingRight: '2px' }}>{totais.salvamentos}</span>
                <span style={{ paddingRight: '2px' }}>{(totais.prevencoes || 0).toLocaleString()}</span>
                <span style={{ paddingRight: '2px' }}>{totais.pessoas_encontradas}</span>
                <span style={{ paddingRight: '2px' }}>{totais.obitos}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
