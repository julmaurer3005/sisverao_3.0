import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Camera, Copy, Check, Settings2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

// Importação do template mestre gerado a partir de Frame 3.png (1080 x 1920 Full HD)
import cardBaseFrame3 from '../assets/card_base_frame3.png';

export default function CardResumoDivulgacao({ data }) {
  const cardRef = useRef(null);
  const wrapperRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [scale, setScale] = useState(0.5);

  // Campos complementares configuráveis pelo usuário (com os valores padrão do modelo oficial)
  const [guaritasNorte, setGuaritasNorte] = useState(180);
  const [guaritasSul, setGuaritasSul] = useState(29);
  const [guaritasAI, setGuaritasAI] = useState(35);

  const [obitosDoceMonitorada, setObitosDoceMonitorada] = useState(0);
  const [obitosDoceNaoMonitorada, setObitosDoceNaoMonitorada] = useState(42);

  const [obitosSalgadaMonitorada, setObitosSalgadaMonitorada] = useState(1);
  const [obitosSalgadaNaoMonitorada, setObitosSalgadaNaoMonitorada] = useState(5);

  const [usarDadosDia, setUsarDadosDia] = useState(false); // false = acumulado da operação (padrão) | true = dia

  // Ajuste responsivo de escala do preview para caber perfeitamente na tela
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const w = wrapperRef.current.clientWidth;
        setScale(Math.min(1, w / 1080));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Dados de fallback para garantir que o card NUNCA falhe se o backend offline na Vercel
  const fallbackData = {
    data_referencia: '2026-02-22',
    card1_geral: {
      dia: {
        totais: {
          geral: { salvamentos: 14, prevencoes: 12480, pessoas_encontradas: 28, agua_viva: 2450 }
        }
      },
      acumulado: {
        totais: {
          geral: { salvamentos: 854, prevencoes: 507826, pessoas_encontradas: 1206, agua_viva: 125370 }
        }
      }
    }
  };

  const currentData = (data && data.card1_geral) ? data : fallbackData;
  const { data_referencia, card1_geral } = currentData;
  const { dia, acumulado } = card1_geral;

  const dataset = (usarDadosDia ? dia?.totais?.geral : acumulado?.totais?.geral) || fallbackData.card1_geral.acumulado.totais.geral;

  // Formatação da data no topo (ex: 22/02/2026)
  const formatDateHeader = (dStr) => {
    if (!dStr) return '22/02/2026';
    try {
      const [y, m, d] = dStr.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return dStr;
    }
  };

  const dataExibicao = formatDateHeader(data_referencia);

  // Valores dos cards
  const salvamentosVal = (dataset.salvamentos ?? 854).toLocaleString('pt-BR');
  const prevencoesVal = (dataset.prevencoes ?? 507826).toLocaleString('pt-BR');
  const pessoasVal = (dataset.pessoas_encontradas ?? 1206).toLocaleString('pt-BR');
  const aguaVivaVal = (dataset.agua_viva ?? 125370).toLocaleString('pt-BR');

  // Afogamentos
  const obitosDoceTotal = obitosDoceMonitorada + obitosDoceNaoMonitorada;
  const obitosSalgadaTotal = obitosSalgadaMonitorada + obitosSalgadaNaoMonitorada;

  // Download como PNG em resolução nativa Full HD (1080 x 1920)
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 1, // Elemento já tem 1080x1920 nativo
        width: 1080,
        height: 1920,
        style: {
          transform: 'none',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement('a');
      link.download = `boletim-diario-10op-verao-${data_referencia || '2026-02-22'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      alert('Erro ao exportar a imagem. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  // Copiar boletim formatado para WhatsApp
  const handleCopyText = () => {
    let t = `📢 *10ª OPERAÇÃO VERÃO (2026/2027) — CORPO DE BOMBEIROS MILITAR DO RS*\n`;
    t += `📅 *Boletim de Divulgação Oficial — ${dataExibicao}*\n`;
    t += `📊 *Modo:* ${usarDadosDia ? 'Atendimentos do Dia' : 'Acumulado da Operação'}\n\n`;
    t += `🛟 *Resgates e Salvamentos:* ${salvamentosVal}\n`;
    t += `📢 *Ações Preventivas:* ${prevencoesVal}\n`;
    t += `👨‍👩‍👧 *Pessoas Encontradas:* ${pessoasVal}\n`;
    t += `🪼 *Lesões por Águas-Vivas:* ${aguaVivaVal}\n\n`;
    t += `⚫ *Afogamentos Seguidos de Morte em Água Doce:* ${obitosDoceTotal}\n`;
    t += `   ├ Área Monitorada: ${obitosDoceMonitorada}\n`;
    t += `   └ Área Não Monitorada: ${obitosDoceNaoMonitorada}\n\n`;
    t += `🔴 *Afogamentos Seguidos de Morte em Água Salgada:* ${obitosSalgadaTotal}\n`;
    t += `   ├ Área Monitorada: ${obitosSalgadaMonitorada}\n`;
    t += `   └ Área Não Monitorada: ${obitosSalgadaNaoMonitorada}\n\n`;
    t += `🏖️ *Guaritas Ativadas:*\n`;
    t += `   • Litoral Norte: ${guaritasNorte}\n`;
    t += `   • Litoral Sul: ${guaritasSul}\n`;
    t += `   • Águas Internas: ${guaritasAI}\n\n`;
    t += `_CBMRS — Salvar é o nosso dever!_`;

    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Barra de Ações do Card */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '540px',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #e63946 0%, #b71c1c 100%)',
              borderColor: '#e63946',
              boxShadow: '0 4px 12px rgba(230, 57, 70, 0.35)'
            }}
          >
            <Camera size={16} />
            {downloading ? 'Gerando Imagem Ultra HD...' : 'Baixar Imagem (Stories / PNG)'}
          </button>

          <button
            onClick={handleCopyText}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 0.9rem',
              fontSize: '0.85rem'
            }}
          >
            {copied ? <Check size={16} color="var(--cbm-green)" /> : <Copy size={16} />}
            {copied ? 'Copiado para WhatsApp!' : 'Copiar Texto'}
          </button>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 0.85rem',
            fontSize: '0.82rem',
            color: showConfig ? 'var(--cbm-yellow)' : 'var(--text-muted)',
            borderColor: showConfig ? 'var(--cbm-yellow)' : 'var(--border-color)',
            background: showConfig ? 'rgba(255, 183, 3, 0.1)' : 'transparent'
          }}
          title="Ajustar dados de guaritas e afogamentos"
        >
          <Settings2 size={15} />
          <span>Ajustar Campos</span>
          {showConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Painel Expansível de Ajuste dos Dados Complementares */}
      {showConfig && (
        <div style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 183, 3, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.25rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          fontSize: '0.82rem',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--cbm-yellow)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} /> Campos Complementares da 10ª Operação
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={usarDadosDia}
                  onChange={(e) => setUsarDadosDia(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Exibir Dados do Dia (em vez do Acumulado)
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
            {/* Guaritas */}
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
                🏰 Guaritas Ativadas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Litoral Norte:</span>
                  <input
                    type="number"
                    value={guaritasNorte}
                    onChange={(e) => setGuaritasNorte(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '60px', padding: '2px 4px', background: '#0a101d', border: '1px solid #334155', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                  />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Litoral Sul:</span>
                  <input
                    type="number"
                    value={guaritasSul}
                    onChange={(e) => setGuaritasSul(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '60px', padding: '2px 4px', background: '#0a101d', border: '1px solid #334155', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                  />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Águas Internas:</span>
                  <input
                    type="number"
                    value={guaritasAI}
                    onChange={(e) => setGuaritasAI(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '60px', padding: '2px 4px', background: '#0a101d', border: '1px solid #334155', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                  />
                </label>
              </div>
            </div>

            {/* Afogamentos Água Doce */}
            <div style={{ background: 'rgba(31, 41, 55, 0.4)', border: '1px solid #4b5563', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontWeight: 700, color: '#e5e7eb', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
                ⚫ Água Doce (Óbitos)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Monitorada:</span>
                  <input
                    type="number"
                    value={obitosDoceMonitorada}
                    onChange={(e) => setObitosDoceMonitorada(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '60px', padding: '2px 4px', background: '#0a101d', border: '1px solid #334155', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                  />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Não Monitorada:</span>
                  <input
                    type="number"
                    value={obitosDoceNaoMonitorada}
                    onChange={(e) => setObitosDoceNaoMonitorada(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '60px', padding: '2px 4px', background: '#0a101d', border: '1px solid #334155', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                  />
                </label>
                <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '0.2rem', textAlign: 'right' }}>
                  Total: <strong style={{ color: 'white' }}>{obitosDoceTotal}</strong>
                </div>
              </div>
            </div>

            {/* Afogamentos Água Salgada */}
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
                🔴 Água Salgada (Óbitos)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Monitorada:</span>
                  <input
                    type="number"
                    value={obitosSalgadaMonitorada}
                    onChange={(e) => setObitosSalgadaMonitorada(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '60px', padding: '2px 4px', background: '#0a101d', border: '1px solid #334155', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                  />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Não Monitorada:</span>
                  <input
                    type="number"
                    value={obitosSalgadaNaoMonitorada}
                    onChange={(e) => setObitosSalgadaNaoMonitorada(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '60px', padding: '2px 4px', background: '#0a101d', border: '1px solid #334155', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                  />
                </label>
                <div style={{ fontSize: '0.74rem', color: '#fca5a5', marginTop: '0.2rem', textAlign: 'right' }}>
                  Total: <strong style={{ color: 'white' }}>{obitosSalgadaTotal}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WRAPPER RESPONSIVO DE PREVIEW */}
      <div
        ref={wrapperRef}
        style={{
          width: '100%',
          maxWidth: '540px',
          height: `${1920 * scale}px`,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          background: '#020617'
        }}
      >
        {/* CONTAINER DO CARD OFICIAL (1080 x 1920 - Proporção Exata Full HD Stories) */}
        <div
          ref={cardRef}
          id="card-divulgacao-oficial"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1080px',
            height: '1920px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            overflow: 'hidden',
            fontFamily: "'Montserrat', Arial, sans-serif",
            userSelect: 'none',
            background: '#ffffff'
          }}
        >
          {/* 1. ARTE COMPLETA DO CARD (Frame 3.png com base limpa) */}
          <img
            src={cardBaseFrame3}
            alt="Card Oficial 10ª Operação Verão 2026/2027"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1080px',
              height: '1920px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* 2. DATA OFICIAL (Dentro da pílula branca superior) */}
          <div
            style={{
              position: 'absolute',
              top: '32px',
              left: '316px',
              width: '436px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d32f2f',
              fontSize: '25px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              letterSpacing: '0.4px',
              zIndex: 10
            }}
          >
            BOLETIM DIÁRIO - {dataExibicao}
          </div>

          {/* 3. RESGATES E SALVAMENTOS (Círculo Amarelo - Topo Centro) */}
          <div
            style={{
              position: 'absolute',
              top: '578px',
              left: '460px',
              width: '156px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#b71c1c',
              fontSize: '48px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {salvamentosVal}
          </div>

          {/* 4. PESSOAS ENCONTRADAS (Círculo Azul - Meio Esquerda) */}
          <div
            style={{
              position: 'absolute',
              top: '685px',
              left: '160px',
              width: '194px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '52px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              zIndex: 10
            }}
          >
            {pessoasVal}
          </div>

          {/* 5. AÇÕES PREVENTIVAS (Círculo Laranja - Centro Hero) */}
          <div
            style={{
              position: 'absolute',
              top: '802px',
              left: '410px',
              width: '256px',
              height: '62px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '52px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              textShadow: '0 2px 5px rgba(0, 0, 0, 0.35)',
              zIndex: 10
            }}
          >
            {prevencoesVal}
          </div>

          {/* 6. LESÕES POR ÁGUAS VIVAS (Círculo Roxo - Meio Direita) */}
          <div
            style={{
              position: 'absolute',
              top: '668px',
              left: '730px',
              width: '232px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '48px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              zIndex: 10
            }}
          >
            {aguaVivaVal}
          </div>

          {/* 7. AFOGAMENTOS EM ÁGUA DOCE (Círculo Preto - Baixo Esquerda) */}
          {/* Total */}
          <div
            style={{
              position: 'absolute',
              top: '928px',
              left: '190px',
              width: '98px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '44px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {obitosDoceTotal}
          </div>
          {/* Sub-pílula: Área Monitorada */}
          <div
            style={{
              position: 'absolute',
              top: '1074px',
              left: '320px',
              width: '46px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '21px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {obitosDoceMonitorada}
          </div>
          {/* Sub-pílula: Área Não Monitorada */}
          <div
            style={{
              position: 'absolute',
              top: '1116px',
              left: '320px',
              width: '46px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '21px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {obitosDoceNaoMonitorada}
          </div>

          {/* 8. AFOGAMENTOS EM ÁGUA SALGADA (Círculo Vermelho - Baixo Direita) */}
          {/* Total */}
          <div
            style={{
              position: 'absolute',
              top: '922px',
              left: '800px',
              width: '76px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '44px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {obitosSalgadaTotal}
          </div>
          {/* Sub-pílula: Área Monitorada */}
          <div
            style={{
              position: 'absolute',
              top: '1074px',
              left: '920px',
              width: '46px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '21px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {obitosSalgadaMonitorada}
          </div>
          {/* Sub-pílula: Área Não Monitorada */}
          <div
            style={{
              position: 'absolute',
              top: '1116px',
              left: '920px',
              width: '46px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '21px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {obitosSalgadaNaoMonitorada}
          </div>

          {/* 9. GUARITAS ATIVADAS (Casa Verde - Baixo Centro) */}
          {/* Litoral Norte */}
          <div
            style={{
              position: 'absolute',
              top: '1302px',
              left: '550px',
              width: '160px',
              height: '58px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#004b23',
              fontSize: '38px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {guaritasNorte}
          </div>
          {/* Litoral Sul */}
          <div
            style={{
              position: 'absolute',
              top: '1366px',
              left: '550px',
              width: '160px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#004b23',
              fontSize: '38px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {guaritasSul}
          </div>
          {/* Águas Internas */}
          <div
            style={{
              position: 'absolute',
              top: '1442px',
              left: '550px',
              width: '160px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#004b23',
              fontSize: '38px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              zIndex: 10
            }}
          >
            {guaritasAI}
          </div>
        </div>
      </div>
    </div>
  );
}
