import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Camera, Copy, Check, Settings2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

// Importação direta dos assets locais para garantir carregamento infalível na Vercel e em produção
import cardTopHelicopter from '../assets/card_top_helicopter.png';
import cardBottomOcean from '../assets/card_bottom_ocean.png';
import cardTitle10op from '../assets/card_title_10op.png';

/* --- Ícones SVG Vetoriais de Alta Fidelidade (Idênticos ao Card Oficial CBMRS) --- */

// Bóia Salva-Vidas
function BoiaIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke="#ffffff" strokeWidth="6" fill="#f59e0b" />
      <circle cx="24" cy="24" r="9" fill="#ffffff" />
      <rect x="21" y="2" width="6" height="7" rx="1.5" fill="#ffffff" />
      <rect x="21" y="39" width="6" height="7" rx="1.5" fill="#ffffff" />
      <rect x="2" y="21" width="7" height="6" rx="1.5" fill="#ffffff" />
      <rect x="39" y="21" width="7" height="6" rx="1.5" fill="#ffffff" />
      <circle cx="24" cy="24" r="19" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
    </svg>
  );
}

// Apito de Guarda-Vidas (Whistle)
function ApitoIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 40" fill="none">
      <path
        d="M32 10 C32 4.5 27.5 0 22 0 C16.5 0 12 4.5 12 10 C12 12 12.5 14 13.5 15.5 L3 20 C1 21 0 23 0 25 L0 30 C0 32.2 1.8 34 4 34 L18 34 C20 34 22 32.5 22.8 30.5 L24.5 26 C26.8 27.3 29.3 28 32 28 C39.7 28 46 21.7 46 14 C46 12.6 45.7 11.3 45.3 10 L32 10 Z"
        fill="#ffffff"
        filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
      />
      <rect x="18" y="4" width="7" height="7" rx="1.5" fill="#f97316" />
      <circle cx="48" cy="14" r="3.5" stroke="#ffffff" strokeWidth="2.5" fill="none" />
      <path d="M12 24 L4 28" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Pessoas Encontradas (Adulto com 2 crianças)
function PessoasIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="10" r="4.5" fill="#ffffff" />
      <path d="M19 18 C19 16.5 20.5 15.5 22 15.5 L26 15.5 C27.5 15.5 29 16.5 29 18 L29 30 L27 30 L27 42 L25 42 L25 32 L23 32 L23 42 L21 42 L21 30 L19 30 Z" fill="#ffffff" />
      <circle cx="11" cy="18" r="3.5" fill="#ffffff" />
      <path d="M7 25 C7 23.5 8 23 9.5 23 L12.5 23 C14 23 15 23.5 15 25 L15 34 L13.5 34 L13.5 42 L12 42 L12 35 L10 35 L10 42 L8.5 42 L8.5 34 L7 34 Z" fill="#ffffff" />
      <circle cx="37" cy="18" r="3.5" fill="#ffffff" />
      <path d="M33 25 C33 23.5 34 23 35.5 23 L38.5 23 C40 23 41 23.5 41 25 L41 34 L39.5 34 L39.5 42 L38 42 L38 35 L36 35 L36 42 L34.5 42 L34.5 34 L33 34 Z" fill="#ffffff" />
      <line x1="14" y1="27" x2="20" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="27" x2="28" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Água-Viva (Jellyfish)
function AguaVivaIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 48" fill="none">
      <path
        d="M22 4 C11 4 4 13 4 21 C4 23 6 24 9 23 C12 22 15 24 18 24 C21 24 23 22 26 22 C29 22 32 24 35 23 C38 24 40 23 40 21 C40 13 33 4 22 4 Z"
        fill="#ffffff"
      />
      <path d="M15 8 C12 12 11 16 11 20" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M22 6 C22 11 22 16 22 21" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M29 8 C32 12 33 16 33 20" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M9 24 Q7 30 11 36 T9 45" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M16 25 Q19 32 15 39 T18 46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M22 25 Q20 33 24 40 T22 47" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M28 25 Q25 32 29 39 T26 46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M35 24 Q37 30 33 36 T35 45" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Afogamento (Vítima acenando nas ondas + setas de correnteza)
