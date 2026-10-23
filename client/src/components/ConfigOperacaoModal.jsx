import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Check, X, Shield, PlusCircle, AlertCircle } from 'lucide-react';

export default function ConfigOperacaoModal({ isOpen, onClose, onSaved }) {
  const [operacoes, setOperacoes] = useState([]);
  const [selectedOpId, setSelectedOpId] = useState(null);
  const [formData, setFormData] = useState({
    numero_operacao: 10,
    nome: '10ª Operação Verão 2026/2027',
    data_inicio: '2026-12-19',
    data_fim: '2027-03-31',
    data_inicio_alta: '2026-12-19',
    data_fim_alta: '2027-02-10',
    data_inicio_baixa: '2027-02-11',
    data_fim_baixa: '2027-03-31',
    ativa: 1
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchOperacoes = () => {
    fetch('/api/operacoes')
      .then(r => r.json())
      .then(ops => {
        setOperacoes(ops);
        const active = ops.find(o => o.ativa === 1) || ops[0];
        if (active) {
          setSelectedOpId(active.id);
          setFormData({
            id: active.id,
            numero_operacao: active.numero_operacao,
            nome: active.nome,
            data_inicio: active.data_inicio,
            data_fim: active.data_fim,
            data_inicio_alta: active.data_inicio_alta,
            data_fim_alta: active.data_fim_alta,
            data_inicio_baixa: active.data_inicio_baixa,
            data_fim_baixa: active.data_fim_baixa,
            ativa: active.ativa
          });
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (isOpen) {
      fetchOperacoes();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectOp = (op) => {
    setSelectedOpId(op.id);
    setFormData({
      id: op.id,
      numero_operacao: op.numero_operacao,
      nome: op.nome,
      data_inicio: op.data_inicio,
      data_fim: op.data_fim,
      data_inicio_alta: op.data_inicio_alta,
      data_fim_alta: op.data_fim_alta,
      data_inicio_baixa: op.data_inicio_baixa,
      data_fim_baixa: op.data_fim_baixa,
      ativa: op.ativa
    });
    setFeedback(null);
  };

  const handleNovaOperacao = () => {
    setSelectedOpId('nova');
    const proximoNumero = operacoes.length ? Math.max(...operacoes.map(o => o.numero_operacao)) + 1 : 10;
    setFormData({
      id: null,
      numero_operacao: proximoNumero,
      nome: `${proximoNumero}ª Operação Verão`,
      data_inicio: '2026-12-19',
      data_fim: '2027-03-31',
      data_inicio_alta: '2026-12-19',
      data_fim_alta: '2027-02-10',
      data_inicio_baixa: '2027-02-11',
      data_fim_baixa: '2027-03-31',
      ativa: 1
    });
    setFeedback(null);
  };

  const handleChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      // Ajuste automático da baixa temporada se mudar o fim da alta
      if (field === 'data_fim_alta' && val) {
        try {
          const d = new Date(val);
          d.setDate(d.getDate() + 1);
          const nextDay = d.toISOString().split('T')[0];
          updated.data_inicio_baixa = nextDay;
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const resp = await fetch('/api/operacao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        setFeedback({ type: 'success', message: `✅ Operação ${formData.numero_operacao}ª salva com sucesso!` });
        if (onSaved) onSaved(data.operacao);
        setTimeout(() => {
          fetchOperacoes();
        }, 600);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao salvar operação.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        padding: '1.75rem'
      }}>
        {/* Cabeçalho do Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Settings size={22} color="var(--cbm-yellow)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'white', fontFamily: 'var(--font-heading)' }}>
              Configuração da Operação Verão
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Seletor de Operações Cadastradas */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Selecione a Operação para Configurar ou Ativar:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {operacoes.map(op => (
              <button
                key={op.id}
                type="button"
                onClick={() => handleSelectOp(op)}
                className={`btn-secondary ${selectedOpId === op.id ? 'active' : ''}`}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderColor: selectedOpId === op.id ? 'var(--cbm-yellow)' : 'var(--border-color)',
                  background: selectedOpId === op.id ? 'rgba(255, 183, 3, 0.15)' : 'var(--bg-tertiary)',
                  color: selectedOpId === op.id ? 'var(--cbm-yellow)' : 'var(--text-main)'
                }}
              >
                <Shield size={14} color={op.ativa ? '#2ec4b6' : 'var(--text-muted)'} />
                {op.numero_operacao}ª Op. Verão
                {op.ativa === 1 && <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '2px 5px' }}>Ativa</span>}
              </button>
            ))}
            <button
              type="button"
              onClick={handleNovaOperacao}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={14} /> + Nova
            </button>
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            background: feedback.type === 'success' ? 'rgba(46, 196, 182, 0.15)' : 'rgba(239, 35, 60, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? '#2ec4b6' : '#ef233c'}`,
            color: feedback.type === 'success' ? '#2ec4b6' : '#ef233c',
            fontSize: '0.85rem'
          }}>
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dados Gerais da Operação */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Número:</label>
              <input
                type="number"
                value={formData.numero_operacao}
                onChange={(e) => handleChange('numero_operacao', parseInt(e.target.value, 10))}
                required
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div className="form-group">
              <label>Nome Oficial da Operação:</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Período Geral da Operação */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> Período Geral da Operação:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Data de Abertura:</label>
                <input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleChange('data_inicio', e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Data de Encerramento:</label>
                <input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => handleChange('data_fim', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Destaque Solicitado: Início e Fim da Alta Temporada */}
          <div style={{ background: 'rgba(255, 183, 3, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid rgba(255, 183, 3, 0.3)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cbm-yellow)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ☀️ Alta Temporada (Período Crítico / Carnaval)
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0 0 0.6rem 0' }}>
              Define a separação estatística automática: todos os salvamentos até o fim da alta temporada são classificados como Alta Temporada.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--cbm-yellow)' }}>Início da Alta Temporada:</label>
                <input
                  type="date"
                  value={formData.data_inicio_alta}
                  onChange={(e) => handleChange('data_inicio_alta', e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--cbm-yellow)' }}>Fim da Alta Temporada:</label>
                <input
                  type="date"
                  value={formData.data_fim_alta}
                  onChange={(e) => handleChange('data_fim_alta', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Baixa Temporada */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              ⛅ Baixa Temporada (Pós-Carnaval até Encerramento)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Início da Baixa:</label>
                <input
                  type="date"
                  value={formData.data_inicio_baixa}
                  onChange={(e) => handleChange('data_inicio_baixa', e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Fim da Baixa:</label>
                <input
                  type="date"
                  value={formData.data_fim_baixa}
                  onChange={(e) => handleChange('data_fim_baixa', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkbox Ativa */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              type="checkbox"
              id="opAtivaCheck"
              checked={formData.ativa === 1 || formData.ativa === true}
              onChange={(e) => handleChange('ativa', e.target.checked ? 1 : 0)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--cbm-red)' }}
            />
            <label htmlFor="opAtivaCheck" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'white', fontWeight: 600 }}>
              Definir esta como a Operação Ativa no Sistema
            </label>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.55rem 1rem' }}>
              Fechar
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? 'Salvando...' : <><Check size={16} /> Salvar Configurações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
