# PRD & Especificação Técnica de MVP — SISVERÃO (Gestão e Inteligência de Salvamentos)

> **Instrução para o Agente / IDE (Antigravity):** Este documento contém a especificação completa do MVP do sistema web **SISVERÃO**, projetado para substituir a planilha operacional de controle de salvamentos da Operação Verão (CBMRS). Utilize este arquivo como fonte única de verdade (Single Source of Truth) para criar o banco de dados, backend, scripts de importação de CSV, parser inteligente de entrada e interfaces de usuário.

---

## 1. Visão Geral e Escopo do MVP
O objetivo do **SISVERÃO** é transformar o controle de **Salvamentos Geral (Operação Verão do CBMRS)** em uma aplicação web de alto desempenho, eliminando a digitação manual morosa e gerando automaticamente os gráficos, tabelas e dashboards para apresentação e divulgação institucional.

A Operação Verão ocorre anualmente entre meados de dezembro e o final de março. Um requisito fundamental de negócio é a **segregação entre Alta Temporada e Baixa Temporada**, cujas estatísticas devem ser apresentadas de forma **individualizada e comparativa**, além dos consolidados gerais.

A fonte primária dos dados de salvamento é o sistema oficial **e193 do CBMRS** (`e193.cbm.rs.gov.br/salvamento`). Como o e193 **não possui funcionalidade de exportação de relatórios em lote**, o SISVERÃO implementará um **Smart Text Parser (Colagem Inteligente)**, permitindo que o operador copie o relatório textual da ocorrência no e193 e cole no sistema, que extrairá e validará instantaneamente todas as variáveis.

### Escopo Fechado do MVP:
1. **Lançamento Rápido com Smart Text Parser do e193 (Exclusividade SISVERÃO):** Área de colagem instantânea onde o texto do e193 é processado por regex/regras determinísticas, populando todos os dados da ocorrência, guarda-vidas atuantes, histórico, perfil e perigos em milissegundos.
2. **Gestão de Salvamentos & Divisão Alta/Baixa Temporada:** CRUD completo com vinculação à temporada correta e autopreenchimento hierárquico por Guarita e busca de clima.
3. **Importador dos CSVs Históricos:** Script para importar os dados tratados da 9ª Operação Verão (854+ salvamentos) e o histórico acumulado das operações anteriores (4ª à 8ª Operação).
4. **Filtro Geral e Resumido Interativo:** Painel multi-critério com contadores dinâmicos instantâneos e atalhos por Temporada (Alta, Baixa, Total), Litoral, BBM, etc.
5. **Painel de Inteligência Climática e Tipologia:** Gráficos cruzando salvamentos por Vento, Temperatura, Condição Climática, Bandeira, Faixa Etária, Faixa Horária e Grau de Afogamento.
6. **Boletim Diário Preliminar e Comparativo Histórico:** Consolidação diária e acumulada por Litoral (Norte, Sul e Águas Internas) cruzando Salvamentos com os contadores de Prevenções, Água-viva, Pessoas Encontradas e Óbitos, com comparativo "Dia D".
7. **Header "Buenas":** Saudação dinâmica da tradição gaúcha sorteada no topo do Dashboard.

---

## 2. Dicionário de Dados e Regras de Negócio

