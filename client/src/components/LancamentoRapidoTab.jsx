import React, { useState } from 'react';
import { Clipboard, CheckCircle, Plus, Save, RefreshCw, FileText, Sparkles, UserPlus, Thermometer, Wind, CloudSun } from 'lucide-react';

export default function LancamentoRapidoTab({ onSalvamentoSaved }) {
  const [modo, setModo] = useState('e193'); // 'e193' | 'relatorio_geral'

  // Estado do Smart Parser e193
  const [rawE193, setRawE193] = useState('');
  const [formData, setFormData] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fetchingClima, setFetchingClima] = useState(false);

  // Estado do Relatório Geral (Upsert)
  const [rawGeral, setRawGeral] = useState('');
  const [upserting, setUpserting] = useState(false);
  const [upsertResult, setUpsertResult] = useState(null);

  // Consulta manual / atualização do clima OpenWeatherMap
  const handleAtualizarClima = async () => {
    const cid = formData?.cidade || formData?.praia || 'Tramandaí';
    setFetchingClima(true);
    try {
      const res = await fetch(`/api/clima?cidade=${encodeURIComponent(cid)}`);
      const data = await res.json();
      if (data.success && data.clima) {
        setFormData(prev => ({
          ...prev,
          temperatura_c: data.clima.temperatura_c,
          condicao_clima: data.clima.condicao_clima,
          vento_graus: data.clima.vento_graus,
          vento_velocidade_ms: data.clima.vento_velocidade_ms,
          vento_direcao: data.clima.vento_direcao,
          clima_online: true
        }));
      } else {
        alert('Não foi possível obter os dados meteorológicos para esta localidade.');
      }
    } catch (err) {
      alert('Erro ao consultar clima: ' + err.message);
    } finally {
      setFetchingClima(false);
    }
  };

  // 1. Processar texto do e193 com Smart Parser
  const handleParseE193 = async () => {
    if (!rawE193.trim()) return alert('Cole o relatório da ocorrência antes de processar.');
    setParsing(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/parser/e193', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawE193 })
      });
      const data = await res.json();
      if (data.success) {
        setFormData(data.data);
      } else {
        alert('Erro ao processar relatório: ' + (data.error || 'Formato não reconhecido'));
      }
    } catch (err) {
      alert('Erro de conexão com o servidor: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  // 2. Salvar Ocorrência no Banco
  const handleSaveOccurrence = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/salvamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (onSalvamentoSaved) onSalvamentoSaved();
      } else {
        alert('Erro ao salvar: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      alert('Erro ao salvar ocorrência: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Adicionar Próxima Vítima (Mesmo Salvamento)
  const handleAddNextVictim = () => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev,
      vitima_nome: '',
      vitima_idade: '',
      vitima_sexo: 'Não Informado',
      vitima_naturalidade: '',
      vitima_uf: 'RS',
      vitima_perfil: {}
    }));
    setSaveSuccess(false);
  };

  // 4. Processar Relatório Geral de Atendimentos (Aba COLAR AQUI)
  const handleUpsertDailyReport = async () => {
    if (!rawGeral.trim()) return alert('Cole o relatório geral antes de processar.');
    setUpserting(true);
    setUpsertResult(null);
    try {
      const res = await fetch('/api/relatorio-geral/colar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawGeral })
      });
      const data = await res.json();
      if (data.success) {
        setUpsertResult(data);
        if (onSalvamentoSaved) onSalvamentoSaved();
      } else {
        alert('Erro ao processar relatório geral: ' + (data.error || 'Erro'));
      }
    } catch (err) {
      alert('Erro de conexão: ' + err.message);
    } finally {
      setUpserting(false);
    }
  };

  return (
    <div>
      {/* Seletor de Modo de Lançamento */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          className={`btn-secondary ${modo === 'e193' ? 'btn-primary' : ''}`}
          onClick={() => setModo('e193')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={16} />
          Smart Parser de Salvamento Individual (e193)
        </button>
        <button
          className={`btn-secondary ${modo === 'relatorio_geral' ? 'btn-primary' : ''}`}
          onClick={() => setModo('relatorio_geral')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FileText size={16} />
          Colar Relatório Geral de Prevenções (Aba COLAR AQUI)
        </button>
      </div>

      {/* MODO A: SMART PARSER DO E193 */}
      {modo === 'e193' && (
        <div style={{ display: 'grid', gridTemplateColumns: formData ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          {/* Caixa de Colagem */}
          <div className="form-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clipboard size={18} color="var(--cbm-red)" />
              1. Colar Relatório do e193
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No modal da ocorrência no e193, pressione <strong>Ctrl+A</strong> e <strong>Ctrl+C</strong>, e cole abaixo. O sistema extrairá os 44 campos e normalizará os guarda-vidas automaticamente.
            </p>

            <textarea
              className="textarea-paste"
              placeholder="Cole o relatório completo da ocorrência copiado do e193 aqui...
Exemplo:
DADOS INICIAIS DO SALVAMENTO DE PRAIA
Nº DE REGISTRO: 7014
HORARIO: 09:55
GUARITA: LN150
DADOS VÍTIMA
NOME DA VÍTIMA: GEOVANA MASUIM..."
              value={rawE193}
              onChange={(e) => setRawE193(e.target.value)}
            />

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-primary"
                onClick={handleParseE193}
                disabled={parsing}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {parsing ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                {parsing ? 'Processando Texto...' : '⚡ Processar e Preencher Ocorrência'}
              </button>
            </div>
          </div>

          {/* Formulário Visual Estruturado Após Parse */}
          {formData && (
            <div className="form-card" style={{ borderColor: 'rgba(46, 196, 182, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#2ec4b6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} />
                  2. Ocorrência Extraída com Sucesso
                </h3>
                <span className="badge badge-green">Registro #{formData.num_ocorrencia}</span>
              </div>

              {saveSuccess && (
                <div style={{ background: 'rgba(46, 196, 182, 0.2)', border: '1px solid #2ec4b6', color: '#2ec4b6', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} />
                  Ocorrência gravada com sucesso no banco de dados do SISVERÃO!
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ color: 'var(--text-muted)' }}>Data e Horário:</label>
                  <div style={{ fontWeight: 700, color: 'white' }}>{formData.data_ocorrencia} às {formData.hora_ocorrencia}</div>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)' }}>Guarita / Local:</label>
                  <div style={{ fontWeight: 700, color: '#ffb703' }}>
                    {formData.guarita} — {formData.praia}
                    {formData.cidade && formData.cidade.toUpperCase() !== formData.praia?.toUpperCase() ? ` (${formData.cidade})` : ''}
                  </div>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)' }}>Tipo de Ocorrência:</label>
                  <div style={{ fontWeight: 700, color: '#ef233c' }}>{formData.tipo_salvamento}</div>
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)' }}>Emprego de Motoaquática:</label>
                  <div>
                    {formData.usou_motoaquatica ? (
                      <span className="badge badge-moto">Sim (Jet Ski utilizado)</span>
                    ) : (
                      <span className="badge badge-dark">Não</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dados da Vítima */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: '#ffb703', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Dados da Vítima
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <label style={{ color: 'var(--text-muted)' }}>Nome:</label>
                    <input
                      type="text"
                      value={formData.vitima_nome || ''}
                      onChange={(e) => setFormData({ ...formData, vitima_nome: e.target.value })}
                      style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'var(--text-muted)' }}>Idade:</label>
                    <input
                      type="number"
                      value={formData.vitima_idade || ''}
                      onChange={(e) => setFormData({ ...formData, vitima_idade: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'var(--text-muted)' }}>Sexo:</label>
                    <select
                      value={formData.vitima_sexo || 'Não Informado'}
                      onChange={(e) => setFormData({ ...formData, vitima_sexo: e.target.value })}
                      style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem', borderRadius: '4px' }}
                    >
                      <option value="M">M</option>
                      <option value="F">F</option>
                      <option value="Não Informado">Não Informado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guarda-Vidas Atuantes */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: '#48cae4', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Guarda-Vidas que Atuaram ({formData.guarda_vidas?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {formData.guarda_vidas?.map((gv, i) => (
                    <div key={i} style={{ background: 'rgba(0, 150, 199, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>{gv.posto || 'G.V.'}:</strong> {gv.nome}</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ID: {gv.id_funcional}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dados Climáticos no Local (OpenWeatherMap) */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--cbm-yellow)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CloudSun size={17} />
                    Dados Climáticos no Local ({formData.cidade || formData.praia || 'Litoral'})
                  </div>
                  <button
                    type="button"
                    onClick={handleAtualizarClima}
                    disabled={fetchingClima}
                    className="btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Consultar API do OpenWeatherMap em tempo real"
                  >
                    <RefreshCw size={12} className={fetchingClima ? 'spin' : ''} />
                    {fetchingClima ? 'Consultando...' : 'Atualizar Clima'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <label style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Thermometer size={14} color="#ffb703" /> Temperatura:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.temperatura_c ?? ''}
                        onChange={(e) => setFormData({ ...formData, temperatura_c: parseFloat(e.target.value) || null })}
                        style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                      />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>°C</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-muted)' }}>Condição do Tempo:</label>
                    <input
                      type="text"
                      value={formData.condicao_clima || ''}
                      onChange={(e) => setFormData({ ...formData, condicao_clima: e.target.value })}
                      placeholder="ex: nublado, céu limpo"
                      style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Wind size={14} color="#48cae4" /> Vento (Direção):
                    </label>
                    <select
                      value={formData.vento_direcao || 'Nordeste'}
                      onChange={(e) => setFormData({ ...formData, vento_direcao: e.target.value })}
                      style={{ width: '100%', background: '#080d1a', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem', borderRadius: '4px' }}
                    >
                      <option value="Nordeste">Nordeste (NE)</option>
                      <option value="Leste">Leste (L)</option>
                      <option value="Sudeste">Sudeste (SE)</option>
                      <option value="Sul">Sul (S)</option>
                      <option value="Sudoeste">Sudoeste (SO)</option>
                      <option value="Oeste">Oeste (O)</option>
                      <option value="Noroeste">Noroeste (NO)</option>
                      <option value="Norte">Norte (N)</option>
                    </select>
                  </div>
                </div>

                {formData.clima_online && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.74rem', color: '#2ec4b6', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle size={13} /> Dados meteorológicos obtidos automaticamente via OpenWeatherMap ({formData.cidade})
                  </div>
                )}
              </div>

              {/* Ações de Salvar e Próxima Vítima */}
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={handleSaveOccurrence}
                  disabled={saving}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Save size={16} />
                  {saving ? 'Gravando no Banco...' : 'Confirmar e Salvar no SISVERÃO'}
                </button>

                <button
                  className="btn-secondary"
                  onClick={handleAddNextVictim}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  title="Mantém guarita, data, hora, guarda-vidas e limpa apenas os dados da vítima"
                >
                  <UserPlus size={16} />
                  + Próxima Vítima (Mesmo Salvamento)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODO B: RELATÓRIO GERAL (COLAR AQUI) COM UPSERT */}
      {modo === 'relatorio_geral' && (
        <div className="form-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--cbm-yellow)" />
            Importação Contínua de Boletim Geral (Aba "COLAR AQUI")
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Cole abaixo o <strong>RELATÓRIO GERAL DA OPERAÇÃO VERÃO</strong> com os 13 BBMs copiado do sistema. Como vocês colam várias vezes ao dia, o sistema executará um <strong>Upsert automático</strong> (sobrescreverá os contadores parciais do dia sem duplicar dados).
          </p>

          <textarea
            className="textarea-paste"
            placeholder="Cole o relatório geral aqui...
COMANDO DO CORPO DE BOMBEIROS MILITAR
RELATÓRIO GERAL DA OPERAÇÃO VERÃO
PERÍODO DE 20/10/2026 A 20/10/2026
1º BBM...
9º BBM..."
            style={{ minHeight: '260px' }}
            value={rawGeral}
            onChange={(e) => setRawGeral(e.target.value)}
          />

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn-primary"
              onClick={handleUpsertDailyReport}
              disabled={upserting}
              style={{ background: 'var(--cbm-yellow)', color: '#0d1f0d' }}
            >
              {upserting ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
              {upserting ? 'Sincronizando 13 BBMs...' : '⚡ Processar e Atualizar Indicadores Diários (Upsert)'}
            </button>

            {upsertResult && (
              <div style={{ color: '#2ec4b6', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} />
                {upsertResult.registros_atualizados} postos/balneários atualizados para a data {upsertResult.data_referencia}!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
