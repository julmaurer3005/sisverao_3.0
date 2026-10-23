import React, { useState, useEffect } from 'react';
import CardPreliminar from './CardPreliminar';
import { LifeBuoy, ShieldAlert, Users, Skull, Activity, Copy, Check, Calendar } from 'lucide-react';

export default function DashboardTab({ temporada, dataRef, onDataChange }) {
  const [data, setData] = useState(null);
  const [boletim, setBoletim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedBoletim, setCopiedBoletim] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (temporada) params.append('temporada', temporada);
    if (dataRef) params.append('data', dataRef);

    Promise.all([
      fetch(`/api/dashboard?${params.toString()}`).then(r => r.json()),
      fetch(`/api/boletim?${params.toString()}`).then(r => r.json())
    ])
      .then(([dashRes, bolRes]) => {
        setData(dashRes);
        setBoletim(bolRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [temporada, dataRef]);

  if (loading && !data) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Carregando estatísticas do SISVERÃO...</div>;
  }

  const kpis = data?.kpis || {};

  const handleCopyBoletimWhatsApp = () => {
    let t = `📢 *BOLETIM OFICIAL DA ${data?.operacao?.numero || 10}ª OPERAÇÃO VERÃO — CBMRS*\n`;
    t += `📅 Data de Referência: ${data?.data_referencia || ''}\n`;
    t += `🏖️ Fase: ${temporada === 'Total' ? 'Operação Completa' : temporada + ' Temporada'}\n\n`;
    t += `🏊 *Salvamentos:* ${kpis.salvamentos_total?.toLocaleString()} (com Motoaquática: ${kpis.salvamentos_moto} / ${kpis.moto_percentual}%)\n`;
    t += `🛡️ *Ações Preventivas:* ${kpis.prevencoes?.toLocaleString()}\n`;
    t += `🪼 *Lesões por Água-Viva:* ${kpis.agua_viva?.toLocaleString()}\n`;
    t += `👦 *Pessoas Encontradas:* ${kpis.pessoas_encontradas?.toLocaleString()}\n`;
    t += `⚠️ *Óbitos Confirmados:* ${kpis.obitos}\n\n`;
    t += `📊 *COMPARATIVO COM OPERAÇÕES ANTERIORES:*\n`;
    if (boletim?.historico_operacoes) {
      boletim.historico_operacoes.forEach(h => {
        t += `• ${h.numero_operacao}ª Op: ${h.salvamentos_total} salvamentos | ${h.prevencoes_total?.toLocaleString()} prev.\n`;
      });
    }
    t += `\n_Emitido via SISVERÃO - CBMRS_`;

    navigator.clipboard.writeText(t);
    setCopiedBoletim(true);
    setTimeout(() => setCopiedBoletim(false), 2500);
  };

  return (
    <div>
      {/* Controles de Topo: Data e Ação Rápida */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={18} color="var(--cbm-yellow)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Data do Boletim:</span>
          <input
            type="date"
            value={dataRef || data?.data_referencia || ''}
            onChange={(e) => onDataChange && onDataChange(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'white',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const y = now.getFullYear();
              const m = String(now.getMonth() + 1).padStart(2, '0');
              const d = String(now.getDate()).padStart(2, '0');
              onDataChange && onDataChange(`${y}-${m}-${d}`);
            }}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            title="Voltar para a data de hoje"
          >
            Hoje
          </button>
        </div>

        <button onClick={handleCopyBoletimWhatsApp} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          {copiedBoletim ? <Check size={16} /> : <Copy size={16} />}
          {copiedBoletim ? 'Boletim Copiado!' : 'Copiar Boletim para WhatsApp'}
        </button>
      </div>

      {/* Grid de KPIs Principais */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-salv">
          <div className="kpi-title">Salvamentos</div>
          <div className="kpi-value">{kpis.salvamentos_total?.toLocaleString()}</div>
          <div className="kpi-sub">
            <span className="badge badge-moto">Motoaquática: {kpis.salvamentos_moto} ({kpis.moto_percentual}%)</span>
          </div>
        </div>

        <div className="kpi-card kpi-prev">
          <div className="kpi-title">Prevenções a Afogamento</div>
          <div className="kpi-value">{kpis.prevencoes?.toLocaleString()}</div>
          <div className="kpi-sub">Ações de orientação ativa</div>
        </div>

        <div className="kpi-card kpi-av">
          <div className="kpi-title">Lesões por Água-Viva</div>
          <div className="kpi-value">{kpis.agua_viva?.toLocaleString()}</div>
          <div className="kpi-sub">Atendimentos com vinagre</div>
        </div>

        <div className="kpi-card kpi-pe">
          <div className="kpi-title">Pessoas Encontradas</div>
          <div className="kpi-value">{kpis.pessoas_encontradas?.toLocaleString()}</div>
          <div className="kpi-sub">Crianças e perdidos localizados</div>
        </div>

        <div className="kpi-card kpi-ob">
          <div className="kpi-title">Óbitos Registrados</div>
          <div className="kpi-value" style={{ color: '#ef233c' }}>{kpis.obitos}</div>
          <div className="kpi-sub">Afogamento confirmado</div>
        </div>
      </div>

      {/* Layout Principal: Card 14h + Tabelas do Boletim Oficial */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Coluna 1: Card Preliminar das 14h com download e texto */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', marginBottom: '0.75rem', color: '#ffb703', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} />
            Preliminar das 14h (Pronto para Disparo)
          </h3>
          <CardPreliminar data={data?.preliminar14h} />
        </div>

        {/* Coluna 2: Boletim Oficial da Chefia (Resumo Diário) */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', marginBottom: '0.75rem', color: 'white' }}>
            Consolidado Oficial da Chefia (Resumo Diário)
          </h3>

          {/* Quadro Comparativo entre Operações (6ª à 9ª) */}
          <div className="form-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--cbm-yellow)' }}>
              Comparativo Acumulado entre Operações (Mesmo Período)
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Operação</th>
                    <th>Salvamentos</th>
                    <th>Prevenções</th>
                    <th>Água-Viva</th>
                    <th>Pessoas Enc.</th>
                    <th>Óbitos (Mar)</th>
                    <th>Óbitos (AI)</th>
                  </tr>
                </thead>
                <tbody>
                  {boletim?.historico_operacoes?.map((h) => (
                    <tr key={h.numero_operacao} style={h.numero_operacao === 9 ? { background: 'rgba(239, 35, 60, 0.1)', fontWeight: 700 } : {}}>
                      <td>
                        <strong>{h.numero_operacao}ª Op. Verão</strong> {h.numero_operacao === 9 && <span className="badge badge-red">Atual</span>}
                      </td>
                      <td style={{ color: '#ef233c', fontWeight: 700 }}>{h.salvamentos_total?.toLocaleString()}</td>
                      <td>{h.prevencoes_total?.toLocaleString()}</td>
                      <td>{h.agua_viva_total?.toLocaleString()}</td>
                      <td>{h.pessoas_encontradas_total?.toLocaleString()}</td>
                      <td>{h.obitos_mar_total}</td>
                      <td>{h.obitos_ai_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Painel de Óbitos por Afogamento (Mês e Local) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                Óbitos por Afogamento (Por Mês)
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {boletim?.obitos_mes?.map((m) => (
                    <tr key={m.mes}>
                      <td>{m.mes}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: m.quantidade > 0 ? '#ef233c' : 'inherit' }}>
                        {m.quantidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                Óbitos por Localização
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0, 150, 199, 0.15)', borderRadius: 'var(--radius-sm)' }}>
                  <span>🌊 No Mar (Água Salgada)</span>
                  <strong style={{ color: '#ef233c', fontSize: '1.1rem' }}>{boletim?.obitos_locais?.mar || 1}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(46, 196, 182, 0.15)', borderRadius: 'var(--radius-sm)' }}>
                  <span>🏞️ Águas Internas / Rios / Lagoas</span>
                  <strong style={{ color: '#ffb703', fontSize: '1.1rem' }}>{boletim?.obitos_locais?.aguas_internas || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