### 2.1. Campos de Entrada (Extraídos via Smart Parser do e193 ou Importação)
* `num_ocorrencia` (Int): Número do registro (Ex: `7014`).
* `data_ocorrencia` (Date): Data do salvamento (Ex: `2026-01-01`).
* `hora_ocorrencia` (Time): Horário do salvamento (Ex: `09:55`).
* `hora_registro` (DateTime nullable): Horário em que foi lançado no e193 (Ex: `2026-01-01 10:19:00`).
* `dia_semana` (Varchar): Dia da semana derivado da data (Ex: `QUINTA-FEIRA`).
* `codigo_guarita` (Varchar): Código identificador da guarita (Ex: `LN150`, `LS021`, `AI043`).
* `tipo_salvamento` (Enum): Extraído de `COD. DE OCORRÊNCIA` (`RESGATE`, `AFOGAMENTO COM RECUPERAÇÃO EM ÁGUA SALGADA`, `AFOGAMENTO COM RECUPERAÇÃO EM ÁGUA DOCE`, `AFOGAMENTO SEGUIDO DE MORTE EM ÁGUA SALGADA`, `AFOGAMENTO SEGUIDO DE MORTE EM ÁGUA DOCE`).
* `grau_afogamento` (Int nullable): Valores de `1` a `6`. Se `tipo_salvamento == 'RESGATE'` ou `'SEM GRAU'`, armazena `NULL`.
* `usou_motoaquatica` (Boolean): Identificado se em `EQUIPAMENTO EMPREGADO NO RESGATE` contiver `'MOTO AQUÁTICA'` ou se for sinalizado no formulário (`TRUE` / `FALSE`).
* `equipamentos_empregados` (Varchar nullable): Lista textual dos equipamentos (Ex: `'MOTO AQUÁTICA, FLUTUADOR (LIFE BELT)'`).
* `bandeira` (Enum): `'VERDE'`, `'AMARELA'`, `'VERMELHA'`, `'PRETA'`, `'NÃO HAVIA'`.
* `perigos_associados` (Varchar nullable): Extraído de `PERIGOS DA PRAIA ASSOCIADOS AO ACIDENTE` (Ex: `'CORRENTE DE RETORNO (REPUXO)'`).
* `local_ocorrencia` (Varchar nullable): Extraído de `LOCAL DA OCORRÊNCIA` (Ex: `'NA ZONA DA ARREBENTAÇÃO'`).
* `distancia_esquerda_m` (Int default 0) e `distancia_direita_m` (Int default 0): Distância da guarita em metros.
* `historico_ocorrencia` (Text nullable): Relato detalhado do salvamento registrado no e193.
* `gv_preencheu` (Varchar nullable): Militar ou civil que relatou a ocorrência (Ex: `'4673760 - GABRIELA SANTOS TODENTE'`).

#### Dados da Vítima:
* `vitima_nome` (Varchar): Nome da vítima ou `'Não Informado'`.
* `vitima_sexo` (Enum): `'M'`, `'F'`, `'Não Informado'` (o e193 traz `FEMININO` -> `'F'`, `MASCULINO` -> `'M'`).
* `vitima_idade` (Int nullable): Idade em anos (`NULL` se não informado).
* `vitima_naturalidade` (Varchar nullable): Ex: `'ELDORADO DO SUL'`.
* `vitima_uf` (Varchar(2) nullable): Ex: `'RS'`.
* `vitima_perfil` (JSON ou colunas auxiliares): Familiaridade (`VERANISTA`), Habilidade Natação (`NÃO SABE NADAR`), Situação (`IMPRUDÊNCIA`), etc.

#### Guarda-Vidas que Atuaram (Relação 1:N):
* `id_funcional` (Varchar): ID funcional ou CPF (Ex: `'3715647'`).
* `nome` (Varchar): Nome completo do socorrista (Ex: `'ANDREO PRUSSIANO CORRÊA'`).
* `posto` (Varchar): Posto/Graduação (Ex: `'SOLDADO'`, `'2º SARGENTO'`, `'GVC'`).

### 2.2. Campos Preenchidos Automaticamente pelo Cadastro da Guarita
Ao identificar `codigo_guarita`, o sistema preenche via relacionamento com a tabela `balnearios`:
* `cidade` (Ex: `TRAMANDAÍ`, `TORRES`, `CAPÃO DA CANOA`, `RIO GRANDE`, `ARAMBARÉ`)
* `praia_balneario` (Ex: `TRAMANDAÍ`, `CAPÃO NOVO`, `CASSINO`)
* `ciagv` (Ex: `1ª CIAGV`, `2ª CIAGV`, `3ª CIAGV`, `4ª CIAGV`, `5ª CIAGV NORTE`, `5ª CIAGV SUL`)
* `bbm` (Ex: `9º BBM`, `3º BBM`, `6º BBM`, etc.)
* `litoral` (Enum): `'Norte'`, `'Sul'`, `'AI'` (Águas Internas).

### 2.3. Campos de Clima e Meteorologia
O sistema extrai as informações climáticas preferencialmente da observação de campo do e193 (`DADOS PRAIA`) ou complementa via API do OpenWeatherMap:
* `temperatura_c` (Decimal 5,2): Ex: `28.50`.
* `condicao_clima` (Varchar): Ex: `céu limpo`, `nublado`, `chuva leve`.
* `vento_graus` (Int): Azimute `0` a `360`.
* `vento_direcao` (Varchar): Rosa dos ventos calculada ou informada (`Norte`, `Nordeste`, `Leste`, `Sudeste`, `Sul`, `Sudoeste`, `Oeste`, `Noroeste`).

