import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Sparkles, Database, BarChart3, Shield, Flame, Settings, Clock, FileText } from 'lucide-react';
import PreliminarTab from './components/PreliminarTab';
import ResumoDiarioTab from './components/ResumoDiarioTab';
import LancamentoRapidoTab from './components/LancamentoRapidoTab';
import ExploradorTab from './components/ExploradorTab';
import InteligenciaTab from './components/InteligenciaTab';
import ConfigOperacaoModal from './components/ConfigOperacaoModal';

const getTodayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('resumo_diario');
  const [temporada, setTemporada] = useState('Total'); // 'Total' | 'Alta' | 'Baixa'
  const [dataRef, setDataRef] = useState(getTodayIso());
  const [fraseBuenas, setFraseBuenas] = useState('');
  const [operacaoAtiva, setOperacaoAtiva] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Busca dados de status / operação ativa
  const loadOperacao = () => {
    fetch('/api/status')
      .then(async (r) => {
        const ct = r.headers.get('content-type') || '';
        if (!r.ok || !ct.includes('application/json')) return null;
        return r.json();
      })
      .then(d => {
        if (d && d.operacao) setOperacaoAtiva(d.operacao);
        else setOperacaoAtiva({ numero_operacao: 10, nome: '10ª Operação Verão', ano_inicio: 2026, ano_fim: 2027 });
      })
      .catch(() => {
        setOperacaoAtiva({ numero_operacao: 10, nome: '10ª Operação Verão', ano_inicio: 2026, ano_fim: 2027 });
      });
  };

  useEffect(() => {
    loadOperacao();
  }, [refreshTrigger]);

  // Busca frase Buenas
  useEffect(() => {
    fetch('/api/buenas')
      .then(async (r) => {
        const ct = r.headers.get('content-type') || '';
        if (!r.ok || !ct.includes('application/json')) return null;
        return r.json();
      })
      .then(d => {
        if (d && d.frase) setFraseBuenas(d.frase);
        else setFraseBuenas('Buenas e me espalho! Nos braços dos gaúchos!');
      })
      .catch(() => setFraseBuenas('Buenas e me espalho! Nos braços dos gaúchos!'));
  }, []);

  const handleDataSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOperacaoSaved = (updatedOp) => {
    setOperacaoAtiva(updatedOp);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Header Institucional CBMRS */}
      <header className="header-top">
        <div className="brand-wrapper">
          <div className="brand-badge">
            <Flame size={20} style={{ display: 'inline', marginRight: '6px' }} />
            CBMRS
          </div>
          <div className="brand-title">
            <h1>SISVERÃO</h1>
            <p>
              Gestão e Inteligência de Salvamentos — <strong>{operacaoAtiva ? operacaoAtiva.nome : '10ª Operação Verão 2026/2027'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {/* Banner Buenas Gaúcho */}
          {fraseBuenas && (
            <div className="buenas-banner">
              <span>🧉</span> {fraseBuenas}
            </div>
          )}

          {/* Botão de Configuração de Operação & Marcos de Alta Temporada */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              borderColor: 'var(--cbm-yellow)',
              color: 'var(--cbm-yellow)',
              background: 'rgba(255, 183, 3, 0.08)'
            }}
            title="Definir início e fim da Alta Temporada e gerenciar operações"
          >
            <Settings size={15} />
            <span>Configurar Operação</span>
          </button>
        </div>
      </header>

      {/* Navegação por Abas (Preliminar e Resumo Diário separados) */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'preliminar' ? 'active' : ''}`}
          onClick={() => setActiveTab('preliminar')}
        >
          <Clock size={18} />
          Preliminar (14h)
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'resumo_diario' ? 'active' : ''}`}
          onClick={() => setActiveTab('resumo_diario')}
        >
          <FileText size={18} />
          Resumo Diário Oficial (Chefia)
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'lancamento' ? 'active' : ''}`}
          onClick={() => setActiveTab('lancamento')}
        >
          <Sparkles size={18} />
          Lançamento Rápido (Parser e193)
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'explorador' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorador')}
        >
          <Database size={18} />
          Explorador Geral {operacaoAtiva?.numero_operacao === 9 ? '(854 Ocorrências)' : '(Ocorrências)'}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'inteligencia' ? 'active' : ''}`}
          onClick={() => setActiveTab('inteligencia')}
        >
          <BarChart3 size={18} />
          Inteligência Climática & Gráficos
        </button>
      </nav>

      {/* Conteúdo Principal */}
      <main className="main-content">
        {/* Barra Global de Seleção de Temporada (Alta vs Baixa) */}
        {(activeTab === 'preliminar' || activeTab === 'resumo_diario') && (
          <div className="season-selector-bar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Shield size={16} color="var(--cbm-red)" />
              Fase Estatística:
            </div>
            <div className="season-btn-group">
              <button
                className={`season-btn ${temporada === 'Total' ? 'active' : ''}`}
                onClick={() => setTemporada('Total')}
              >
                Operação Completa (Total)
              </button>
              <button
                className={`season-btn ${temporada === 'Alta' ? 'active' : ''}`}
                onClick={() => setTemporada('Alta')}
              >
                Alta Temporada {operacaoAtiva?.data_fim_alta && `(até ${operacaoAtiva.data_fim_alta.split('-').reverse().slice(0, 2).join('/')})`}
              </button>
              <button
                className={`season-btn ${temporada === 'Baixa' ? 'active' : ''}`}
                onClick={() => setTemporada('Baixa')}
              >
                Baixa Temporada (Pós-Carnaval)
              </button>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>
                Operação Ativa: <strong style={{ color: 'white' }}>{operacaoAtiva?.numero_operacao || 10}ª Op.</strong>
                {operacaoAtiva?.data_fim_alta && (
                  <span style={{ marginLeft: '6px', color: 'var(--cbm-yellow)' }}>
                    (Alta até {operacaoAtiva.data_fim_alta.split('-').reverse().join('/')})
                  </span>
                )}
              </span>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                Editar Datas
              </button>
            </div>
          </div>
        )}

        {/* Renderização das Telas Separadas */}
        {activeTab === 'preliminar' && (
          <PreliminarTab
            key={`prelim-${refreshTrigger}-${temporada}-${operacaoAtiva?.id}`}
            temporada={temporada}
            dataRef={dataRef}
            onDataChange={setDataRef}
          />
        )}

        {activeTab === 'resumo_diario' && (
          <ResumoDiarioTab
            key={`resumo-${refreshTrigger}-${temporada}-${operacaoAtiva?.id}`}
            temporada={temporada}
            dataRef={dataRef}
            onDataChange={setDataRef}
            operacaoAtiva={operacaoAtiva}
          />
        )}

        {activeTab === 'lancamento' && (
          <LancamentoRapidoTab onSalvamentoSaved={handleDataSaved} />
        )}

        {activeTab === 'explorador' && (
          <ExploradorTab temporadaAtiva={temporada} />
        )}

        {activeTab === 'inteligencia' && (
          <InteligenciaTab temporadaAtiva={temporada} />
        )}
      </main>

      {/* Modal de Configuração de Operação & Marcos de Temporada */}
      <ConfigOperacaoModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={handleOperacaoSaved}
      />

      {/* Rodapé Institucional */}
      <footer style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        SISVERÃO — Corpo de Bombeiros Militar do Estado do Rio Grande do Sul (CBMRS) &bull; {operacaoAtiva?.nome || '10ª Operação Verão'}
      </footer>
    </div>
  );
}
