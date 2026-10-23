import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function ExploradorTab({ temporadaAtiva }) {
  const [salvamentos, setSalvamentos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [operacao, setOperacao] = useState('todas');
  const [temporada, setTemporada] = useState(temporadaAtiva || 'Todas');
  const [litoral, setLitoral] = useState('Todos');
  const [bandeira, setBandeira] = useState('Todas');
  const [moto, setMoto] = useState('');
  const [busca, setBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Ocorrência selecionada para visualização modal
  const [selectedOco, setSelectedOco] = useState(null);

  const fetchSalvamentos = () => {
    setLoading(true);
    const params = new URLSearchParams({
      pagina,
      limite: 20
    });
    if (operacao) params.append('operacao', operacao);
    if (temporada && temporada !== 'Todas') params.append('temporada', temporada);
    if (litoral && litoral !== 'Todos') params.append('litoral', litoral);
    if (bandeira && bandeira !== 'Todas') params.append('bandeira', bandeira);
    if (moto !== '') params.append('usou_moto', moto);
    if (busca) params.append('busca', busca);
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);

    fetch(`/api/salvamentos?${params.toString()}`)
      .then(r => r.json())
      .then(res => {
        setSalvamentos(res.itens || []);
        setTotal(res.total || 0);
        setPaginas(res.paginas || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSalvamentos();
  }, [pagina, operacao, temporada, litoral, bandeira, moto]);

  const handleExportCSV = () => {
    if (!salvamentos.length) return;
    const headers = ['Nº Registro', 'Data', 'Hora', 'Litoral', 'BBM', 'Cidade', 'Praia', 'Guarita', 'Vítima', 'Sexo', 'Idade', 'Bandeira', 'Tipo', 'Motoaquática', 'Temp (°C)', 'Clima', 'Vento'];
    const rows = salvamentos.map(s => [
      s.num_ocorrencia,
      s.data_ocorrencia,
      s.hora_ocorrencia,
      s.litoral,
      s.bbm,
      s.cidade,
      s.praia,
      s.codigo_guarita,
      `"${s.vitima_nome || ''}"`,
      s.vitima_sexo,
      s.vitima_idade,
      s.bandeira,
      s.tipo_salvamento,
      s.usou_motoaquatica ? 'SIM' : 'NÃO',
      s.temperatura_c || '',
      `"${s.condicao_clima || ''}"`,
      s.vento_direcao || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `salvamentos_cbmrs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Barra de Filtros Integrada */}
      <div className="form-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'white' }}>
            <Filter size={18} color="var(--cbm-red)" />
            Filtro Geral Multi-Critério
          </div>
          <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
            <Download size={14} /> Exportar CSV ({total} registros)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
          {/* Operação */}
          <div>
            <label style={{ color: 'var(--text-muted)' }}>Operação:</label>
            <select
              value={operacao}
              onChange={(e) => { setOperacao(e.target.value); setPagina(1); }}
              style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.45rem', borderRadius: '4px' }}
            >
              <option value="todas">Todas as Operações</option>
              <option value="10">10ª Operação Verão (2026/2027)</option>
              <option value="9">9ª Operação Verão (2025/2026 - 854 Salv.)</option>
            </select>
          </div>

          {/* Temporada */}
          <div>
            <label style={{ color: 'var(--text-muted)' }}>Temporada:</label>
            <select
              value={temporada}
              onChange={(e) => { setTemporada(e.target.value); setPagina(1); }}
              style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.45rem', borderRadius: '4px' }}
            >
              <option value="Todas">Todas as Fases</option>
              <option value="Alta">Alta Temporada</option>
              <option value="Baixa">Baixa Temporada</option>
            </select>
          </div>

          {/* Litoral */}
          <div>
            <label style={{ color: 'var(--text-muted)' }}>Litoral:</label>
            <select
              value={litoral}
              onChange={(e) => { setLitoral(e.target.value); setPagina(1); }}
              style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.45rem', borderRadius: '4px' }}
            >
              <option value="Todos">Todos os Litorais</option>
              <option value="Norte">Litoral Norte (9º BBM)</option>
              <option value="Sul">Litoral Sul (3º BBM)</option>
              <option value="AI">Águas Internas</option>
            </select>
          </div>

          {/* Bandeira */}
          <div>
            <label style={{ color: 'var(--text-muted)' }}>Bandeira:</label>
            <select
              value={bandeira}
              onChange={(e) => { setBandeira(e.target.value); setPagina(1); }}
              style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.45rem', borderRadius: '4px' }}
            >
              <option value="Todas">Todas as Bandeiras</option>
              <option value="VERDE">Verde</option>
              <option value="AMARELA">Amarela</option>
              <option value="VERMELHA">Vermelha</option>
              <option value="PRETA">Preta</option>
              <option value="NÃO HAVIA">Não Havia</option>
            </select>
          </div>

          {/* Motoaquática */}
          <div>
            <label style={{ color: 'var(--text-muted)' }}>Motoaquática:</label>
            <select
              value={moto}
              onChange={(e) => { setMoto(e.target.value); setPagina(1); }}
              style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.45rem', borderRadius: '4px' }}
            >
              <option value="">Todos</option>
              <option value="1">Com Motoaquática</option>
              <option value="0">Sem Motoaquática</option>
            </select>
          </div>

          {/* Busca por Texto */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--text-muted)' }}>Pesquisar por Vítima, Nº Registro ou Histórico:</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Ex: Geovana, 7014, repuxo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchSalvamentos()}
                style={{ flex: 1, background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.45rem', borderRadius: '4px' }}
              />
              <button onClick={fetchSalvamentos} className="btn-secondary" style={{ padding: '0.45rem 0.75rem' }}>
                <Search size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Ocorrências */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Data/Hora</th>
              <th>Guarita</th>
              <th>Praia / Cidade</th>
              <th>Vítima</th>
              <th>Sexo/Idade</th>
              <th>Bandeira</th>
              <th>Tipo</th>
              <th>Moto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados...</td>
              </tr>
            ) : salvamentos.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Nenhum salvamento encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              salvamentos.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'white' }}>#{s.num_ocorrencia}</td>
                  <td style={{ fontSize: '0.8rem' }}>{s.data_ocorrencia}<br/><span style={{ color: 'var(--text-dim)' }}>{s.hora_ocorrencia}</span></td>
                  <td><span className="badge badge-dark">{s.codigo_guarita}</span></td>
                  <td><strong>{s.praia}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.cidade} ({s.bbm})</span></td>
                  <td>{s.vitima_nome}</td>
                  <td>{s.vitima_sexo} / {s.vitima_idade || '-'} anos</td>
                  <td>
                    <span className={`badge ${
                      s.bandeira === 'VERDE' ? 'badge-green' :
                      s.bandeira === 'AMARELA' ? 'badge-yellow' :
                      s.bandeira === 'VERMELHA' ? 'badge-red' : 'badge-dark'
                    }`}>
                      {s.bandeira}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.tipo_salvamento}</td>
                  <td>
                    {s.usou_motoaquatica ? <span className="badge badge-moto">Sim</span> : <span style={{ color: 'var(--text-dim)' }}>Não</span>}
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedOco(s)}
                    >
                      <Eye size={12} /> Detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div>
          Mostrando página <strong>{pagina}</strong> de <strong>{paginas}</strong> (Total: {total} salvamentos)
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            disabled={pagina <= 1}
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            style={{ padding: '0.35rem 0.75rem' }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <button
            className="btn-secondary"
            disabled={pagina >= paginas}
            onClick={() => setPagina(p => Math.min(paginas, p + 1))}
            style={{ padding: '0.35rem 0.75rem' }}
          >
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal de Detalhes da Ocorrência */}
      {selectedOco && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="form-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'white' }}>
                Ocorrência #{selectedOco.num_ocorrencia} — {selectedOco.tipo_salvamento}
              </h3>
              <button onClick={() => setSelectedOco(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div><strong>Data / Horário:</strong> {selectedOco.data_ocorrencia} às {selectedOco.hora_ocorrencia} (Fase: {selectedOco.temporada} Temporada)</div>
              <div><strong>Guarita:</strong> {selectedOco.codigo_guarita} — {selectedOco.praia}, {selectedOco.cidade} ({selectedOco.bbm} / {selectedOco.ciagv})</div>
              <div><strong>Vítima:</strong> {selectedOco.vitima_nome} ({selectedOco.vitima_sexo}, {selectedOco.vitima_idade || 'Idade não informada'})</div>
              <div><strong>Bandeira:</strong> {selectedOco.bandeira} | <strong>Motoaquática:</strong> {selectedOco.usou_motoaquatica ? 'Sim' : 'Não'}</div>
              <div><strong>Condições Climáticas:</strong> {selectedOco.temperatura_c ? `${selectedOco.temperatura_c}°C` : 'N/I'} — {selectedOco.condicao_clima || 'N/I'} (Vento: {selectedOco.vento_direcao || 'N/I'})</div>
              
              {selectedOco.historico_ocorrencia && (
                <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--cbm-yellow)', marginBottom: '0.25rem' }}>Histórico Relatado:</div>
                  <p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>{selectedOco.historico_ocorrencia}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setSelectedOco(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