### 2.4. Categorizações Automáticas e Regras de Negócio

1. **Temporada (`temporada`):**
   * Avalia `data_ocorrencia` frente aos marcos da operação ativa:
     * Se `data_ocorrencia <= data_fim_alta`: `'Alta'`
     * Se `data_ocorrencia > data_fim_alta`: `'Baixa'`
   * **Regra Operacional:** A segregação é 100% automatizada por data de corte. Elimina o processo manual anterior (onde se abria uma nova planilha em branco para a baixa temporada). O banco é unificado, permitindo alternar instantaneamente entre visões de **Alta**, **Baixa** ou **Total Acumulado**.

2. **Mês (`mes_nome`):** Derivado de `data_ocorrencia` (`Dezembro`, `Janeiro`, `Fevereiro`, `Março`).

3. **Faixa de Temperatura (`faixa_temp`):**
   * `<= 9.99`: `'0° a 9°C'`
   * `10.00 a 17.99`: `'10° a 17°C'`
   * `18.00 a 25.99`: `'18° a 25°C'`
   * `26.00 a 30.99`: `'26° a 30°C'`
   * `31.00 a 35.99`: `'31° a 35°C'`
   * `>= 36.00`: `'Acima de 36°C'`

4. **Faixa Etária (`faixa_etaria`):**
   * `NULL`: `'Não Informado'`
   * `0 a 5`: `'00 - 05 Anos'`
   * `6 a 10`: `'06 - 10 Anos'`
   * `11 a 15`: `'11 - 15 Anos'`
   * `16 a 20`: `'16 - 20 Anos'`
   * `21 a 25`: `'21 - 25 Anos'`
   * `26 a 30`: `'26 - 30 Anos'`
   * `31 a 40`: `'31 - 40 Anos'`
   * `41 a 46`: `'41 - 46 Anos'`
   * `>= 47`: `'Acima 46 anos'`

5. **Faixa Etária + Sexo (`faixa_etaria_sexo`):** `"{vitima_sexo} e {faixa_etaria}"` (Ex: `'F e 31 - 40 Anos'`).

6. **Faixa Horária (`faixa_horaria`):**
   * `08:00:00` às `10:30:59`: `'08:00 x 10:30'`
   * `10:31:00` às `12:30:59`: `'10:31 x 12:30'`
   * `12:31:00` às `14:30:59`: `'12:31 x 14:30'`
   * `14:31:00` às `16:30:59`: `'14:31 x 16:30'`
   * `16:31:00` às `19:00:59`: `'16:31 x 19:00'`
   * Demais horários: `'Fora do Horário Padrão'`

---

## 3. Esquema do Banco de Dados (SQL - MySQL / PostgreSQL)