function AfogamentoIcon({ size = 26, isRed = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 44" fill="none">
      <circle cx="27" cy="8" r="4.5" fill="#ffffff" />
      <path d="M14 6 L22 17 L27 20 L32 17 L40 6" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M25 18 L29 18 L29 25 L25 25 Z" fill="#ffffff" />
      <path
        d="M4 27 Q9 23 15 27 T27 27 T39 27 T50 27"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 35 Q9 31 15 35 T27 35 T39 35 T50 35"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M18 35 L23 35 M21 32 L24 35 L21 38" stroke={isRed ? '#ef4444' : '#111827'} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M33 35 L38 35 M36 32 L39 35 L36 38" stroke={isRed ? '#ef4444' : '#111827'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Guarita de Guarda-Vidas (Watchtower no formato exato da foto original)
function GuaritaIcon({ size = 22, color = '#023819' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Telhado */}
      <path d="M4 7 L12 2 L20 7 Z" fill={color} />
      {/* Cabine */}
      <rect x="6" y="7" width="12" height="6" rx="0.5" fill={color} />
      <rect x="8" y="8.5" width="8" height="3" fill="#ffffff" rx="0.5" />
      {/* Pernas / palafitas da guarita */}
      <line x1="7" y1="13" x2="4.5" y2="23" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="17" y1="13" x2="19.5" y2="23" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* Travessas horizontais */}
      <line x1="6" y1="17.5" x2="18" y2="17.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5" y1="21" x2="19" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Mini-ícone para pílula de área monitorada (Torre / Olho)
function MiniTorreIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L3 9v13h18V9l-9-7zm0 4.5l5 3.9V20H7v-9.6l5-3.9zM10 13h4v5h-4v-5z"/>
    </svg>
  );
}


