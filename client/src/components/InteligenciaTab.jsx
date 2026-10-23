import React, { useState, useEffect } from 'react';
import { Wind, Flag, Users, Clock, AlertTriangle } from 'lucide-react';

export default function InteligenciaTab({ temporadaAtiva }) {
  const [temporada, setTemporada] = useState(temporadaAtiva || 'Total');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/estatisticas?temporada=${temporada}`)
      .then(r => r.json())
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [temporada]);

  if (loading && !data) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Calculando estatísticas de inteligência climática...</div>;
  }

  const { ventos = [], bandeiras = [], faixa_etaria = [], faixa_horaria = [], tipos = [] } = data || {};

  // Calcula totais para barras percentuais
  const totalVentos = ventos.reduce((acc, v) => acc + v.quantidade, 0) || 1;
  const totalHoras = faixa_horaria.reduce((acc, h) => acc + h.total, 0) || 1;

  return (
    <div>
      {/* Seletor de Temporada para os Gráficos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: 'white' }}>
            Painel de Inteligência Climática, Perfil e Tipologia
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Cruzamento estatístico dos salvamentos para embasamento de escalas, prevenção e divulgação.
          </p>
        </div>

        <div className="season-btn-group">
          {['Total', 'Alta', 'Baixa'].map((t) => (
            <button
              key={t}
              className={`season-btn ${temporada === t ? 'active' : ''}`}
              onClick={() => setTemporada(t)}
            >
              {t === 'Total' ? 'Operação Completa' : `${t} Temporada`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Gráficos e Tabelas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Gráfico 1: Ventos */}
        <div className="form-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#48cae4', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Wind size={18} />
            Salvamentos por Direção do Vento
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {ventos.map((v) => {
              const pct = ((v.quantidade / totalVentos) * 100).toFixed(1);
              return (
                <div key={v.direcao} style={{ fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600 }}>{v.direcao}</span>
                    <span style={{ color: 'var(--text-muted)' }}><strong>{v.quantidade}</strong> ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: v.direcao.includes('Nordeste') ? 'var(--cbm-red)' : 'var(--cbm-blue)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 2: Bandeiras x Motoaquática */}
        <div className="form-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#ffb703', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Flag size={18} />
            Salvamentos por Bandeira e Apoio de Motoaquática
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bandeira</th>
                <th>Total</th>
                <th>Com Motoaquática</th>
              </tr>
            </thead>
            <tbody>
              {bandeiras.map((b) => (
                <tr key={b.bandeira}>
                  <td>
                    <span className={`badge ${
                      b.bandeira === 'VERDE' ? 'badge-green' :
                      b.bandeira === 'AMARELA' ? 'badge-yellow' :
                      b.bandeira === 'VERMELHA' ? 'badge-red' : 'badge-dark'
                    }`}>
                      {b.bandeira}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.quantidade}</td>
                  <td>
                    <span className="badge badge-moto">{b.com_moto} ({((b.com_moto / (b.quantidade || 1)) * 100).toFixed(0)}%)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gráfico 3: Faixa Horária de Risco */}
        <div className="form-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#2ec4b6', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock size={18} />
            Distribuição por Faixa Horária (Picos de Afogamento)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faixa_horaria.map((h) => {
              const pct = ((h.total / totalHoras) * 100).toFixed(1);
              const isPeak = h.faixa.includes('14:31') || h.faixa.includes('16:31');
              return (
                <div key={h.faixa} style={{ fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: isPeak ? 700 : 500, color: isPeak ? '#ef233c' : 'white' }}>
                      {h.faixa} {isPeak && '🔥'}
                    </span>
                    <span><strong>{h.total}</strong> ocorrências ({pct}%)</span>
                  </div>
                  <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isPeak ? '#ef233c' : '#2ec4b6' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 4: Tipologia e Graus de Afogamento */}
        <div className="form-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#ef233c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={18} />
            Tipologia de Ocorrência & Graus Médicos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            {tipos.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                <span>
                  <strong>{t.tipo_salvamento}</strong>
                  {t.grau > 0 && <span style={{ color: 'var(--cbm-yellow)', marginLeft: '0.5rem' }}>(Grau {t.grau})</span>}
                </span>
                <strong style={{ color: t.tipo_salvamento.includes('MORTE') ? '#ef233c' : 'white' }}>{t.total}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