```sql
CREATE DATABASE IF NOT EXISTS sisverao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sisverao;

-- 1. Tabela de Operações (com suporte a Alta e Baixa Temporada)
CREATE TABLE operacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_operacao INT NOT NULL UNIQUE COMMENT 'Ex: 9',
    nome VARCHAR(100) NOT NULL COMMENT 'Ex: 9ª Operação Verão 2025/2026',
    data_inicio DATE NOT NULL COMMENT 'Ex: 2025-12-20',
    data_fim DATE NOT NULL COMMENT 'Ex: 2026-03-31',
    data_inicio_alta DATE NOT NULL COMMENT 'Ex: 2025-12-20',
    data_fim_alta DATE NOT NULL COMMENT 'Ex: 2026-02-18 (ex: pós-carnaval)',
    data_inicio_baixa DATE NOT NULL COMMENT 'Ex: 2026-02-19',
    data_fim_baixa DATE NOT NULL COMMENT 'Ex: 2026-03-31',
    ativa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Balneários / Praias
CREATE TABLE balnearios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL COMMENT 'Ex: TORRES, CAPÃO DA CANOA, CASSINO, LARANJAL',
    cidade VARCHAR(100) NOT NULL,
    ciagv VARCHAR(50) NOT NULL COMMENT 'Ex: 1ª CIAGV, 5ª CIAGV SUL',
    bbm VARCHAR(30) NOT NULL COMMENT 'Ex: 9º BBM, 3º BBM, 6º BBM',
    litoral ENUM('Norte', 'Sul', 'AI') NOT NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    ordem_exibicao INT DEFAULT 0,
    UNIQUE KEY uk_balneario_cidade (nome, cidade, bbm)
);

-- 3. Tabela de Guaritas
CREATE TABLE guaritas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL COMMENT 'Ex: LN150, LS021, AI043, S/N',
    balneario_id INT NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (balneario_id) REFERENCES balnearios(id) ON DELETE RESTRICT,
    INDEX idx_codigo_guarita (codigo)
);

-- 4. Tabela Principal de Salvamentos (Enriquecida com dados do e193 e Temporada)
CREATE TABLE salvamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacao_id INT NOT NULL,
    temporada ENUM('Alta', 'Baixa') NOT NULL DEFAULT 'Alta',
    num_ocorrencia INT NOT NULL COMMENT 'Ex: 7014',
    data_ocorrencia DATE NOT NULL,
    hora_ocorrencia TIME NOT NULL,
    hora_registro DATETIME NULL COMMENT 'Momento do lançamento no e193',
    dia_semana VARCHAR(20) NULL,
    balneario_id INT NOT NULL,
    codigo_guarita VARCHAR(20) NOT NULL,
    usou_motoaquatica BOOLEAN NOT NULL DEFAULT FALSE,
    equipamentos_empregados VARCHAR(255) NULL,
    tipo_salvamento ENUM(
        'RESGATE',
        'AFOGAMENTO COM RECUPERAÇÃO EM ÁGUA SALGADA',
        'AFOGAMENTO COM RECUPERAÇÃO EM ÁGUA DOCE',
        'AFOGAMENTO SEGUIDO DE MORTE EM ÁGUA SALGADA',
        'AFOGAMENTO SEGUIDO DE MORTE EM ÁGUA DOCE'
    ) NOT NULL DEFAULT 'RESGATE',
    grau_afogamento TINYINT NULL COMMENT '1 a 6 apenas quando tipo != RESGATE',
    bandeira ENUM('VERDE', 'AMARELA', 'VERMELHA', 'PRETA', 'NÃO HAVIA') NOT NULL,
    perigos_associados VARCHAR(150) NULL COMMENT 'Ex: CORRENTE DE RETORNO (REPUXO)',
    local_ocorrencia VARCHAR(100) NULL COMMENT 'Ex: NA ZONA DA ARREBENTAÇÃO',
    distancia_esquerda_m INT DEFAULT 0,
    distancia_direita_m INT DEFAULT 0,
    historico_ocorrencia TEXT NULL COMMENT 'Descrição completa do fato copiada do e193',
    gv_preencheu VARCHAR(150) NULL COMMENT 'Quem preencheu o formulário no e193',
    
    -- Dados da Vítima
    vitima_nome VARCHAR(150) DEFAULT 'Não Informado',
    vitima_sexo ENUM('M', 'F', 'Não Informado') DEFAULT 'Não Informado',
    vitima_idade INT NULL,
    vitima_naturalidade VARCHAR(100) NULL,
    vitima_uf VARCHAR(2) NULL,
    vitima_perfil JSON NULL COMMENT 'Familiaridade, Conduta, Natação, etc.',

    -- Condições Climáticas e Meteorológicas
    temperatura_c DECIMAL(5,2) NULL,
    condicao_clima VARCHAR(80) NULL,
    vento_graus SMALLINT NULL,
    vento_direcao VARCHAR(30) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operacao_id) REFERENCES operacoes(id),
    FOREIGN KEY (balneario_id) REFERENCES balnearios(id),
    INDEX idx_op_temporada (operacao_id, temporada),
    INDEX idx_op_data (operacao_id, data_ocorrencia),
    INDEX idx_balneario (balneario_id),
    INDEX idx_bandeira (bandeira),
    INDEX idx_tipo_salvamento (tipo_salvamento)
);

-- 5. Tabela de Guarda-Vidas Atuantes no Salvamento (1:N com posto e nome do e193)
CREATE TABLE salvamento_guarda_vidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salvamento_id INT NOT NULL,
    id_funcional VARCHAR(30) NOT NULL,
    nome VARCHAR(150) NULL,
    posto VARCHAR(50) NULL COMMENT 'Ex: SOLDADO, 2º SARGENTO, GVC',
    ordem_atuacao TINYINT DEFAULT 1,
    FOREIGN KEY (salvamento_id) REFERENCES salvamentos(id) ON DELETE CASCADE,
    INDEX idx_id_funcional (id_funcional)
);

-- 6. Tabela de Indicadores Diários / Acumulados por Balneário
CREATE TABLE indicadores_diarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacao_id INT NOT NULL,
    balneario_id INT NOT NULL,
    data_referencia DATE NOT NULL,
    prevencoes INT DEFAULT 0,
    agua_viva INT DEFAULT 0,
    pessoas_encontradas INT DEFAULT 0,
    obitos_mar INT DEFAULT 0,
    obitos_aguas_internas INT DEFAULT 0,
    FOREIGN KEY (operacao_id) REFERENCES operacoes(id),
    FOREIGN KEY (balneario_id) REFERENCES balnearios(id),
    UNIQUE KEY uk_op_balneario_data (operacao_id, balneario_id, data_referencia)
);

-- 7. Tabela de Histórico Consolidado de Operações Anteriores (4ª à 8ª Op)
CREATE TABLE historico_operacoes_resumo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_operacao INT NOT NULL,
    temporada ENUM('Alta', 'Baixa', 'Total') NOT NULL DEFAULT 'Total',
    litoral ENUM('Norte', 'Sul', 'AI', 'GERAL') NOT NULL,
    balneario_nome VARCHAR(100) NULL,
    dia_operacao INT NULL,
    salvamentos_total INT DEFAULT 0,
    prevencoes_total INT DEFAULT 0,
    agua_viva_total INT DEFAULT 0,
    pessoas_encontradas_total INT DEFAULT 0,
    obitos_mar_total INT DEFAULT 0,
    obitos_ai_total INT DEFAULT 0
);

-- 8. Tabela de Frases "Buenas"
CREATE TABLE frases_buenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    frase VARCHAR(255) NOT NULL
);
```

