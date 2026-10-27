# Continuidade do projeto

Atualizado em 14/10/2026. Este arquivo registra o estado e as decisões do produto para quem continuar o desenvolvimento sem o histórico desta conversa.

## Objetivo

Conferir mensalmente as horas da equipe a partir dos PDFs do Dedicaciones, reduzindo a revisão manual pessoa por pessoa. A aplicação organiza leituras por colaborador e dia, destaca incertezas e divergências, permite comparar com uma exportação do Jira e gera arquivos de fechamento.

Aplicação publicada: https://raiugami.github.io/gestao-de-horas/
Repositório de publicação: https://github.com/Raiugami/gestao-de-horas

## Regras de negócio que não devem ser afrouxadas

- O período precisa ser selecionado pelo usuário; a data de impressão do PDF não comprova o mês dos apontamentos.
- A meta padrão é 8 horas por dia útil. Some todos os lançamentos do dia, entre projetos, páginas e linhas, usando centésimos de hora.
- `SEM VALIDAR`/`SIN VISAR` é estado de aprovação do lançamento, não ausência de horas.
- Páginas de imagem usam OCR e exigem conferência humana. Dia não encontrado, layout desconhecido ou valor duvidoso fica pendente; nunca transformar falta de evidência em zero/aprovação.
- Uma leitura manual corrigida deve preservar o valor extraído e o motivo do ajuste.
- Importação do Jira é opcional, feita a partir de arquivo do usuário; não há conexão direta com o Jira.
- As horas do Jira substituem a leitura do PDF no calendário somente em casos de atestado ou férias, e quando os totais correspondem. Para outras justificativas, prevalece o PDF.
- A issue canônica de férias do Jira segue `VBRAMO-xxxxx - Holidays`. Uma atividade como `Cobrir Férias <pessoa>` não significa que a pessoa responsável tirou férias.
- Férias que já aparecem no PDF devem ser reconhecidas como tal, inclusive `VACACIONES`; evite contar a mesma pessoa mais de uma vez nos indicadores.
- Feriados e ausências exigem exceção aplicável. Sugestões de feriados não devem dispensar horas sem confirmação explícita.

## Privacidade e limites

O processamento acontece no navegador. PDFs, exportações Jira e estado da conferência não são enviados ao servidor. Os dados da sessão ficam em memória e se perdem ao limpar ou recarregar/fechar a aba. O Pages distribui arquivos estáticos, não os documentos importados.

Limites atuais do leitor: 40 MB por PDF, 40 páginas por arquivo e 200 pessoas. Não coloque PDFs reais da equipe, exportações do Jira nem dados de RH no repositório. Os documentos reais usados para conferir bugs não estão versionados.

## Interface e exportações

A identidade visual aprovada usa a marca Minsait em ameixa/vinho, magenta e neutros, com ondas discretas no menu lateral. A logo da sidebar agora é SVG inline para funcionar no caminho-base do GitHub Pages. O relatório executivo tem cabeçalho e rodapé Minsait, paginação de impressão e modo escuro.

O app oferece conferência mensal, férias e exceções, guia de uso, alternância de tema, comparação com Jira, resumo, mapa diário, CSV e relatório executivo. As funções de salvar/abrir sessão foram removidas. Não reintroduzi-las sem pedido explícito.

## Mapa do código

- `app/app/page.tsx`: interface e estado da conferência.
- `app/components/workspace.tsx`: shell da aplicação, navegação, logo, guia e tema.
- `app/app/workspace.css`: layout do shell e menu lateral.
- `app/app/globals.css`: estilos gerais.
- `app/lib/audit.ts`: calendário, interpretação, validação e cálculos.
- `app/lib/pdf-reader.ts` e `app/lib/ocr.ts`: leitura de PDF, extração de texto e OCR.
- `app/lib/jira.ts`: importação e classificação do Jira.
- `app/lib/export.ts`: CSV, relatório executivo e impressão.
- `app/tests/`: testes automatizados das regras.
- `app/scripts/prepare-assets.mjs`: workers/modelo OCR e verificação de hash.
- `app/scripts/prepare-pages.mjs`: caminhos e arquivos para GitHub Pages.
- `.github/workflows/pages.yml`: validação, build e publicação.

## Desenvolvimento e validação

Requer Node.js `22.13` ou superior da série 22 e npm.

```powershell
cd app
npm ci
npm run dev
npm test
npx tsc --noEmit
npx oxlint components/workspace.tsx
npm run build
```

Para validar o empacotamento do GitHub Pages, use `NEXT_PUBLIC_BASE_PATH=/gestao-de-horas` e rode `node scripts/prepare-pages.mjs` depois do build. O workflow faz isso automaticamente no GitHub. Evite adicionar scripts de infraestrutura ou dependências sem necessidade; preserve o lockfile.

## Estado publicado

Em 27/10/2026, a branch `main` de `Raiugami/gestao-de-horas` contém o commit `4fbb962` (`Corrige pareamento de nomes truncados do Jira`), publicado com sucesso pelo workflow do GitHub Pages. A validação local mais recente teve 41 testes aprovados, typecheck e build. O lint geral ainda aponta erros anteriores a este commit em `tests/audit.test.ts`, `tests/jira.test.ts` e `components/ui/chart.tsx`. O log do deploy é https://github.com/Raiugami/gestao-de-horas/actions/runs/40525436553.

O OCR e os parsers são cobertos por PDFs sintéticos e casos de regressão conhecidos, mas nenhum conjunto de testes garante todo layout futuro. Ao alterar leitura/calculadora, acrescente casos generalizáveis de regressão; não codifique solução limitada a um mês ou a uma pessoa. Mantenha a validação humana de OCR.

## Como continuar

Leia também `app/README.md`, examine o código antes de propor alterações e preserve as regras acima. Para ajustes de leitura, reproduza o caso com dados sintéticos ou fixtures sem informações pessoais, valide o mês e a soma entre linhas/páginas e rode os testes. Publique na branch `main` de `Raiugami/gestao-de-horas` somente quando o usuário pedir ou autorizar a publicação na conversa atual; confirme o resultado do workflow antes de dizer que o GitHub Pages foi atualizado.
