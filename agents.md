# Memória do Projeto — SISVERÃO

## Stack Técnica
- **Linguagem / Framework**: Node.js + Express (Backend) · React + Vite (Frontend)
- **Banco de Dados**: SQLite (testes/desenvolvimento local) com compatibilidade direta para migração PostgreSQL (produção)
- **Integrações Externas**: OpenWeatherMap API (clima, temperatura e direção do vento)
- **Fonte de Dados Operacional**: e193 (relatórios copiados), Google Sheets da 9ª Operação Verão (854+ salvamentos) e histórico acumulado (4ª à 8ª Op)

## Padrões do Projeto
- Estrutura de dados relacional estrita, normalizando efetivo de salvamento em tabela 1:N (`salvamento_guarda_vidas`).
- Automação de regras de negócio e categorizações (`faixa_temp`, `faixa_etaria`, `faixa_horaria`, `vento_direcao`) concentradas no backend para compatibilidade com boletins históricos.
- Single Source of Truth: especificações e regras detalhadas no [prd_e_especifica_o_t_cnica_mvp_sisver_o.md](file:///c:/Users/USER/Desktop/sisverao/prd_e_especifica_o_t_cnica_mvp_sisver_o.md).
- Git: commit descritivo a cada entrega importante, logo após atualizar este arquivo.

---

## Instruções da IA

## Skill: Dev Log automático
Mantenha o arquivo `dev-log.md` na raiz atualizado AUTOMATICAMENTE, sem esperar pedido explícito. Atualize sempre que:
- eu confirmar que algo funcionou / não funcionou;
- você perceber que afirmou algo incorreto;
- houver descoberta técnica importante (bug de lib, workaround, limite de API).
Seções por emoji: ✅ funciona · ❌ não funciona · 🔄 correção · 💡 padrão reutilizável · 📋 decisão de arquitetura · ⚠️ gotcha/pegadinha.
Regras: anuncie após atualizar ("📝 Dev log atualizado — [resumo]"); faça edições cirúrgicas (nunca reformate o arquivo todo); entradas novas vão NO TOPO; não registre trivialidades.

---

## Status Atual
_Última atualização: 2026-10-20 por Antigravity (Gemini 3.8 Flash)_

## Em Andamento
- Validação e testes pelo usuário do MVP Fullstack rodando em http://localhost:3000.

## Concluído
- [Antigravity] 2026-10-20 — Validação e leitura da planilha Google Sheets com os 854 salvamentos da 9ª Operação Verão.
- [Antigravity] 2026-10-20 — Configuração das instruções da IA, memória de projeto (`AGENTS.md`) e Dev Log automático (`dev-log.md`).
- [Antigravity] 2026-10-20 — Atualização completa do PRD ([prd_e_especifica_o_t_cnica_mvp_sisver_o.md](file:///c:/Users/USER/Desktop/sisverao/prd_e_especifica_o_t_cnica_mvp_sisver_o.md)) com suporte à segregação de Alta/Baixa Temporada, integração conceitual com e193 e especificação do algoritmo Smart Text Parser (colagem inteligente).
- [Antigravity] 2026-10-20 — Mapeamento da rotina de Prevenções/Atendimentos (aba "COLAR AQUI"), especificação do comportamento Upsert (atualizações múltiplas ao dia) e espelhamento oficial do boletim "RESUMO DIÁRIO" para o Comando do CBMRS.
- [Antigravity] 2026-10-20 — Inclusão do widget vertical do "PRELIMINAR DA MANHÃ (14h)" para exportação em imagem PNG idêntica ao modelo divulgado no WhatsApp.
- [Antigravity] 2026-10-20 — Construção e inicialização do MVP Fullstack: Backend Express com `node:sqlite` nativo (preparado para PostgreSQL), carga automática dos 854 salvamentos da planilha oficial, Smart Text Parser do e193, Upsert contínuo de boletins dos 13 BBMs, Card das 14h com download de imagem PNG, Resumo Diário com cópia para WhatsApp, Explorador Geral com filtros paginados e Painel de Inteligência Climática com alternância de temporadas.
- [Antigravity] 2026-10-20 — Data Automática na Preliminar das 14h (ex: "20 de outubro") e Gestão da 10ª Operação Verão (2026/2027) com interface de configuração de início/fim da Alta e Baixa Temporada, com cálculo automático e preservação histórica dos 854 salvamentos da 9ª Operação.
- [Antigravity] 2026-10-20 — Integração com a API OpenWeatherMap (script oficial `incluirTemperatura2` do CBMRS) para consulta automática de temperatura (°C), condição de tempo e direção/graus do vento durante a inserção de ocorrências, com higienização de nomes de guarita e localidade.
- [Antigravity] 2026-10-20 — Separação da aba Preliminar (14h) e desenvolvimento da aba Resumo Diário Oficial com os 3 modelos de cartazes institucionais (Consolidado Geral, Águas Internas Dia e Águas Internas Acumulado para todos os 13 BBMs), com exportação em PNG de alta resolução e texto para WhatsApp.