---

## 4. Regras do Smart Text Parser (Colagem do e193) & Clima

### 4.1. Algoritmo do Smart Text Parser do e193
Quando o operador colar o relatório bruto copiado do modal do e193, o parser deve aplicar as seguintes regras determinísticas:

| Campo no e193 | Regex / Extração | Mapeamento no SISVERÃO |
| :--- | :--- | :--- |
| `Nº DE REGISTRO:\n(\d+)` | Extrai números inteiros | `num_ocorrencia` |
| `Hora do Registro:\n([\d\- :]+)` | Extrai data e hora do registro | `hora_registro` |
| `DATA:\n(\d{2}/\d{2}/\d{4})` | Converte DD/MM/AAAA -> YYYY-MM-DD | `data_ocorrencia` |
| `HORARIO:\n(\d{2}:\d{2})` | Extrai HH:MM | `hora_ocorrencia` |
| `DIA DA SEMANA:\n([^\n]+)` | Extrai dia | `dia_semana` |
| `GUARITA:\n([^\n]+)` | Ex: LN150 | `codigo_guarita` (dispara autopreenchimento de praia/cidade/BBM/litoral) |
| `COD. DE OCORRÊNCIA:\n([^\n]+)` | Texto (RESGATE / AFOGAMENTO...) | `tipo_salvamento` |
| `GRAU:\n([^\n]+)` | Se "SEM GRAU" -> `NULL`, senão extrai número 1..6 | `grau_afogamento` |
| `G.V. QUE PREENCHEU FORMULÁRIO:\n([^\n]+)` | Texto completo | `gv_preencheu` |
| Bloco `GUARDA-VIDAS QUE ATUARAM` | Itera pares `ID FUNC/CPF`, `NOME`, `POSTO` | Alimenta lista 1:N `salvamento_guarda_vidas` |
| `HISTÓRICO DA OCORRÊNCIA\n([\s\S]*?)(?=DADOS VÍTIMA)` | Captura parágrafo descritivo | `historico_ocorrencia` |
| `NOME DA VÍTIMA:\n([^\n]+)` | Extrai nome | `vitima_nome` |
| `IDADE:\n(\d+)` | Número inteiro | `vitima_idade` |
| `SEXO:\n([^\n]+)` | FEMININO -> 'F', MASCULINO -> 'M' | `vitima_sexo` |
| `NATURALIDADE:\n([^\n]+)` / `ESTADO:\n([^\n]+)` | Texto e UF | `vitima_naturalidade` e `vitima_uf` |
| `EQUIPAMENTO EMPREGADO NO RESGATE:\s*([^\n]+)` | Se contiver `'MOTO AQUÁTICA'` -> `usou_motoaquatica = true` | `usou_motoaquatica` e `equipamentos_empregados` |
| `BANDEIRA SINALIZADA NO POSTO:\s*([^\n]+)` | Normaliza para VERDE, AMARELA, VERMELHA, PRETA, NÃO HAVIA | `bandeira` |
| `PERIGOS DA PRAIA ASSOCIADOS AO ACIDENTE:\s*([^\n]+)` | Texto livre/opções | `perigos_associados` |
| `DISTÂNCIA DA GUARITA\s*À ESQUERDA \(m\):\s*(\d+)\s*À DIREITA \(m\):\s*(\d+)` | Extrai distâncias numéricas | `distancia_esquerda_m` e `distancia_direita_m` |
| `DIREÇÃO DO VENTO:\s*([^\n]+)` | OESTE, NORDESTE, etc. | `vento_direcao` |

