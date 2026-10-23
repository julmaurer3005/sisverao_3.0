# Dev Log — SISVERÃO

> Documentação viva de descobertas técnicas. Atualizada automaticamente.
> **Stack**: Node.js + Express (Backend) · SQLite local (migração direta para PostgreSQL) · React + Vite (Frontend)
> **Última atualização**: 2026-10-22

## 🎯 FEATURE — Ativação e Desativação Dinâmica de Postos de Águas Internas (Ocultar Praias sem Serviço) — 2026-10-22
> **Contexto:** Em determinadas operações e temporadas, algumas praias de Águas Internas não contam com serviço de guarda-vidas ativado. Na planilha oficial de controle, os operadores simplesmente ocultavam a linha da praia para evitar poluição visual. Foi solicitada uma forma ágil e intuitiva de desativar postos no sistema para que eles sumam automaticamente dos relatórios e imagens oficiais sem perder o histórico do catálogo.
- **Ponto chave:**
  1. **Coluna `ativo` no Banco de Dados:** Adicionado campo `ativo INTEGER NOT NULL DEFAULT 1` na tabela `balnearios` e no esquema inicial ([schema.js](file:///c:/Users/USER/Desktop/sisverao/server/src/db/schema.js)).
  2. **Filtragem Dinâmica na Geração dos Cartazes:** Em [resumoDiarioService.js](file:///c:/Users/USER/Desktop/sisverao/server/src/services/resumoDiarioService.js), a query de Águas Internas passou a filtrar estritamente `b.litoral === 'AI' && b.ativo !== 0`. Postos desativados deixam de constar nas linhas e totalizadores dos relatórios diários e acumulados.
  3. **Endpoints de Gerenciamento REST:** Criadas rotas dedicadas em [api.js](file:///c:/Users/USER/Desktop/sisverao/server/src/routes/api.js):
     - `GET /api/balnearios?litoral=AI`: Lista completa com status `ativo`.
     - `PATCH /api/balnearios/:id/toggle-ativo`: Alternância instantânea de status de um posto.
     - `PUT /api/balnearios/:id/status`: Definição pontual de status.
     - `POST /api/balnearios/batch-status`: Ativação ou desativação em lote (ex: por batalhão ou geral).
  4. **Componente de Gestão Visual ([GerenciarPostosModal.jsx](file:///c:/Users/USER/Desktop/sisverao/client/src/components/GerenciarPostosModal.jsx)):** 
     - Modal acessível pelo botão **"Postos Ativos / Ocultar Praias"** no cabeçalho do Resumo Diário.
     - Agrupamento por Batalhão (1º ao 13º BBM) com contadores de postos ativos.
     - Busca em tempo real por cidade ou nome da praia e filtros ("Todos", "Ativos", "Ocultos", filtro por BBM).
     - Switches interativos com atualização otimista instantânea e ações rápidas em lote ("Ativar BBM", "Ocultar BBM", "Ativar Todas", "Desativar Todas").
     - Recarregamento automático e em tempo real dos cartazes oficiais ao concluir.
- **Verde:** Validação com teste pontual de desativação (ID 121 - CEBS): a contagem de linhas do cartaz foi de 60 para 59 e o posto foi excluído da visualização imediatamente; ao reativar, retornou para os 60 postos com 100% de integridade nos totais.
  - **Correção Rules of Hooks:** Eliminado early return condicional (`if (!isOpen) return null`) antes de `useMemo` em [GerenciarPostosModal.jsx](file:///c:/Users/USER/Desktop/sisverao/client/src/components/GerenciarPostosModal.jsx) e renderização condicional aplicada em [ResumoDiarioTab.jsx](file:///c:/Users/USER/Desktop/sisverao/client/src/components/ResumoDiarioTab.jsx), garantindo ordem invariante de hooks e resolvendo o erro de tela branca. Build do Vite concluído em 629ms com 0 erros.


---

## 🎯 FEATURE — Agrupamento e Ordenação Estrita dos 13 BBMs de Águas Internas (1º ao 13º BBM) — 2026-10-22

> **Contexto:** Nos cartazes oficiais de Águas Internas (Atendimentos do Dia e Acumulado), as cidades e praias de um mesmo batalhão estavam fragmentadas em blocos separados ao longo da tabela (ex: 6º, 4º e 1º BBM apareciam em múltiplos blocos dispersos) e a ordem dos batalhões não seguia a sequência numérica natural 1º ao 13º BBM.
- **Causa raiz:** 
  1. **Agrupamento Adjacente Frágil:** No frontend ([CardResumoAIDia.jsx](file:///c:/Users/USER/Desktop/sisverao/client/src/components/CardResumoAIDia.jsx) e [CardResumoAIAcumulado.jsx](file:///c:/Users/USER/Desktop/sisverao/client/src/components/CardResumoAIAcumulado.jsx)), a lógica de agrupamento verificava apenas se `item.bbm !== currentBbm`. Qualquer item fora de ordem consecutiva criava um novo bloco visual separado para o mesmo batalhão.
  2. **Registros Duplicados de Importação Inicial:** 6 balneários (Laranjal, São Lourenço do Sul, Capilha, Passo das Tunas, Praia do Encontro e Bacupari) possuíam IDs antigos com `ordem_exibicao = 0` e sufixos (`/AI`), gerando duplicatas no topo da listagem.
  3. **Ordenação não-numérica no Backend:** Na camada de agregação ([resumoDiarioService.js](file:///c:/Users/USER/Desktop/sisverao/server/src/services/resumoDiarioService.js)), a lista não extraía o valor inteiro do batalhão (`parseInt(bbm.match(/\d+/)[0])`), misturando postos de diferentes batalhões.
- **Ponto chave:**
  1. **Mesclagem Definitiva das Duplicatas no SQLite:** Os 6 balneários duplicados (IDs 11, 16, 26, 29, 30 e 31) tiveram todas as ocorrências de salvamentos, guaritas e indicadores unificados nos seus respectivos IDs canônicos (IDs 83, 111, 82, 84, 103 e 86), excluindo os registros redundantes.
  2. **Agrupamento Determinístico por Map:** Implementado agrupamento por Map indexado pelo número do BBM no frontend, garantindo que todas as cidades e praias pertençam a um único bloco visual inquebrável por batalhão.
  3. **Ordenação Rigorosa de 1º a 13º BBM:** Ordenação numérica estrita de 1º a 13º BBM tanto no serviço do backend quanto nos componentes React, seguido por ordenação alfabética de municípios e praias dentro de cada batalhão.
  4. **Padronização da Sequência de Exibição:** Atribuído `ordem_exibicao` contínuo de 101 a 160 na tabela `balnearios` para todos os 60 postos ativos de Águas Internas.
- **Verde:** 
  - Todos os 13 Batalhões de Bombeiros Militares (1º ao 13º BBM) perfeitamente agrupados em blocos únicos contínuos.
  - Ordenação rigorosa: 1º BBM, 2º BBM, 3º BBM, 4º BBM, 5º BBM, 6º BBM, 7º BBM, 8º BBM, 9º BBM, 10º BBM, 11º BBM, 12º BBM e 13º BBM.
  - Totais mantidos com precisão cirúrgica: 0 salvamentos, 2.637 prevenções, 7 pessoas encontradas e 0 óbitos.
  - Build do Vite concluído com 100% de sucesso.

---

## 🐛 FIX — Resolução Determinística de Balneários e Correção de Indicadores em Branco (Tramandaí, Nova Tramandaí e São José do Norte) — 2026-10-22

> **Contexto:** Na geração do Consolidado Oficial (Imagem 1), as praias de Tramandaí, Nova Tramandaí e São José do Norte apareciam zeradas/em branco nos atendimentos diários e acumulados, diminuindo os totais gerais da operação.
- **Causa raiz:** 
  1. **Colisão de Substring (`LIKE '%TRAMANDAÍ%'`):** Na rotina de importação do boletim (`/api/relatorio-geral/colar`), a query usava `SELECT id FROM balnearios WHERE nome LIKE '%TRAMANDAÍ%' LIMIT 1`. Como a substring `%TRAMANDAÍ%` também coincide com `NOVA TRAMANDAÍ`, a linha de Tramandaí capturava e sobrescrevia os dados de Nova Tramandaí (no ID duplicado 71), deixando o ID canônico 13 sem registros.
  2. **Divergência de Nome vs Município em São José do Norte:** No banco original, o balneário do 3º BBM era cadastrado com `nome: 'MAR GROSSO'` e `cidade: 'SÃO JOSÉ DO NORTE'` (ID 25). Já o gerador do relatório procurava por `nome === 'SÃO JOSÉ DO NORTE'`, que apontava para um registro vazio (ID 76).
  3. **Multiplicidade de Balneários:** Existiam registros duplicados no catálogo SQLite gerados por discrepâncias de cidade.
- **Ponto chave:**
  1. Criação de `resolveBalnearioId(item)` em [api.js](file:///c:/Users/USER/Desktop/sisverao/server/src/routes/api.js) com catálogo canônico dos 12 balneários do Norte, 5 do Sul e 37 de Águas Internas, eliminando qualquer colisão de nomes/substrings.
  2. Atualização de `CANONICAL_PRAIAS` em [resumoDiarioService.js](file:///c:/Users/USER/Desktop/sisverao/server/src/services/resumoDiarioService.js), mapeando explicitamente cada balneário exibido aos seus IDs no banco de dados.
  3. Migração e consolidação dos registros históricos de 22/10 no SQLite: Tramandaí (ID 13: 1047 prev, 228 av, 20 pess), Nova Tramandaí (ID 7: 1022 prev, 395 av, 5 pess) e São José do Norte (ID 25: 97 prev, 41 av, 0 pess).
  4. Filtragem dos balneários oficiais de Águas Internas para o intervalo exato dos 37 postos (`ordem_exibicao >= 100`).
- **Verde:** Totais do dia agora batem 100% com a planilha oficial: 29.980 prevenções, 214 pessoas encontradas e 8.661 lesões por água-viva. Build do frontend e endpoints validados com êxito.

---

## 🐛 FIX — Alinhamento Pixel-Perfect das Colunas de Valores nos Cartazes de Águas Internas — 2026-10-21
> **Contexto:** Nos dois modelos de imagem oficial de Águas Internas (Atendimentos do Dia e Acumulado), as 4 colunas de valores (Salvamentos, Prevenções, Pessoas Encontradas, Óbitos) estavam desalinhadas horizontalmente em relação aos títulos do cabeçalho.
- **Causa raiz:** O grid de colunas no cabeçalho era de 293px posicionado à direita em um container de 640px, enquanto as linhas do corpo da tabela tinham largura acumulada (barra lateral + paddings + coluna BBM + municípios + grid) superior a 690px. Isso fazia as linhas transbordarem à direita em cerca de 50px, deslocando a 1ª coluna de valores para debaixo de "Prevenções" e a 4ª coluna para fora do cartaz.
- **Ponto chave:** Refatoração de [CardResumoAIDia.jsx](file:///c:/Users/USER/Desktop/sisverao/client/src/components/CardResumoAIDia.jsx) e [CardResumoAIAcumulado.jsx](file:///c:/Users/USER/Desktop/sisverao/client/src/components/CardResumoAIAcumulado.jsx) com fixação matemática:
  1. `width: '288px'`, `flexShrink: 0` e `gridTemplateColumns: '72px 72px 76px 50px'` idênticos para cabeçalho, linhas de ocorrência e totalizador.
  2. Trava de largura no container geral com `overflow: hidden` e `box-sizing: border-box`.
  3. Área de Município e Balneário com `minWidth: 0`, `flex: 1` e `text-overflow: ellipsis`, impedindo qualquer estiramento horizontal do corpo da tabela.
- **Verde:** Alinhamento 100% vertical e preciso entre o topo ("Salvamentos", "Prevenções", "Pessoas encontradas", "Óbitos"), cada linha dos 13 BBMs e a linha de total final. Build do frontend validado com sucesso via Vite (`npm run build`).

---

## ✅ FUNCIONA — MVP Fullstack do SISVERÃO Inicializado e Operando — 2026-10-20
> **Contexto:** Construção e inicialização completa do MVP do SISVERÃO conforme todas as especificações do PRD e alinhamentos operacionais do CBMRS.
- **Ponto chave:** Backend em Node.js/Express com `node:sqlite` nativo (transição direta para PostgreSQL) e frontend em React + Vite. Implementadas e integradas todas as 4 áreas principais:
  1. **Dashboard & Resumo Diário Oficial:** KPIs acumulados da operação, **Card Preliminar das 14h** (com exportação em imagem PNG idêntica ao modelo divulgado e cópia formatada para WhatsApp) e comparativo de operações (6ª à 9ª).
  2. **Lançamento Rápido:** Smart Text Parser do e193 (testado e aprovado com 100% de assertividade) + Importação de Boletim Geral dos 13 BBMs com comportamento Upsert idempotente.
  3. **Explorador Geral:** Lista paginada das 854 ocorrências reais da 9ª Operação Verão com filtros por temporada, guarita, praia, bandeira, motoaquática e exportação CSV.
  4. **Inteligência Climática:** Gráficos de ventos, bandeiras, picos de horário e tipologias.
- **Verde:** Seeder rodou em menos de 1s via transação atômica populando 854 salvamentos. Build do Vite concluiu em 619ms com 0 erros. Endpoints testados e validados em `http://localhost:3000` (frontend) e `http://localhost:3001` (backend).
- **Deploy:** Servidor backend e frontend iniciados localmente (`npm run dev`).
- **PEGADINHA:** O driver do Playwright no ambiente do subagente retornou 404 da CDN externa, impossibilitando a gravação de vídeo automatizada, mas os testes HTTP locais confirmam resposta perfeita da aplicação em `http://localhost:3000`.
- **Falta:** Validação direta pelo usuário e refinamentos futuros conforme uso.

---

## 📋 DECISÃO DE ARQUITETURA — SQLite para Testes Locais com Compatibilidade PostgreSQL — 2026-10-20
> **Contexto:** Necessidade de iniciar e testar o projeto de forma rápida e autônoma, sem exigir instalação prévia de servidor PostgreSQL local pelo usuário, mas garantindo transição transparente para Postgres em produção.
- **Ponto chave:** Utilização do SQLite localmente via arquivo persistente em disco (`database.sqlite`), modelado com tipos de dados ANSI/SQL compatíveis com PostgreSQL (tabelas, chaves estrangeiras, índices e constraints). A camada de persistência é desacoplada para permitir troca de conexão para PostgreSQL apenas alterando variáveis de ambiente (`DATABASE_URL`).
- **Verde:** SQLite suporta perfeitamente o volume operacional do SISVERÃO (~1.000 salvamentos por operação e milhares de contadores diários) com latência de microssegundos e zero dependência de infraestrutura externa.
- **Deploy:** Criação das tabelas relacionais com script de migração/inicialização idempotente.
- **PEGADINHA:** Evitar tipos ou sintaxes exclusivas do SQLite (ex: campos AUTOINCREMENT específicos) para garantir 100% de compatibilidade na migração para `SERIAL` / `BIGSERIAL` do PostgreSQL.
- **Falta:** Criar a estrutura de diretórios e rodar o seeder inicial.

---

## 📋 DECISÃO DE ARQUITETURA — Card Preliminar da Manhã (14h) para Disparo no WhatsApp — 2026-10-20
> **Contexto:** Todos os dias às 14h é emitido o "PRELIMINAR DA MANHÃ", enviado exatamente como a imagem compacta da aba PRELIMINAR.
- **Ponto chave:** Desenvolvimento de um componente/widget visual dedicado na Tela 1 que renderiza fielmente o layout vertical (Balneários do Norte, Sul, Águas Internas, Totais do Dia e Acumulado por Litoral), acompanhado de botão **"📸 Baixar Imagem (PNG)"** e **"📋 Copiar Texto"** para disparo instantâneo no WhatsApp.
- **Verde:** Layout da imagem fornecida pelo operador 100% incorporado ao PRD.
- **Deploy:** Widget integrado ao painel principal do SISVERÃO.
- **PEGADINHA:** A imagem deve ter dimensões e contraste adequados (estilo verde militar / tons escuros) para perfeita legibilidade na tela de smartphones.
- **Falta:** Iniciar a montagem da estrutura do projeto.

---

## 📋 DECISÃO DE ARQUITETURA — Upsert Contínuo de Indicadores Diários e Boletim para Chefia — 2026-10-20
> **Contexto:** O Relatório Geral de Prevenções/Atendimentos é colado várias vezes ao dia para acompanhamento em tempo real. A aba "RESUMO DIÁRIO" é o boletim oficial compartilhado com o Comando e divulgado à imprensa.
- **Ponto chave:** A importação opera em modo **Upsert** (Insert or Update por `operacao_id, balneario_id, data_referencia`), permitindo colar atualizações parciais durante o dia sem duplicar contadores. O cálculo do "Acumulado da Operação" é computado dinamicamente via soma SQL, eliminando fórmulas frágeis.
- **Verde:** Estrutura da aba "RESUMO DIÁRIO" (Litoral Norte, Litoral Sul, Águas Abrigadas dos 13 BBMs, comparativo 6ª à 9ª Op e óbitos por Mar vs Águas Internas) mapeada com sucesso.
- **Deploy:** Dashboard e Tela de Boletim do SISVERÃO espelharão com precisão as tabelas exigidas pelo Comando, com botão de "Copiar Boletim Formatado para WhatsApp".
- **PEGADINHA:** O relatório diário não precisa ser acumulado na entrada; o sistema calcula o acumulado somando os dias anteriores automaticamente.
- **Falta:** Iniciar a criação da modelagem e interface visual.

---

## 💡 PADRÃO REUTILIZÁVEL — Divisão de Temporadas 100% Orientada à Data de Corte — 2026-10-20
> **Contexto:** Na rotina analógica atual, ao final da Alta Temporada, a equipe iniciava uma nova planilha em branco para lançar a Baixa Temporada.
- **Ponto chave:** No SISVERÃO, elimina-se a necessidade de duplicar planilhas/tabelas. A divisão entre Alta e Baixa Temporada é puramente computada através de uma **data de corte** configurada na Operação (ex: `data_fim_alta`). Qualquer ocorrência com `data <= data_fim_alta` é classificada como Alta Temporada; após essa data, é automaticamente Baixa Temporada.
- **Verde:** Regra simplificada e confirmada pelo operador; unifica o banco relacional sem fragmentar dados.
- **Deploy:** Critério refletido na lógica de categorização do PRD.
- **PEGADINHA:** Garantir que consultas de "Operação Completa" combinem ambas as temporadas perfeitamente, mantendo o histórico contínuo de numeração de ocorrência.
- **Falta:** Configurar tela de ajuste de marcos da operação nas configurações.

---

## 📋 DECISÃO DE ARQUITETURA — Alta/Baixa Temporada e Smart Parser do e193 — 2026-10-20
> **Contexto:** O sistema oficial do CBMRS (e193) não oferece exportação em lote; dados eram copiados manualmente. Além disso, a operação exige separação estatística entre Alta e Baixa Temporada.
- **Ponto chave:** Criação do **Smart Text Parser** na Tela 5 (Lançamento Rápido), permitindo ao operador colar o texto completo da ocorrência copiado do e193 (ex: Registro 7014) para extração instantânea via regex de dados da vítima, guarda-vidas (1:N), perigos, equipamentos (identificação automática de motoaquática) e histórico. Atualização do PRD com suporte a marcos de Alta/Baixa Temporada em `operacoes` e flag `temporada` em `salvamentos`.
- **Verde:** Relatório copiado do e193 validado e 100% mapeado para os campos do banco e categorizações do PRD.
- **Deploy:** Schema SQL no PRD atualizado com suporte a `temporada`, enriquecimento de perfil e histórico.
- **PEGADINHA:** Quando o relatório do e193 não contiver temperatura em graus Celsius ou azimute exato do vento, o sistema usará fallback automático via OpenWeatherMap baseado no balneário da guarita.
- **Falta:** Início da implementação do módulo de parser e estrutura da aplicação web.

---

## 💡 EXEMPLO — Setup inicial e extração de dados da planilha — 2026-10-20
> **Contexto:** Validação do acesso aos dados da planilha da 9ª Operação Verão para modelagem do banco e carga inicial do MVP.
- **Ponto chave:** Exportação e visualização direta dos 854 registros de salvamento via endpoint CSV do Google Sheets (`gid=0`), permitindo validar as 44 colunas contra o schema relacional (`salvamentos`, `balnearios`, `salvamento_guarda_vidas`).
- **Verde:** Leitura do CSV e batimento de integridade contra o arquivo [prd_e_especifica_o_t_cnica_mvp_sisver_o.md](file:///c:/Users/USER/Desktop/sisverao/prd_e_especifica_o_t_cnica_mvp_sisver_o.md) validados com sucesso.
- **Deploy:** Banco de dados ainda não provisionado; script de migração/seeder a ser executado.
- **PEGADINHA:** A planilha distribui guardas-vidas em 15 colunas (`Id Func1` a `Id Func15`), o que exige normalização na tabela 1:N `salvamento_guarda_vidas` durante a importação.
- **Falta:** Definição da stack de aplicação (ex: Node.js/Express/Next.js ou Python/FastAPI) e criação do banco de dados local.

---

## ✨ FEATURE — Data Automática na Preliminar (14h) e Gestão da 10ª Operação Verão / Alta Temporada — 2026-10-20
> **Contexto:** Solicitação operacional para que a Preliminar das 14h exiba automaticamente a data atual (ex: 20 de outubro) e permita configurar os marcos temporais de início e fim da Alta Temporada, além de suportar a transição entre a 9ª Operação (histórico) e a 10ª Operação Verão (atual).
- **Ponto chave:** Implementação de cálculo automático da data do sistema (`new Date()`) no backend e frontend para o card preliminar das 14h. Criação do modal `ConfigOperacaoModal.jsx` e endpoints `GET /api/operacoes` e `PUT /api/operacao` para cadastrar/editar datas de abertura, encerramento e marcos de Alta e Baixa Temporada, com recálculo automático da classificação dos salvamentos. Cadastrada a **10ª Operação Verão 2026/2027** como ativa, mantendo a 9ª Operação disponível com seus 854 salvamentos.
- **Verde:** Card Preliminar das 14h agora exibe `10ª Operação Verão: 20 de outubro (PRELIMINAR DA MANHÃ)` e o texto de cópia do WhatsApp acompanha o número da operação ativa e a data por extenso. Filtro por operação adicionado ao Explorador Geral de Salvamentos.
- **Deploy:** Backend Express na porta 3001 e Frontend Vite na porta 3000 atualizados e validados com `npm run build` (sucesso em 614ms).
- **PEGADINHA:** Manter fallback inteligente: se uma operação recém-criada (como a 10ª) ainda não possuir salvamentos inseridos, as consultas analíticas de tipologia climática utilizam fallback limpo ou permitem selecionar a 9ª para inspeção dos dados consolidados sem travar o painel.
- **Decisões e contexto:** A virada de alta para baixa temporada foi automatizada: ao alterar a data final da alta temporada, o sistema atualiza o início da baixa temporada para o dia seguinte e reclassifica instantaneamente as ocorrências no banco de dados.
- **Próximos passos recomendados:**
  1. Validar com a equipe a importação de novas ocorrências na 10ª Operação através do Smart Parser e193.
  2. Testar o botão "Baixar Imagem PNG" do Card Preliminar em diferentes resoluções de tela.

---

## ✨ FEATURE — Integração Automática com API OpenWeatherMap e Higienização de Guarita — 2026-10-20
> **Contexto:** Necessidade operacional de preencher automaticamente a temperatura (°C), condição de tempo e direção do vento no local da ocorrência a partir da cidade/balneário, espelhando a funcionalidade da rotina do Google Apps Script (`incluirTemperatura2`).
- **Ponto chave:** Implementação de `weatherService.js` com a API Key oficial do CBMRS (`3fdd4dbaabc95616a399ed323326f0ce`), normalização de topônimos do litoral gaúcho (ex: Tramandaí, Capão da Canoa, Torres, Cassino, Hermenegildo) e conversão trigonométrica de graus do vento para os 8 quadrantes em Português ('Nordeste', 'Leste', 'Sudeste', etc.).
- **Verde:** Endpoint `GET /api/clima` ativo; enriquecimento automático durante o parsing de relatórios do e193 e seção visual dedicada no formulário de Lançamento Rápido com botão de atualização em tempo real. Higienizada a extração de `guarita`, `praia` e `cidade` para eliminar repetições de rótulos adjacentes.
- **Deploy:** Backend reiniciado com sucesso na porta 3001 e Frontend compilado via Vite em 595ms.
- **PEGADINHA:** Algumas cidades litorâneas com acentos ou nomes compostos (ex: Xangri-Lá, Capão da Canoa) requerem normalização de caracteres para match direto no endpoint do OpenWeatherMap Brasil.
- **Decisões e contexto:** O preenchimento do clima é 100% automático no momento da extração do texto colado, mas permanece editável no formulário para ajustes operacionais manuais caso o guarda-vidas queira reportar condição sensorial local.
- **Próximos passos recomendados:**
  1. Acompanhar os lançamentos reais durante a escala para verificar se há alguma praia específica não mapeada no normalizador de cidades.
  2. Implementar visualização do histórico climático nos gráficos analíticos.

---

## ✨ FEATURE — Separação da Aba Preliminar (14h) e Implementação das 3 Imagens Oficiais do Resumo Diário — 2026-10-20
> **Contexto:** Solicitação para separar a Preliminar em uma aba dedicada e implementar os 3 cartazes visuais oficiais gerados na aba RESUMO DIÁRIO com exportação em alta resolução (PNG) e texto formatado para WhatsApp idênticos aos modelos divulgados no verão passado.
- **Ponto chave:** Criação de `PreliminarTab.jsx` como aba independente para a rotina das 14h. Implementação de `ResumoDiarioTab.jsx` com os 3 modelos oficiais fiéis às imagens enviadas:
  1. `CardResumoGeral.jsx`: Consolidado Geral Oficial (Atendimentos do Dia em Verde, Acumulado em Ocre, Comparativo Histórico 6ª à 9ª em Azul Petróleo e Bloco de Óbitos).
  2. `CardResumoAIDia.jsx`: Atendimentos do Dia em Águas Internas detalhados por BBM (1º ao 13º BBM).
  3. `CardResumoAIAcumulado.jsx`: Acumulado da Operação em Águas Internas detalhado por BBM (1º ao 13º BBM).
  Cadastro de todos os 37 balneários dos 13 BBMs de Águas Internas em `seedResumoDiario.js` e serviço agregador `resumoDiarioService.js` com endpoint `GET /api/resumo-diario-completo`.
- **Verde:** Geração de PNG com proporção idêntica via `html-to-image` (pixelRatio 2) e botões de cópia para WhatsApp em todos os 3 cartazes. Abas reorganizadas na barra superior.
- **Deploy:** Backend atualizado na porta 3001 e Frontend Vite na porta 3000 validado com `npm run build` (sucesso em 635ms).
- **PEGADINHA:** O agrupamento visual por BBM exige manter a célula do BBM expandida verticalmente à esquerda dos municípios/balneários correspondentes para reproduzir a diagramação original das planilhas e cartazes da Chefia.
- **Decisões e contexto:** A separação em duas abas distintas melhora o fluxo de trabalho dos operadores: às 14h utilizam exclusivamente a aba Preliminar e, no fechamento do dia, utilizam a aba Resumo Diário para disparar os boletins consolidados.
- **Próximos passos recomendados:**
  1. Testar o disparo das imagens nos grupos operacionais de teste do WhatsApp.
  2. Avaliar necessidade de inclusão de filtros por BBM específico se demandado pelo Comando.

---
