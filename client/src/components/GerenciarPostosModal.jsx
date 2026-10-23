import React, { useState, useEffect, useMemo } from 'react';
import { Waves, Search, Check, X, Eye, EyeOff, Shield, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GerenciarPostosModal({ isOpen, onClose, onSaved }) {
  const [balnearios, setBalnearios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos' | 'ativos' | 'inativos'
  const [filtroBbm, setFiltroBbm] = useState('todos');
  const [feedback, setFeedback] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchBalnearios = () => {
    setLoading(true);
    fetch('/api/balnearios?litoral=AI')
      .then(r => r.json())
      .then(data => {
        setBalnearios(data);
      })
      .catch(err => {
        console.error('Erro ao carregar balneários:', err);
        setFeedback({ type: 'error', text: 'Falha ao carregar balneários de Águas Internas.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchBalnearios();
      setFeedback(null);
    }
  }, [isOpen]);

  const handleToggleAtivo = async (item) => {

    const novoStatus = item.ativo === 1 ? 0 : 1;
    setSavingId(item.id);

    // Atualização otimista
    setBalnearios(prev => prev.map(b => b.id === item.id ? { ...b, ativo: novoStatus } : b));

    try {
      const res = await fetch(`/api/balnearios/${item.id}/toggle-ativo`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na requisição');

      setFeedback({
        type: 'success',
        text: novoStatus === 1
          ? `🟢 "${item.nome}" (${item.cidade}) ATIVADA no relatório!`
          : `⚪ "${item.nome}" (${item.cidade}) DESATIVADA (ocultada do relatório)!`
      });

      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      // Reverte em caso de falha
      setBalnearios(prev => prev.map(b => b.id === item.id ? { ...b, ativo: item.ativo } : b));
      setFeedback({ type: 'error', text: 'Não foi possível alterar o status do balneário.' });
    } finally {
      setSavingId(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleBatchStatus = async (ids, novoAtivo, bbmLabel = '') => {
    if (!ids || ids.length === 0) return;
    setLoading(true);

    // Atualização otimista
    const idsSet = new Set(ids);
    setBalnearios(prev => prev.map(b => idsSet.has(b.id) ? { ...b, ativo: novoAtivo } : b));

    try {
      const res = await fetch('/api/balnearios/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, ativo: novoAtivo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na requisição');

      setFeedback({
        type: 'success',
        text: novoAtivo === 1
          ? `🟢 ${ids.length} praias ativadas ${bbmLabel ? `no ${bbmLabel}` : ''}!`
          : `⚪ ${ids.length} praias desativadas ${bbmLabel ? `no ${bbmLabel}` : ''}!`
      });

      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      fetchBalnearios();
      setFeedback({ type: 'error', text: 'Erro ao atualizar grupo de praias.' });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Extração do número do BBM para ordenação rigorosa
  const getBbmNum = (bbmStr) => {
    const m = (bbmStr || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 999;
  };

  // Filtragem e agrupamento por BBM
  const bbmsAgrupados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtrados = balnearios.filter(b => {
      // Filtro de texto
      if (term) {
        const matchNome = (b.nome || '').toLowerCase().includes(term);
        const matchCid = (b.cidade || '').toLowerCase().includes(term);
        const matchBbm = (b.bbm || '').toLowerCase().includes(term);
        if (!matchNome && !matchCid && !matchBbm) return false;
      }

      // Filtro de status
      if (filtroStatus === 'ativos' && b.ativo === 0) return false;
      if (filtroStatus === 'inativos' && b.ativo === 1) return false;

      // Filtro de BBM
      if (filtroBbm !== 'todos') {
        const bbmNum = getBbmNum(b.bbm);
        if (bbmNum !== parseInt(filtroBbm, 10)) return false;
      }

      return true;
    });

    // Agrupa por BBM ordenado
    const bbmMap = new Map();
    filtrados.forEach(item => {
      const num = getBbmNum(item.bbm);
      const canonicalBbm = `${num}º BBM`;
      if (!bbmMap.has(num)) {
        bbmMap.set(num, {
          bbmNum: num,
          bbm: canonicalBbm,
          items: []
        });
      }
      bbmMap.get(num).items.push(item);
    });

    const agrupados = Array.from(bbmMap.values()).sort((a, b) => a.bbmNum - b.bbmNum);
    agrupados.forEach(g => {
      g.items.sort((a, b) => {
        const c = (a.cidade || '').localeCompare(b.cidade || '', 'pt-BR');
        if (c !== 0) return c;
        return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
      });
    });

    return agrupados;
  }, [balnearios, searchTerm, filtroStatus, filtroBbm]);

  const totalBalnearios = balnearios.length;
  const totalAtivos = balnearios.filter(b => b.ativo === 1).length;
  const totalInativos = totalBalnearios - totalAtivos;

  if (!isOpen) return null;

  return (

    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          height: '88vh',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden'
        }}
      >

        {/* Cabeçalho do Modal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Waves size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'white', fontFamily: 'var(--font-heading)' }}>
                Gerenciar Postos Ativos — Águas Internas
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Oculte praias que não possuem serviço de guarda-vidas nesta temporada para não poluir o relatório oficial.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de KPIs e Estatísticas */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status dos Postos:</span>
            <span
              style={{
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontWeight: 600
              }}
            >
              🟢 {totalAtivos} Ativos (Exibidos)
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontWeight: 600
              }}
            >
              ⚪ {totalInativos} Ocultos (Desativados)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleBatchStatus(balnearios.map(b => b.id), 1)}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              title="Ativar todas as 60 praias"
            >
              Ativar Todas
            </button>
            <button
              onClick={() => handleBatchStatus(balnearios.filter(b => b.ativo === 1).map(b => b.id), 0)}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              title="Ocultar todas as praias"
            >
              Desativar Todas
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            flexShrink: 0
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Buscar por município ou balneário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                background: '#080d1a',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                fontSize: '0.82rem'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`season-btn ${filtroStatus === 'todos' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              Todos ({totalBalnearios})
            </button>
            <button
              onClick={() => setFiltroStatus('ativos')}
              className={`season-btn ${filtroStatus === 'ativos' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              Ativos ({totalAtivos})
            </button>
            <button
              onClick={() => setFiltroStatus('inativos')}
              className={`season-btn ${filtroStatus === 'inativos' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              Ocultos ({totalInativos})
            </button>
          </div>

          <select
            value={filtroBbm}
            onChange={(e) => setFiltroBbm(e.target.value)}
            style={{
              padding: '0.45rem 0.65rem',
              background: '#080d1a',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              fontSize: '0.82rem'
            }}
          >
            <option value="todos">Todos os Batalhões</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(n => (
              <option key={n} value={n}>{n}º BBM</option>
            ))}
          </select>
        </div>

        {/* Feedback Temporário */}
        {feedback && (
          <div
            style={{
              padding: '0.55rem 1.5rem',
              background: feedback.type === 'success' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: feedback.type === 'success' ? '#4ade80' : '#f87171',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Corpo com a Lista de Balneários Agrupados por BBM */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {loading && balnearios.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando postos de Águas Internas...
            </div>
          ) : bbmsAgrupados.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum posto encontrado para o filtro aplicado.
            </div>
          ) : (
            bbmsAgrupados.map(group => {
              const ativasNoBbm = group.items.filter(b => b.ativo === 1).length;
              const totalNoBbm = group.items.length;

              return (
                <div
                  key={group.bbm}
                  style={{
                    flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden'
                  }}
                >

                  {/* Cabeçalho do BBM */}
                  <div
                    style={{
                      padding: '0.55rem 0.85rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: '#fef08a',
                          fontSize: '0.88rem',
                          fontFamily: 'var(--font-heading)'
                        }}
                      >
                        {group.bbm}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({ativasNoBbm} de {totalNoBbm} {totalNoBbm === 1 ? 'praia ativa' : 'praias ativas'})
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleBatchStatus(group.items.map(b => b.id), 1, group.bbm)}
                        className="btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}
                        title={`Ativar todas do ${group.bbm}`}
                      >
                        Ativar BBM
                      </button>
                      <button
                        onClick={() => handleBatchStatus(group.items.map(b => b.id), 0, group.bbm)}
                        className="btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}
                        title={`Desativar todas do ${group.bbm}`}
                      >
                        Ocultar BBM
                      </button>
                    </div>
                  </div>

                  {/* Lista de Praias do BBM */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.items.map((item, idx) => {
                      const isAtivo = item.ativo === 1;
                      const isSaving = savingId === item.id;

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.85rem',
                            fontSize: '0.85rem',
                            borderBottom: idx < group.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                            background: isAtivo ? 'transparent' : 'rgba(0, 0, 0, 0.25)',
                            opacity: isAtivo ? 1 : 0.65,
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                          }}
                        >

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <button
                              onClick={() => handleToggleAtivo(item)}
                              disabled={isSaving}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: 'none',
                                background: isAtivo ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                color: isAtivo ? '#4ade80' : 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s'
                              }}
                              title={isAtivo ? 'Clique para desativar e ocultar do relatório' : 'Clique para ativar no relatório'}
                            >
                              {isSaving ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : isAtivo ? (
                                <Eye size={15} />
                              ) : (
                                <EyeOff size={15} />
                              )}
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, color: 'white' }}>
                                  {item.cidade}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
                                <span style={{ color: isAtivo ? '#bbf7d0' : 'var(--text-dim)', fontWeight: 500 }}>
                                  {item.nome}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {/* Badge de Status */}
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                                background: isAtivo ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                color: isAtivo ? '#4ade80' : 'var(--text-muted)'
                              }}
                            >
                              {isAtivo ? 'Ativa (No Relatório)' : 'Oculta (Sem Serviço)'}
                            </span>

                            {/* Switch de Ativação */}
                            <button
                              type="button"
                              onClick={() => handleToggleAtivo(item)}
                              disabled={isSaving}
                              style={{
                                width: '42px',
                                height: '22px',
                                borderRadius: '12px',
                                background: isAtivo ? '#22c55e' : '#334155',
                                position: 'relative',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                padding: 0
                              }}
                              title={isAtivo ? 'Desativar praia' : 'Ativar praia'}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  left: isAtivo ? '22px' : '2px',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: 'white',
                                  transition: 'left 0.2s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                                }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Modal */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            💡 Praias desativadas somem instantaneamente das tabelas e imagens PNG de Águas Internas.
          </div>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
          >
            Concluir & Voltar ao Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