### 4.2. Integração Climática Complementar
* Caso o relatório não traga temperatura numérica ou azimute exato, o sistema consulta a API do OpenWeatherMap utilizando a latitude e longitude cadastradas no balneário da guarita:
  `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&lang=pt_br&appid={API_KEY}`

---

## 5. Especificação das Telas do MVP

### Tela 1: Dashboard Principal & Resumo Diário Oficial (Boletim da Chefia)
* **Header "Buenas" e Controles:** Exibe a Operação Ativa, Seletor de Data de Referência, abas de filtro por Temporada (`[Toda a Operação] | [Alta Temporada] | [Baixa Temporada]`) e saudação gaúcha.
* **Card Visual "Preliminar da Manhã (14h)" (Espelho fiel da aba PRELIMINAR):**
  * Widget vertical em formato de card pronto para captura de tela / download em PNG:
    * Cabeçalho: `"9ª Operação Verão: [Data] (PRELIMINAR DA MANHÃ)"`.
    * Tabela Diária: Balneários do Litoral Norte (Torres ao Quintão), Litoral Sul e Águas Internas, com subtotais e Total do Dia.
    * Tabela Acumulada: Total acumulado por Litoral (Norte, Sul, AI) e Total Geral da Operação.
  * Botão **"📸 Baixar Imagem do Card (PNG)"**: Exporta exatamente a arte gráfica compacta para disparo instantâneo no WhatsApp às 14h.
  * Botão **"📋 Copiar Texto do Preliminar"**: Versão em texto puro para canais rápidos.

* **Tabelas Oficiais do Boletim (Espelho da aba "RESUMO DIÁRIO" compartilhada com o Comando):**
  1. **Bloco 1 — Atendimentos do Dia:**
     * Litoral Norte (Torres, Capão da Canoa, Tramandaí, Imbé, Cidreira, Pinhal, etc.).
     * Litoral Sul (Cassino, Hermenegildo, Chuí, etc.).
     * Águas Internas / Abrigadas (detalhado pelos 13 Batalhões - 1º ao 13º BBM).
     * Totais do Dia: Norte, Sul, Águas Internas e Total Geral do Dia.
  2. **Bloco 2 — Acumulado da Operação até a Data Selecionada:**
     * Mesma hierarquia territorial somando dinamicamente os registros diários (sem necessidade de planilha acumulada separada).
  3. **Bloco 3 — Comparativo Acumulado entre Operações (6ª, 7ª, 8ª e 9ª Op. Verão):**
     * Comparação lado a lado de Salvamentos, Óbitos, Prevenções, Pessoas Encontradas e Água-viva por Litoral e no Total Geral.
  4. **Bloco 4 — Painel de Óbitos por Afogamento:**
     * Distribuição Mar vs. Águas Internas e total acumulado por mês (Dezembro, Janeiro, Fevereiro, Março).
