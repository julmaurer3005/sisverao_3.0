import React, { useState, useEffect, useRef } from 'react';
import CardResumoGeral from './CardResumoGeral';
import CardResumoAIDia from './CardResumoAIDia';
import CardResumoAIAcumulado from './CardResumoAIAcumulado';
import CardResumoDivulgacao from './CardResumoDivulgacao';
import GerenciarPostosModal from './GerenciarPostosModal';
import { Calendar, FileText, Waves, Award, SlidersHorizontal, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import fallbackResumoDiario from '../data/fallbackResumoDiario.json';

export default function ResumoDiarioTab({ dataRef, onDataChange, temporada }) {
  const [modeloAtivo, setModeloAtivo] = useState('geral'); // 'geral' | 'ai_dia' | 'ai_acum'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPostosModalOpen, setIsPostosModalOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const dateInputRef = useRef(null);

  const getTodayIso = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatFriendlyDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const [y, m, d] = isoStr.split('-');
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), 12);
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return `${d}/${m}/${y} (${diasSemana[date.getDay()]})`;
    } catch {
      return isoStr;
    }
  };

  const handlePrevDay = () => {
    const cur = dataRef || getTodayIso();
    const d = new Date(cur + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    const prevIso = d.toISOString().split('T')[0];
    onDataChange && onDataChange(prevIso);
  };

  const handleNextDay = () => {
    const cur = dataRef || getTodayIso();
    const d = new Date(cur + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    const nextIso = d.toISOString().split('T')[0];
    onDataChange && onDataChange(nextIso);
  };

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (temporada) params.append('temporada', temporada);
    if (dataRef) params.append('data', dataRef);

    fetch(`/api/resumo-diario-completo?${params.toString()}`)
      .then(async (r) => {
        const contentType = r.headers.get('content-type') || '';
        if (!r.ok || !contentType.includes('application/json')) {
          throw new Error(`API offline ou retornou HTML (status ${r.status})`);
        }
        return r.json();
      })
      .then(res => {
        if (res && res.card1_geral && res.card1_geral.dia && res.card1_geral.dia.totais) {
          setData(res);
        } else {
          throw new Error('Formato de dados incompleto');
        }
      })
      .catch((err) => {
        console.warn('API de resumo diário offline (utilizando dados oficiais de contingência):', err);
        setData(fallbackResumoDiario);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [temporada, dataRef, refreshCount]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Barra de Controles e Alternância de Modelos Oficiais */}
      <div style={{
        width: '100%',
        maxWidth: '780px',
        background: 'var(--bg-secondary)',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        {/* Linha 1: Título e Seletor de Data */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'white', fontFamily: 'var(--font-heading)' }}>
              Imagens Oficiais do Resumo Diário (Chefia & Divulgação)
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Modelos operacionais idênticos aos divulgados pelo CBMRS na Operação Verão.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {/* Seletor Unificado com Stepper de Dia (◀ [Data] ▶) */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#080d1a',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={handlePrevDay}
                className="btn-icon-date"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.35rem 0.45rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s'
                }}
                title="Dia anterior (voltar 1 dia)"
              >
                <ChevronLeft size={16} />
              </button>

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus()}
                title="Clique para abrir o calendário"
              >
                <Calendar size={15} color="var(--cbm-yellow)" />
                <span style={{ fontSize: '0.84rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>
                  {formatFriendlyDate(dataRef || getTodayIso())}
                </span>

                <input
                  ref={dateInputRef}
                  type="date"
                  value={dataRef || getTodayIso()}
                  onChange={(e) => {
                    if (e.target.value) {
                      onDataChange && onDataChange(e.target.value);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    colorScheme: 'dark'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                className="btn-icon-date"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.35rem 0.45rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s'
                }}
                title="Próximo dia (avançar 1 dia)"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onDataChange && onDataChange(getTodayIso())}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              title="Voltar para a data de hoje"
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() => setIsPostosModalOpen(true)}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                borderColor: '#4ade80',
                color: '#4ade80',
                background: 'rgba(74, 222, 128, 0.08)'
              }}
              title="Gerenciar praias ativas e ocultar praias sem serviço de guarda-vidas neste ano"
            >
              <SlidersHorizontal size={14} />
              <span>Postos Ativos / Ocultar Praias</span>
            </button>
          </div>
        </div>


        {/* Linha 2: Seletor dos 3 Modelos de Imagem */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setModeloAtivo('geral')}
            className={`btn-secondary ${modeloAtivo === 'geral' ? 'active' : ''}`}
            style={{
              flex: 1,
              minWidth: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              padding: '0.5rem',
              background: modeloAtivo === 'geral' ? 'rgba(46, 196, 182, 0.15)' : 'var(--bg-tertiary)',
              borderColor: modeloAtivo === 'geral' ? '#2ec4b6' : 'var(--border-color)',
              color: modeloAtivo === 'geral' ? '#2ec4b6' : 'white'
            }}
          >
            <FileText size={15} />
            1. Consolidado Geral Oficial
          </button>

          <button
            type="button"
            onClick={() => setModeloAtivo('ai_dia')}
            className={`btn-secondary ${modeloAtivo === 'ai_dia' ? 'active' : ''}`}
            style={{
              flex: 1,
              minWidth: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              padding: '0.5rem',
              background: modeloAtivo === 'ai_dia' ? 'rgba(74, 222, 128, 0.15)' : 'var(--bg-tertiary)',
              borderColor: modeloAtivo === 'ai_dia' ? '#4ade80' : 'var(--border-color)',
              color: modeloAtivo === 'ai_dia' ? '#4ade80' : 'white'
            }}
          >
            <Waves size={15} />
            2. Águas Internas (Atendimentos Dia)
          </button>

          <button
            type="button"
            onClick={() => setModeloAtivo('ai_acum')}
            className={`btn-secondary ${modeloAtivo === 'ai_acum' ? 'active' : ''}`}
            style={{
              flex: 1,
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              padding: '0.5rem',
              background: modeloAtivo === 'ai_acum' ? 'rgba(255, 183, 3, 0.15)' : 'var(--bg-tertiary)',
              borderColor: modeloAtivo === 'ai_acum' ? 'var(--cbm-yellow)' : 'var(--border-color)',
              color: modeloAtivo === 'ai_acum' ? 'var(--cbm-yellow)' : 'white'
            }}
          >
            <Award size={15} />
            3. Águas Internas (Acumulado)
          </button>

          <button
            type="button"
            onClick={() => setModeloAtivo('divulgacao')}
            className={`btn-secondary ${modeloAtivo === 'divulgacao' ? 'active' : ''}`}
            style={{
              flex: 1,
              minWidth: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              padding: '0.5rem',
              background: modeloAtivo === 'divulgacao' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-tertiary)',
              borderColor: modeloAtivo === 'divulgacao' ? '#ef4444' : 'var(--border-color)',
              color: modeloAtivo === 'divulgacao' ? '#fca5a5' : 'white',
              boxShadow: modeloAtivo === 'divulgacao' ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'none'
            }}
          >
            <Sparkles size={15} color="#ef4444" />
            4. Card Redes Sociais (10ª Op)
          </button>
        </div>
      </div>

      {/* Renderização do Modelo Selecionado */}
      {loading && !data ? (
        <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Montando imagem oficial do Resumo Diário...</div>
      ) : (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: loading ? 0.65 : 1,
          transition: 'opacity 0.15s ease',
          pointerEvents: loading ? 'none' : 'auto'
        }}>
          {modeloAtivo === 'geral' && <CardResumoGeral data={data} />}
          {modeloAtivo === 'ai_dia' && <CardResumoAIDia data={data} />}
          {modeloAtivo === 'ai_acum' && <CardResumoAIAcumulado data={data} />}
          {modeloAtivo === 'divulgacao' && <CardResumoDivulgacao data={data} />}
        </div>
      )}

      {/* Modal para Gerenciar e Ocultar Praias sem Serviço */}
      {isPostosModalOpen && (
        <GerenciarPostosModal
          isOpen={isPostosModalOpen}
          onClose={() => setIsPostosModalOpen(false)}
          onSaved={() => setRefreshCount(c => c + 1)}
        />
      )}
    </div>
  );
}


