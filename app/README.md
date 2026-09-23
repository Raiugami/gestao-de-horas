# Gestão de horas · desenvolvimento

Aplicação para conferir a jornada diária de oito horas úteis com base nos PDFs do Dedicaciones. O processamento e a leitura por imagem acontecem no navegador.

## Fluxo de uso

1. Selecione o mês de referência; a data de impressão não comprova o período dos apontamentos.
2. Importe os PDFs da equipe. O nome do arquivo é usado como nome inicial da pessoa e pode ser ajustado nos detalhes.
3. Confira os dias identificados e valide manualmente as leituras de páginas em imagem.
4. Opcionalmente, importe uma exportação mensal do Jira (`.csv`, `.xls` ou `.xlsx`) para comparar horas e justificativas.
5. Registre feriados, férias ou ausências em Férias e exceções e exporte o CSV ou o relatório para gestão.

## Regra de comparação com o Jira

As horas do Jira só substituem as do PDF no calendário quando a justificativa é atestado ou férias e os totais conferem. Para outras justificativas, mantém-se a leitura do PDF. A comparação não aprova uma ausência automaticamente.

## Regras e limites

- A meta é oito horas por dia útil; valores decimais são somados em centésimos.
- Lançamentos de projetos e páginas diferentes são somados.
- Dias ausentes, formatos desconhecidos e leituras duvidosas exigem revisão; não são tratados como zero automaticamente.
- Finais de semana e exceções cadastradas são dispensados da meta diária.
- Ajustes manuais corrigem a leitura e preservam o valor original e o motivo.
- A conferência cobre os arquivos importados e não detecta pessoas que não enviaram PDF.
- Limite por arquivo: 40 MB e 40 páginas; arquivos protegidos ou ilegíveis precisam ser exportados novamente.
- Os dados ficam na memória da aba e são removidos ao limpar a conferência ou fechar/recarregar a página.

## Desenvolvimento

Use Node.js `22.13` ou superior da série 22 e npm.

```bash
npm ci
npm run dev
npm test
npx tsc --noEmit
npm run build
```

O build estático fica em `dist/client`. Para preparar os caminhos usados no GitHub Pages, defina `NEXT_PUBLIC_BASE_PATH` como o caminho do repositório e execute `node scripts/prepare-pages.mjs`. O workflow do repositório faz essa preparação automaticamente.