* **Exportação e Comunicação Rápida:**
  * Botão **"📋 Copiar Resumo Diário para WhatsApp"**: Gera o texto padronizado com emojis e layout institucional para envio imediato aos grupos do Comando.
  * Botão **"📄 Exportar Boletim Oficial (PDF/PNG)"**.

### Tela 2: Explorador e Filtro Geral
* **Filtros Rápidos:**
  * Temporada: `Todas`, `Alta`, `Baixa`.
  * Período de Datas (atalhos: *Hoje*, *Fim de Semana*, *Carnaval*, *Alta Temporada*, *Baixa Temporada*).
  * Litoral, BBM, CIAGV, Cidade, Balneário, Guarita, Bandeira, Motoaquática, Faixa Etária e ID/Nome do Guarda-Vidas.
* **Resumo do Recorte:** Indicadores dinâmicos imediatos no topo dos resultados.
* **Grid de Ocorrências:** Lista detalhada com badge de temporada, detalhes da vítima, guarda-vidas e visualização do histórico. Exportação CSV/Excel.

### Tela 3: Inteligência Climática, Tipologia e Perfil
* Gráfico 1: Salvamentos por Direção do Vento (Rosa dos Ventos e Barras).
* Gráfico 2: Salvamentos por Faixa de Temperatura e Condição Climática.
* Gráfico 3: Salvamentos por Bandeira e Emprego de Motoaquática.
* Gráfico 4: Perfil da Vítima (Idade, Sexo, Naturalidade, Natação) e Faixa Horária.
* Gráfico 5: Tipo de Salvamento x Grau de Afogamento (1 a 6) x Óbitos.
* *Filtro de alternância entre Alta Temporada e Baixa Temporada em todos os gráficos.*

### Tela 4: Comparativo Histórico (6ª à 9ª Operação)
* Comparativo da Operação atual com as anteriores no mesmo "Dia D" de operação.
* Comparativo de Alta Temporada de anos anteriores vs. Alta Temporada atual.

### Tela 5: Lançamentos Rápidos & Importação de Relatórios
* **Módulo A — Smart Parser de Salvamento Individual (e193):**
  * Botão **"📋 Colar Relatório de Salvamento (e193)"**: Extrai instantaneamente ficha individual da ocorrência, vítima, efetivo e perigos.
  * Botão **"+ Adicionar Próxima Vítima (Mesmo Salvamento)"**.
* **Módulo B — Colar Relatório Geral de Prevenções & Atendimentos (Aba "COLAR AQUI"):**
  * Caixa de colagem rápida onde o operador cola o **"RELATÓRIO GERAL DA OPERAÇÃO VERÃO"** gerado várias vezes ao longo do dia.
  * O sistema extrai a data do cabeçalho (`PERÍODO DE ... A ...`) e processa em lote os 13 BBMs (`PREV`, `LCAV`, `CRPR`, `APH`, etc.).
  * **Comportamento Idempotente (Upsert):** Se já houver dados para a data, atualiza/sobrescreve os contadores do dia sem duplicar, mantendo o painel sincronizado em tempo real.


---

## 6. Roteiro Passo a Passo para Execução no Antigravity

1. **Passo 1 (Setup, Database & Migrations):** Criar a estrutura do projeto, configurar banco de dados relacional e aplicar as migrações atualizadas da Seção 3 (incluindo as colunas de Temporada e dados do e193).
2. **Passo 2 (Módulo Smart Text Parser):** Desenvolver e testar unitariamente o parser regex com o texto real do e193, garantindo 100% de precisão na extração de dados e normalização de guarda-vidas e motoaquática.
3. **Passo 3 (Seeder & Importador dos Dados Existentes):** Importar a planilha da 9ª Operação Verão (854 salvamentos) e tabelas consolidadas, categorizando automaticamente as ocorrências na Alta ou Baixa Temporada conforme a data.
4. **Passo 4 (Backend API & Services):** Implementar os endpoints de consulta com filtros combinados, agregação por temporada e serviço meteorológico.
5. **Passo 5 (Frontend Views & Dashboards):** Desenvolver o Dashboard com filtro Alta/Baixa Temporada, Tela de Lançamento Rápido com Colagem do e193, Explorador Geral e Gráficos de Inteligência.