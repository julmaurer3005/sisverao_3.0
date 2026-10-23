import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Camera, Copy, Check } from 'lucide-react';

export default function CardResumoGeral({ data }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data || !data.card1_geral) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Carregando dados do consolidado...</div>;
  }

  const { operacao_numero, ano_operacao, data_referencia, card1_geral } = data;
  const { dia, acumulado, comparativo, obitos } = card1_geral;

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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `resumo-geral-${operacao_numero}op-${data_referencia}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    let t = `📢 *${operacao_numero}ª OPERAÇÃO VERÃO (${ano_operacao}) — CONSOLIDADO OFICIAL*\n`;
    t += `📅 *Atendimentos em ${formatDateHeader(data_referencia)}*\n\n`;
    t += `🟢 *TOTAL DO DIA:*\n`;
    t += `• Salvamentos: ${dia?.totais?.geral?.salvamentos ?? 0}\n`;
    t += `• Prevenções: ${(dia?.totais?.geral?.prevencoes ?? 0).toLocaleString()}\n`;
    t += `• Pessoas Encontradas: ${dia?.totais?.geral?.pessoas_encontradas ?? 0}\n`;
    t += `• Lesões por Água-Viva: ${(dia?.totais?.geral?.agua_viva ?? 0).toLocaleString()}\n`;
    t += `• Óbitos: ${dia?.totais?.geral?.obitos ?? 0}\n\n`;
    t += `🟠 *ACUMULADO DA OPERAÇÃO:*\n`;
    t += `• Salvamentos: ${(acumulado?.totais?.geral?.salvamentos ?? 0).toLocaleString()}\n`;
    t += `• Prevenções: ${(acumulado?.totais?.geral?.prevencoes ?? 0).toLocaleString()}\n`;
    t += `• Pessoas Encontradas: ${(acumulado?.totais?.geral?.pessoas_encontradas ?? 0).toLocaleString()}\n`;
    t += `• Lesões por Água-Viva: ${(acumulado?.totais?.geral?.agua_viva ?? 0).toLocaleString()}\n`;
    t += `• Óbitos Totais: ${acumulado?.totais?.geral?.obitos ?? 0}\n\n`;
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

      {/* Cartaz Oficial Idêntico à Imagem 1 */}
      <div ref={cardRef} className="cartaz-oficial-wrapper" style={{ width: '640px', background: '#0e1726', color: 'white', fontFamily: 'Arial, sans-serif', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
        {/* Cabeçalho do Cartaz */}
        <div style={{ background: '#1c2e4a', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '9px', textTransform: 'lowercase', color: '#ff7b00', fontWeight: 'bold' }}>operação</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#ff3b30' }}>verão</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#00b4d8' }}>total</span>
            </div>
            <div style={{ marginLeft: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{operacao_numero}ª Op. Verão</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }}>{ano_operacao}</div>
            </div>
          </div>

          {/* Cabeçalho de Colunas */}
          <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px', fontSize: '9px', fontWeight: 'bold', color: '#e2e8f0' }}>
            <div>Salvamentos</div>
            <div>Prevenções</div>
            <div>Pessoas<br/>encontradas</div>
            <div>Lesão<br/>Água-viva</div>
            <div>Óbitos</div>
          </div>
        </div>

        {/* 1. SEÇÃO VERDE: ATENDIMENTOS DO DIA */}
        <div style={{ display: 'flex', background: '#2d5a27', borderBottom: '2px solid #000' }}>
          {/* Barra Lateral Vertical */}
          <div style={{
            width: '32px',
            background: '#23471e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#fff',
            letterSpacing: '1px',
            padding: '8px 0'
          }}>
            Atendimentos em {formatDateHeader(data_referencia)}
          </div>

          <div style={{ flex: 1, padding: '4px 8px 4px 0' }}>
            {/* Litoral Norte */}
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#dcfce7', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', paddingTop: '10px' }}>
                Lit. Norte
              </div>
              <div style={{ flex: 1 }}>
                {dia.norte.map((r, i) => (
                  <div key={r.balneario} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', fontSize: '10px', background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                    <span style={{ width: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.balneario}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                      <span style={{ fontWeight: r.salvamentos ? 'bold' : 'normal', color: r.salvamentos ? '#ffea00' : 'inherit' }}>{r.salvamentos}</span>
                      <span>{r.prevencoes}</span>
                      <span>{r.pessoas_encontradas}</span>
                      <span>{r.agua_viva}</span>
                      <span>{r.obitos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Litoral Sul */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '4px' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#dcfce7', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
                Lit. Sul
              </div>
              <div style={{ flex: 1 }}>
                {dia.sul.map((r, i) => (
                  <div key={r.balneario} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', fontSize: '10px', background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                    <span style={{ width: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.balneario}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                      <span style={{ fontWeight: r.salvamentos ? 'bold' : 'normal', color: r.salvamentos ? '#ffea00' : 'inherit' }}>{r.salvamentos}</span>
                      <span>{r.prevencoes}</span>
                      <span>{r.pessoas_encontradas}</span>
                      <span>{r.agua_viva}</span>
                      <span>{r.obitos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totais do Dia */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '4px' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#fff', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
                Totais
              </div>
              <div style={{ flex: 1, fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px' }}>
                  <span style={{ width: '130px', fontWeight: 'bold' }}>Litoral Norte</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px', fontWeight: 'bold' }}>
                    <span>{dia?.totais?.norte?.salvamentos ?? 0}</span>
                    <span>{dia?.totais?.norte?.prevencoes ?? 0}</span>
                    <span>{dia?.totais?.norte?.pessoas_encontradas ?? 0}</span>
                    <span>{dia?.totais?.norte?.agua_viva ?? 0}</span>
                    <span>{dia?.totais?.norte?.obitos ?? 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px' }}>
                  <span style={{ width: '130px', fontWeight: 'bold' }}>Litoral Sul</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px', fontWeight: 'bold' }}>
                    <span>{dia?.totais?.sul?.salvamentos ?? 0}</span>
                    <span>{dia?.totais?.sul?.prevencoes ?? 0}</span>
                    <span>{dia?.totais?.sul?.pessoas_encontradas ?? 0}</span>
                    <span>{dia?.totais?.sul?.agua_viva ?? 0}</span>
                    <span>{dia?.totais?.sul?.obitos ?? 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px' }}>
                  <span style={{ width: '130px', fontWeight: 'bold' }}>Águas Internas</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px', fontWeight: 'bold' }}>
                    <span>{dia?.totais?.ai?.salvamentos ?? 0}</span>
                    <span>{dia?.totais?.ai?.prevencoes ?? 0}</span>
                    <span>{dia?.totais?.ai?.pessoas_encontradas ?? 0}</span>
                    <span>0</span>
                    <span>{dia?.totais?.ai?.obitos ?? 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 4px', background: 'rgba(0,0,0,0.3)', fontWeight: 900, fontSize: '11px', marginTop: '2px' }}>
                  <span style={{ width: '130px' }}>Total Dia</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                    <span style={{ color: '#ffea00' }}>{dia?.totais?.geral?.salvamentos ?? 0}</span>
                    <span>{dia?.totais?.geral?.prevencoes ?? 0}</span>
                    <span>{dia?.totais?.geral?.pessoas_encontradas ?? 0}</span>
                    <span>{dia?.totais?.geral?.agua_viva ?? 0}</span>
                    <span>{dia?.totais?.geral?.obitos ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEÇÃO OCRE / DOURADA: ACUMULADO DA OPERAÇÃO */}
        <div style={{ display: 'flex', background: '#996515', borderBottom: '2px solid #000' }}>
          {/* Barra Lateral Vertical */}
          <div style={{
            width: '32px',
            background: '#7c5211',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#fff',
            letterSpacing: '1px',
            padding: '8px 0'
          }}>
            Acumulado da Operação
          </div>

          <div style={{ flex: 1, padding: '4px 8px 4px 0' }}>
            {/* Litoral Norte Acumulado */}
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#fef08a', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', paddingTop: '10px' }}>
                Lit. Norte
              </div>
              <div style={{ flex: 1 }}>
                {acumulado.norte.map((r, i) => (
                  <div key={r.balneario} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', fontSize: '10px', background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                    <span style={{ width: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.balneario}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>{r.salvamentos}</span>
                      <span>{r.prevencoes}</span>
                      <span>{r.pessoas_encontradas}</span>
                      <span>{r.agua_viva}</span>
                      <span>{r.obitos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Litoral Sul Acumulado */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '4px' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#fef08a', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
                Lit. Sul
              </div>
              <div style={{ flex: 1 }}>
                {acumulado.sul.map((r, i) => (
                  <div key={r.balneario} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', fontSize: '10px', background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                    <span style={{ width: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.balneario}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>{r.salvamentos}</span>
                      <span>{r.prevencoes}</span>
                      <span>{r.pessoas_encontradas}</span>
                      <span>{r.agua_viva}</span>
                      <span>{r.obitos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totais Acumulado */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '4px' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#fff', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
                Totais
              </div>
              <div style={{ flex: 1, fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', fontWeight: 'bold' }}>
                  <span style={{ width: '130px' }}>Litoral Norte</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                    <span>{acumulado?.totais?.norte?.salvamentos ?? 0}</span>
                    <span>{acumulado?.totais?.norte?.prevencoes ?? 0}</span>
                    <span>{acumulado?.totais?.norte?.pessoas_encontradas ?? 0}</span>
                    <span>{acumulado?.totais?.norte?.agua_viva ?? 0}</span>
                    <span>{acumulado?.totais?.norte?.obitos ?? 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', fontWeight: 'bold' }}>
                  <span style={{ width: '130px' }}>Litoral Sul</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                    <span>{acumulado?.totais?.sul?.salvamentos ?? 0}</span>
                    <span>{acumulado?.totais?.sul?.prevencoes ?? 0}</span>
                    <span>{acumulado?.totais?.sul?.pessoas_encontradas ?? 0}</span>
                    <span>{acumulado?.totais?.sul?.agua_viva ?? 0}</span>
                    <span>{acumulado?.totais?.sul?.obitos ?? 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', fontWeight: 'bold' }}>
                  <span style={{ width: '130px' }}>Águas Internas</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                    <span>{acumulado?.totais?.ai?.salvamentos ?? 0}</span>
                    <span>{acumulado?.totais?.ai?.prevencoes ?? 0}</span>
                    <span>{acumulado?.totais?.ai?.pessoas_encontradas ?? 0}</span>
                    <span>0</span>
                    <span>{acumulado?.totais?.ai?.obitos ?? 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 4px', background: 'rgba(0,0,0,0.3)', fontWeight: 900, fontSize: '11px', marginTop: '2px' }}>
                  <span style={{ width: '130px' }}>Total acumul.</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 75px 65px 45px', textAlign: 'right', gap: '4px' }}>
                    <span style={{ color: '#ffea00' }}>{acumulado?.totais?.geral?.salvamentos ?? 0}</span>
                    <span>{acumulado?.totais?.geral?.prevencoes ?? 0}</span>
                    <span>{acumulado?.totais?.geral?.pessoas_encontradas ?? 0}</span>
                    <span>{acumulado?.totais?.geral?.agua_viva ?? 0}</span>
                    <span>{acumulado?.totais?.geral?.obitos ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SEÇÃO AZUL PETRÓLEO: COMPARATIVO ACUMULADO ENTRE OPERAÇÕES */}
        <div style={{ display: 'flex', background: '#1c2a38', borderBottom: '2px solid #000' }}>
          {/* Barra Lateral Vertical */}
          <div style={{
            width: '32px',
            background: '#15212c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontWeight: 'bold',
            fontSize: '11px',
            color: '#fff',
            letterSpacing: '1px',
            padding: '8px 0'
          }}>
            Comparativo Acumulado entre Operações
          </div>

          <div style={{ flex: 1, padding: '6px 8px 6px 0' }}>
            {/* Header de Operações Comparadas */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px', fontSize: '9px', fontWeight: 'bold', color: '#93c5fd' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 80px 80px', textAlign: 'center', gap: '4px' }}>
                <div>6ª Op. Verão</div>
                <div>7ª Op. Verão</div>
                <div>8ª Op. Verão</div>
                <div style={{ color: '#ffea00' }}>9ª Op. Verão</div>
              </div>
            </div>

            {/* Lit. Norte Comparativo */}
            <div style={{ display: 'flex', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#93c5fd', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
                Lit. Norte
              </div>
              <div style={{ flex: 1, fontSize: '10px' }}>
                {['Salvamentos', 'Óbitos', 'Prevenções', 'Pessoas encontradas', 'Lesões por água viva'].map((metrica, idx) => {
                  const keyMap = ['salvamentos', 'obitos', 'prevencoes', 'pessoas_encontradas', 'agua_viva'];
                  const vals = comparativo.norte[keyMap[idx]] || [];
                  return (
                    <div key={metrica} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', background: idx % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                      <span style={{ width: '140px' }}>{metrica}</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 80px 80px', textAlign: 'center', gap: '4px' }}>
                        <span>{vals[0]}</span>
                        <span>{vals[1]}</span>
                        <span>{vals[2]}</span>
                        <span style={{ fontWeight: 'bold', color: '#ffea00' }}>{vals[3]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lit. Sul Comparativo */}
            <div style={{ display: 'flex', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '4px' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#93c5fd', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
                Lit. Sul
              </div>
              <div style={{ flex: 1, fontSize: '10px' }}>
                {['Salvamentos', 'Óbitos', 'Prevenções', 'Pessoas encontradas', 'Lesões por água viva'].map((metrica, idx) => {
                  const keyMap = ['salvamentos', 'obitos', 'prevencoes', 'pessoas_encontradas', 'agua_viva'];
                  const vals = comparativo.sul[keyMap[idx]] || [];
                  return (
                    <div key={metrica} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', background: idx % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                      <span style={{ width: '140px' }}>{metrica}</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 80px 80px', textAlign: 'center', gap: '4px' }}>
                        <span>{vals[0]}</span>
                        <span>{vals[1]}</span>
                        <span>{vals[2]}</span>
                        <span style={{ fontWeight: 'bold', color: '#ffea00' }}>{vals[3]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Águas Internas Comparativo */}
            <div style={{ display: 'flex', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '4px' }}>
              <div style={{ width: '22px', fontSize: '8px', color: '#93c5fd', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' }}>
                Á. Internas
              </div>
              <div style={{ flex: 1, fontSize: '10px' }}>
                {['Salvamentos', 'Óbitos', 'Prevenções', 'Pessoas encontradas'].map((metrica, idx) => {
                  const keyMap = ['salvamentos', 'obitos', 'prevencoes', 'pessoas_encontradas'];
                  const vals = comparativo.ai[keyMap[idx]] || [];
                  return (
                    <div key={metrica} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 4px', background: idx % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                      <span style={{ width: '140px' }}>{metrica}</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 80px 80px', textAlign: 'center', gap: '4px' }}>
                        <span>{vals[0]}</span>
                        <span>{vals[1]}</span>
                        <span>{vals[2]}</span>
                        <span style={{ fontWeight: 'bold', color: '#ffea00' }}>{vals[3]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 4. FOOTER: ÓBITOS POR AFOGAMENTO E MESES */}
        <div style={{ background: '#dbeafe', color: '#0f172a', padding: '8px 12px', fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px', color: '#1e3a8a' }}>
            ÓBITOS POR AFOGAMENTO
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '4px' }}>
            <span>MAR: <strong>{obitos.mar}</strong></span>
            <span>Á. INTERNAS: <strong>{obitos.aguas_internas}</strong></span>
          </div>
          <div style={{ fontSize: '9px', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>
            <div>DURANTE O MÊS DE DEZEMBRO, O ACUMULADO DE MORTES POR AFOGAMENTO É DE <strong>{obitos.mes_dezembro}</strong></div>
            <div>DURANTE O MÊS DE JANEIRO, O ACUMULADO DE MORTES POR AFOGAMENTO É DE <strong>{obitos.mes_janeiro}</strong></div>
            <div>DURANTE O MÊS DE FEVEREIRO, O ACUMULADO DE MORTES POR AFOGAMENTO É DE <strong>{obitos.mes_fevereiro}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
