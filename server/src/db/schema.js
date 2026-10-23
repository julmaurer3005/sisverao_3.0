const { db } = require('./connection');

function initSchema() {
  db.exec(`
    -- 1. Operações
    CREATE TABLE IF NOT EXISTS operacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_operacao INTEGER NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      data_inicio_alta TEXT NOT NULL,
      data_fim_alta TEXT NOT NULL,
      data_inicio_baixa TEXT NOT NULL,
      data_fim_baixa TEXT NOT NULL,
      ativa INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Balneários / Praias
    CREATE TABLE IF NOT EXISTS balnearios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cidade TEXT NOT NULL,
      ciagv TEXT NOT NULL,
      bbm TEXT NOT NULL,
      litoral TEXT NOT NULL, -- 'Norte', 'Sul', 'AI'
      latitude REAL,
      longitude REAL,
      ordem_exibicao INTEGER DEFAULT 0,
      ativo INTEGER NOT NULL DEFAULT 1,
      UNIQUE(nome, cidade, bbm)
    );


    -- 3. Guaritas
    CREATE TABLE IF NOT EXISTS guaritas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL,
      balneario_id INTEGER NOT NULL REFERENCES balnearios(id) ON DELETE RESTRICT,
      ativa INTEGER DEFAULT 1,
      UNIQUE(codigo, balneario_id)
    );

    -- 4. Tabela Principal de Salvamentos
    CREATE TABLE IF NOT EXISTS salvamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operacao_id INTEGER NOT NULL REFERENCES operacoes(id),
      temporada TEXT NOT NULL DEFAULT 'Alta', -- 'Alta', 'Baixa'
      num_ocorrencia INTEGER NOT NULL,
      data_ocorrencia TEXT NOT NULL,
      hora_ocorrencia TEXT NOT NULL,
      hora_registro TEXT,
      dia_semana TEXT,
      balneario_id INTEGER NOT NULL REFERENCES balnearios(id),
      codigo_guarita TEXT NOT NULL,
      usou_motoaquatica INTEGER NOT NULL DEFAULT 0,
      equipamentos_empregados TEXT,
      tipo_salvamento TEXT NOT NULL DEFAULT 'RESGATE',
      grau_afogamento INTEGER,
      bandeira TEXT NOT NULL,
      perigos_associados TEXT,
      local_ocorrencia TEXT,
      distancia_esquerda_m INTEGER DEFAULT 0,
      distancia_direita_m INTEGER DEFAULT 0,
      historico_ocorrencia TEXT,
      gv_preencheu TEXT,
      
      -- Dados da Vítima
      vitima_nome TEXT DEFAULT 'Não Informado',
      vitima_sexo TEXT DEFAULT 'Não Informado',
      vitima_idade INTEGER,
      vitima_naturalidade TEXT,
      vitima_uf TEXT,
      vitima_perfil TEXT, -- Armazena JSON de familiaridade, natação, etc.

      -- Clima e Condições
      temperatura_c REAL,
      condicao_clima TEXT,
      vento_graus INTEGER,
      vento_direcao TEXT,
      
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(operacao_id, num_ocorrencia)
    );

    -- 5. Guarda-Vidas que Atuaram no Salvamento (1:N)
    CREATE TABLE IF NOT EXISTS salvamento_guarda_vidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salvamento_id INTEGER NOT NULL REFERENCES salvamentos(id) ON DELETE CASCADE,
      id_funcional TEXT NOT NULL,
      nome TEXT,
      posto TEXT,
      ordem_atuacao INTEGER DEFAULT 1
    );

    -- 6. Indicadores Diários / Acumulados por Balneário
    CREATE TABLE IF NOT EXISTS indicadores_diarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operacao_id INTEGER NOT NULL REFERENCES operacoes(id),
      balneario_id INTEGER NOT NULL REFERENCES balnearios(id),
      data_referencia TEXT NOT NULL,
      prevencoes INTEGER DEFAULT 0,
      agua_viva INTEGER DEFAULT 0,
      pessoas_encontradas INTEGER DEFAULT 0,
      obitos_mar INTEGER DEFAULT 0,
      obitos_aguas_internas INTEGER DEFAULT 0,
      aph INTEGER DEFAULT 0,
      lesoes_cortes INTEGER DEFAULT 0,
      insolacao INTEGER DEFAULT 0,
      embarcacao_deriva INTEGER DEFAULT 0,
      UNIQUE(operacao_id, balneario_id, data_referencia)
    );

    -- 7. Histórico Consolidado de Operações Anteriores
    CREATE TABLE IF NOT EXISTS historico_operacoes_resumo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_operacao INTEGER NOT NULL,
      temporada TEXT NOT NULL DEFAULT 'Total',
      litoral TEXT NOT NULL,
      balneario_nome TEXT,
      dia_operacao INTEGER,
      salvamentos_total INTEGER DEFAULT 0,
      prevencoes_total INTEGER DEFAULT 0,
      agua_viva_total INTEGER DEFAULT 0,
      pessoas_encontradas_total INTEGER DEFAULT 0,
      obitos_mar_total INTEGER DEFAULT 0,
      obitos_ai_total INTEGER DEFAULT 0
    );

    -- 8. Frases Buenas
    CREATE TABLE IF NOT EXISTS frases_buenas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frase TEXT NOT NULL
    );

    -- Índices para alta performance em relatórios e filtros
    CREATE INDEX IF NOT EXISTS idx_salvamentos_data ON salvamentos(operacao_id, data_ocorrencia);
    CREATE INDEX IF NOT EXISTS idx_salvamentos_temporada ON salvamentos(operacao_id, temporada);
    CREATE INDEX IF NOT EXISTS idx_salvamentos_balneario ON salvamentos(balneario_id);
    CREATE INDEX IF NOT EXISTS idx_salvamentos_bandeira ON salvamentos(bandeira);
    CREATE INDEX IF NOT EXISTS idx_salvamentos_guarita ON salvamentos(codigo_guarita);
    CREATE INDEX IF NOT EXISTS idx_sgv_salvamento ON salvamento_guarda_vidas(salvamento_id);
    CREATE INDEX IF NOT EXISTS idx_sgv_funcional ON salvamento_guarda_vidas(id_funcional);
    CREATE INDEX IF NOT EXISTS idx_indicadores_ref ON indicadores_diarios(operacao_id, data_referencia);
  `);
  console.log('✅ Esquema do banco de dados inicializado com sucesso.');
}

module.exports = { initSchema };