/* --- Componente Principal --- */
export default function CardResumoDivulgacao({ data }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Campos complementares configuráveis pelo usuário (com os valores padrão do modelo oficial)
  const [guaritasNorte, setGuaritasNorte] = useState(180);
  const [guaritasSul, setGuaritasSul] = useState(29);
  const [guaritasAI, setGuaritasAI] = useState(35);

  const [obitosDoceMonitorada, setObitosDoceMonitorada] = useState(0);
  const [obitosDoceNaoMonitorada, setObitosDoceNaoMonitorada] = useState(42);

  const [obitosSalgadaMonitorada, setObitosSalgadaMonitorada] = useState(1);
  const [obitosSalgadaNaoMonitorada, setObitosSalgadaNaoMonitorada] = useState(5);

  const [usarDadosDia, setUsarDadosDia] = useState(false); // false = acumulado da operação (padrão) | true = dia

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

  // Download como PNG em alta resolução (3x para Stories do Instagram e WhatsApp)
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Gera imagem 1728 x 3072 para ultra nitidez no Stories
        quality: 1
      });
      const link = document.createElement('a');
      link.download = `card-divulgacao-10op-verao-${data_referencia}.png`;
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
        maxWidth: '576px',
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
          maxWidth: '576px',
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
      <div style={{
        width: '100%',
        maxWidth: '576px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        background: '#020617'
      }}>
        {/* CONTAINER DO CARD OFICIAL (576 x 1024 - Proporção Exata 9:16) */}
        <div
          ref={cardRef}
          id="card-divulgacao-oficial"
          style={{
            position: 'relative',
            width: '576px',
            height: '1024px',
            overflow: 'hidden',
            fontFamily: "'Inter', Arial, sans-serif",
            userSelect: 'none',
            background: 'linear-gradient(180deg, #b7e9fd 0%, #c4efff 20%, #d2f3ff 45%, #c8effe 75%, #aee5f9 100%)'
          }}
        >
          {/* 1. TOPO: HELICÓPTERO CBMRS EM VOO */}
          <img
            src={cardTopHelicopter}
            alt="Helicóptero CBMRS"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '576px',
              height: '275px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* 2. DATA OFICIAL NO CANTO SUPERIOR DIREITO */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '28px',
              color: '#d32f2f',
              fontSize: '24px',
              fontWeight: 900,
              fontFamily: "'Montserrat', Arial, sans-serif",
              letterSpacing: '0.5px',
              zIndex: 10,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            {dataExibicao}
          </div>

          {/* 3. COMPOSIÇÃO DOS 7 CÍRCULOS DE INDICADORES */}

          {/* CÍRCULO 1: RESGATES E SALVAMENTOS (Topo Centro) */}
          <div
            style={{
              position: 'absolute',
              top: '268px',
              left: '288px',
              transform: 'translateX(-50%)',
              width: '116px',
              height: '116px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #fff176 0%, #ffd600 50%, #f59e0b 100%)',
              border: '3.5px solid #ffffff',
              boxShadow: '0 10px 22px rgba(245, 158, 11, 0.4), 0 6px 14px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              textAlign: 'center',
              padding: '6px'
            }}
          >
            <BoiaIcon size={25} />
            <span
              style={{
                color: '#c62828',
                fontSize: '28px',
                fontWeight: 900,
                lineHeight: 1.05,
                marginTop: '1px',
                fontFamily: "'Montserrat', Arial, sans-serif"
              }}
            >
              {salvamentosVal}
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '7px',
                fontWeight: 900,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
              }}
            >
              Resgates e<br />Salvamentos
            </span>
          </div>

          {/* CÍRCULO 2: PESSOAS ENCONTRADAS (Topo Esquerda) */}
          <div
            style={{
              position: 'absolute',
              top: '328px',
              left: '74px',
              width: '116px',
              height: '116px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
              border: '3.5px solid #ffffff',
              boxShadow: '0 10px 22px rgba(29, 78, 216, 0.35), 0 6px 14px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              textAlign: 'center',
              padding: '6px'
            }}
          >
            <PessoasIcon size={26} />
            <span
              style={{
                color: '#ffffff',
                fontSize: '27px',
                fontWeight: 900,
                lineHeight: 1.05,
                marginTop: '1px',
                fontFamily: "'Montserrat', Arial, sans-serif",
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.25)'
              }}
            >
              {pessoasVal}
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '7.5px',
                fontWeight: 900,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
              }}
            >
              Pessoas<br />Encontradas
            </span>
          </div>

          {/* CÍRCULO 3: LESÕES POR ÁGUAS VIVAS (Topo Direita) */}
          <div
            style={{
              position: 'absolute',
              top: '328px',
              right: '74px',
              width: '116px',
              height: '116px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #c084fc 0%, #9333ea 50%, #7e22ce 100%)',
              border: '3.5px solid #ffffff',
              boxShadow: '0 10px 22px rgba(126, 34, 206, 0.35), 0 6px 14px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              textAlign: 'center',
              padding: '6px'
            }}
          >
            <AguaVivaIcon size={25} />
            <span
              style={{
                color: '#ffffff',
                fontSize: '21px',
                fontWeight: 900,
                lineHeight: 1.05,
                marginTop: '2px',
                fontFamily: "'Montserrat', Arial, sans-serif",
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.25)'
              }}
            >
              {aguaVivaVal}
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '7.5px',
                fontWeight: 900,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
              }}
            >
              Lesões por<br />Águas Vivas
            </span>
          </div>

          {/* CÍRCULO 4: AÇÕES PREVENTIVAS (Hero Center - O Maior) */}
          <div
            style={{
              position: 'absolute',
              top: '388px',
              left: '288px',
              transform: 'translateX(-50%)',
              width: '138px',
              height: '138px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #fb923c 0%, #f97316 50%, #ea580c 100%)',
              border: '4px solid #ffffff',
              boxShadow: '0 12px 28px rgba(234, 88, 12, 0.45), 0 8px 18px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              textAlign: 'center',
              padding: '8px'
            }}
          >
            <ApitoIcon size={30} />
            <span
              style={{
                color: '#ffffff',
                fontSize: '25px',
                fontWeight: 900,
                lineHeight: 1.05,
                marginTop: '2px',
                fontFamily: "'Montserrat', Arial, sans-serif",
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              {prevencoesVal}
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 900,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
              }}
            >
              Ações<br />Preventivas
            </span>
          </div>

          {/* CÍRCULO 5: AFOGAMENTOS EM ÁGUA DOCE (Baixo Esquerda) */}
          <div
            style={{
              position: 'absolute',
              top: '468px',
              left: '74px',
              width: '116px',
              height: '116px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #374151 0%, #1f2937 55%, #000000 100%)',
              border: '3.5px solid #ffffff',
              boxShadow: '0 10px 22px rgba(0, 0, 0, 0.4), 0 6px 14px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              textAlign: 'center',
              padding: '6px'
            }}
          >
            <AfogamentoIcon size={25} isRed={false} />
            <span
              style={{
                color: '#ffffff',
                fontSize: '27px',
                fontWeight: 900,
                lineHeight: 1.05,
                marginTop: '1px',
                fontFamily: "'Montserrat', Arial, sans-serif",
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              {obitosDoceTotal}
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '6px',
                fontWeight: 800,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)'
              }}
            >
              Afogamentos Seguidos de<br />Morte em Água Doce
            </span>
          </div>

          {/* SUB-PÍLULAS: ÁGUA DOCE (Monitorada / Não Monitorada) */}
          <div
            style={{
              position: 'absolute',
              top: '584px',
              left: '67px',
              width: '130px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              zIndex: 6
            }}
          >
            {/* Pílula 1: Área Monitorada */}
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '20px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5px 0 6px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex' }}>
                  <MiniTorreIcon />
                </span>
                <span style={{ color: '#ffffff', fontSize: '6.5px', fontWeight: 800, letterSpacing: '0.2px' }}>
                  ÁREA MONITORADA:
                </span>
              </div>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '9.5px',
                  fontWeight: 900,
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {obitosDoceMonitorada}
              </span>
            </div>

            {/* Pílula 2: Área Não Monitorada */}
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '20px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5px 0 6px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex' }}>
                  <MiniTorreIcon />
                </span>
                <span style={{ color: '#ffffff', fontSize: '6.2px', fontWeight: 800, letterSpacing: '0.1px' }}>
                  ÁREA NÃO MONITORADA:
                </span>
              </div>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '9.5px',
                  fontWeight: 900,
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {obitosDoceNaoMonitorada}
              </span>
            </div>
          </div>

          {/* CÍRCULO 6: AFOGAMENTOS EM ÁGUA SALGADA (Baixo Direita) */}
          <div
            style={{
              position: 'absolute',
              top: '468px',
              right: '74px',
              width: '116px',
              height: '116px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #f87171 0%, #ef4444 50%, #dc2626 100%)',
              border: '3.5px solid #ffffff',
              boxShadow: '0 10px 22px rgba(220, 38, 38, 0.4), 0 6px 14px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              textAlign: 'center',
              padding: '6px'
            }}
          >
            <AfogamentoIcon size={25} isRed={true} />
            <span
              style={{
                color: '#ffffff',
                fontSize: '27px',
                fontWeight: 900,
                lineHeight: 1.05,
                marginTop: '1px',
                fontFamily: "'Montserrat', Arial, sans-serif",
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              {obitosSalgadaTotal}
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '6px',
                fontWeight: 800,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)'
              }}
            >
              Afogamentos Seguidos de<br />Morte em Água Salgada
            </span>
          </div>

          {/* SUB-PÍLULAS: ÁGUA SALGADA (Monitorada / Não Monitorada) */}
          <div
            style={{
              position: 'absolute',
              top: '584px',
              right: '67px',
              width: '130px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              zIndex: 6
            }}
          >
            {/* Pílula 1: Área Monitorada */}
            <div
              style={{
                background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '20px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5px 0 6px',
                boxShadow: '0 2px 5px rgba(220, 38, 38, 0.35)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', display: 'flex' }}>
                  <MiniTorreIcon />
                </span>
                <span style={{ color: '#ffffff', fontSize: '6.5px', fontWeight: 800, letterSpacing: '0.2px' }}>
                  ÁREA MONITORADA:
                </span>
              </div>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '9.5px',
                  fontWeight: 900,
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {obitosSalgadaMonitorada}
              </span>
            </div>

            {/* Pílula 2: Área Não Monitorada */}
            <div
              style={{
                background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '20px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5px 0 6px',
                boxShadow: '0 2px 5px rgba(220, 38, 38, 0.35)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', display: 'flex' }}>
                  <MiniTorreIcon />
                </span>
                <span style={{ color: '#ffffff', fontSize: '6.2px', fontWeight: 800, letterSpacing: '0.1px' }}>
                  ÁREA NÃO MONITORADA:
                </span>
              </div>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '9.5px',
                  fontWeight: 900,
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {obitosSalgadaNaoMonitorada}
              </span>
            </div>
          </div>

          {/* CÍRCULO 7: GUARITAS ATIVADAS (Baixo Centro - Formato Idêntico à Referência) */}
          <div
            style={{
              position: 'absolute',
              top: '528px',
              left: '288px',
              transform: 'translateX(-50%)',
              width: '116px',
              height: '116px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 30%, #00c868 0%, #00a854 50%, #008740 100%)',
              border: '3.5px solid #ffffff',
              boxShadow: '0 10px 22px rgba(0, 168, 84, 0.45), 0 6px 14px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              padding: '6px'
            }}
          >
            {/* Header com GUARITAS ATIVADAS + Ícone Torre */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '3px',
              width: '100%',
              paddingLeft: '6px',
              paddingRight: '6px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ color: '#ffffff', fontSize: '7.8px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '0.3px', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                  GUARITAS
                </span>
                <span style={{ color: '#ffffff', fontSize: '7.8px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '0.3px', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                  ATIVADAS
                </span>
              </div>
              <GuaritaIcon size={21} color="#023819" />
            </div>

            {/* As 3 Linhas de Postos com Pílulas Brancas Exatas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '94px' }}>
              {/* Litoral Norte */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#ffffff', fontSize: '6.8px', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.2px', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                  <span>LITORAL</span>
                  <span>NORTE</span>
                </div>
                <div style={{
                  background: '#ffffff',
                  color: '#003d1b',
                  fontWeight: 900,
                  fontSize: '13px',
                  borderRadius: '16px',
                  width: '45px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {guaritasNorte}
                </div>
              </div>

              {/* Litoral Sul */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#ffffff', fontSize: '6.8px', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.2px', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                  <span>LITORAL</span>
                  <span>SUL</span>
                </div>
                <div style={{
                  background: '#ffffff',
                  color: '#003d1b',
                  fontWeight: 900,
                  fontSize: '13px',
                  borderRadius: '16px',
                  width: '45px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {guaritasSul}
                </div>
              </div>

              {/* Águas Internas */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#ffffff', fontSize: '6.8px', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.2px', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                  <span>ÁGUAS</span>
                  <span>INTERNAS</span>
                </div>
                <div style={{
                  background: '#ffffff',
                  color: '#003d1b',
                  fontWeight: 900,
                  fontSize: '13px',
                  borderRadius: '16px',
                  width: '45px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {guaritasAI}
                </div>
              </div>
            </div>
          </div>


          {/* 4. BASE: OCEANO COM ONDAS E LOGOS OFICIAIS CBMRS */}
          <img
            src={cardBottomOcean}
            alt="Oceano e Logos Oficiais CBMRS"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '576px',
              height: '179px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* 5. TÍTULO OFICIAL 3D: 10ª OPERAÇÃO VERÃO 2026/2027 */}
          <img
            src={cardTitle10op}
            alt="10ª Operação Verão 2026/2027 - CBMRS"
            style={{
              position: 'absolute',
              bottom: '168px',
              left: 0,
              width: '576px',
              height: '160px',
              pointerEvents: 'none',
              zIndex: 2
            }}
          />
        </div>
      </div>
    </div>
  );
}
