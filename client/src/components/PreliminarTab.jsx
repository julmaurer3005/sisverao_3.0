import React, { useState, useEffect, useRef } from 'react';
import CardPreliminar from './CardPreliminar';
import { Calendar, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PreliminarTab({ dataRef, onDataChange, temporada }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (temporada) params.append('temporada', temporada);
    if (dataRef) params.append('data', dataRef);

    fetch(`/api/dashboard?${params.toString()}`)
      .then(r => r.json())
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [temporada, dataRef]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Barra de Controles e Contexto */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        background: 'var(--bg-secondary)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={20} color="var(--cbm-yellow)" />
          <div>
            <h2 style={{ fontSize: '1.05rem', margin: 0, color: 'white', fontFamily: 'var(--font-heading)' }}>
              Preliminar da Manhã (Disparo das 14h)
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Painel simplificado para envio rápido aos grupos de WhatsApp do Comando e Imprensa.
            </p>
          </div>
        </div>

        {/* Seletor de Data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {/* Stepper de Dia */}
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
                justifyContent: 'center'
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
                justifyContent: 'center'
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
        </div>
      </div>

      {/* Widget Visual 14h */}
      {loading && !data ? (
        <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Carregando dados da preliminar...</div>
      ) : (
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: loading ? 0.65 : 1,
          transition: 'opacity 0.15s ease'
        }}>
          <CardPreliminar data={data?.preliminar14h} />
        </div>
      )}
    </div>
  );
}
