# Gestão de horas

Aplicação web para conferir os apontamentos mensais da equipe a partir dos PDFs do Dedicaciones. Ela organiza as horas por pessoa e por dia, destaca o que precisa de revisão e permite exportar o fechamento.

<p align="center">
  <a href="https://raiugami.github.io/gestao-de-horas/">
    <strong>Abrir Gestão de horas</strong>
  </a>
  ·
  <a href="app/README.md">Desenvolvimento e validação</a>
</p>

<p align="center">
  <a href="https://github.com/Raiugami/gestao-de-horas/actions/workflows/pages.yml">
    <img src="https://github.com/Raiugami/gestao-de-horas/actions/workflows/pages.yml/badge.svg" alt="Status da publicação no GitHub Pages">
  </a>
</p>

## Como usar

1. Escolha o mês de referência.
2. Adicione os PDFs dos colaboradores. A aplicação lê PDFs com texto e também pode ler páginas em imagem; leituras por imagem precisam ser conferidas.
3. Se quiser comparar apontamentos e justificativas, importe uma exportação do Jira (`.csv`, `.xls` ou `.xlsx`).
4. Revise os indicadores, os dias sinalizados e as exceções de jornada.
5. Exporte o CSV detalhado ou o relatório para gestão.

## Como as horas do Jira aparecem no calendário

As horas do Jira só substituem as do PDF no calendário quando a justificativa é **atestado ou férias** e os totais conferem. Nos demais casos, prevalece a leitura do PDF. A comparação do Jira é informativa: ela não aprova automaticamente uma ausência.

## Recursos

- Conferência de oito horas por dia útil, com soma de lançamentos entre páginas e projetos.
- Leitura de PDFs de texto e de páginas em imagem, com confirmação humana para leituras por imagem.
- Comparação opcional com exportações do Jira carregadas pelo usuário.
- Busca, filtros, resumo da equipe e mapa diário.
- Cadastro de feriados, férias e outras exceções justificadas.
- Exportação de CSV detalhado e relatório para gestão.
- Interface adaptável, tema escuro e guia de uso integrado.

## Privacidade

Os PDFs, arquivos do Jira e dados da conferência são processados no navegador e não são enviados a um servidor. Os dados permanecem na memória da aba e são removidos ao limpar a conferência ou fechar/recarregar a página. O GitHub Pages publica os arquivos estáticos da aplicação, não os documentos importados.

## Desenvolvimento local

Requisitos: Node.js `22.13` ou superior da série 22 e npm.

```bash
cd app
npm ci
npm run dev
```

Para validar e gerar a versão estática:

```bash
npm test
npx tsc --noEmit
npm run build
```

O workflow em `.github/workflows/pages.yml` prepara os caminhos do projeto e publica `app/dist/client` no GitHub Pages quando as mudanças chegam à branch `main`.
