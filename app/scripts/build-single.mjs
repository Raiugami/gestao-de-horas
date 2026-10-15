// Gera dist-single/gestao-de-horas.html: um único arquivo que abre direto no navegador (file://),
// sem servidor. Não altera o build do GitHub Pages (npm run build).
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = join(root, 'node_modules/.cache/single-build');
const outDir = join(root, 'dist-single');
const outFile = join(outDir, 'gestao-de-horas.html');
const vendor = join(root, 'public/vendor');

// Em file:// o navegador recusa workers de módulo; o worker do PDF.js (.mjs) vira script clássico.
const classicPdfWorker = () => {
  const source = readFileSync(join(vendor, 'pdf.worker.min.mjs'), 'utf8');
  const tail = /export\{WorkerMessageHandler\};?\s*$/;
  if (!tail.test(source)) throw new Error('Formato inesperado do worker do PDF.js.');
  return Buffer.from(source.replace(tail, '').replaceAll('import.meta.url', 'self.location.href'));
};
// Em file:// um worker não consegue dar importScripts em outro blob:. O núcleo do OCR vai junto do
// worker do tesseract.js; como TesseractCore já existe, ele não tenta importar o núcleo de novo.
const tesseractWorker = () => Buffer.concat([
  readFileSync(join(vendor, 'tesseract-core-lstm.wasm.js')),
  Buffer.from(';\n'),
  readFileSync(join(vendor, 'worker.min.js')),
]);
const assets = [
  {name: 'pdf.worker.classic.js', gzip: true, bytes: classicPdfWorker},
  {name: 'tesseract.worker.combined.js', gzip: true, bytes: tesseractWorker},
  {name: 'eng.traineddata.gz', gzip: false}, // já compactado
];
for (const name of ['pdf.worker.min.mjs', 'worker.min.js', 'tesseract-core-lstm.wasm.js', 'eng.traineddata.gz']) {
  if (!existsSync(join(vendor, name))) throw new Error(`Falta public/vendor/${name}. Rode: node scripts/prepare-assets.mjs`);
}

const aliasAssetPath = {
  name: 'single-asset-path',
  enforce: 'pre',
  resolveId(source) {
    if (/(^|\/)asset-path$/.test(source)) return join(root, 'single/asset-path.ts');
  },
};

rmSync(tmp, {recursive: true, force: true});
await build({
  root: join(root, 'single'),
  configFile: false,
  publicDir: false,
  logLevel: 'warn',
  resolve: {alias: {'@': root}},
  css: {postcss: {plugins: [tailwindcss()]}},
  plugins: [aliasAssetPath, react()],
  define: {'process.env.NEXT_PUBLIC_BASE_PATH': '""'},
  build: {
    outDir: tmp,
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    rolldownOptions: {output: {codeSplitting: false, entryFileNames: 'app.js', assetFileNames: 'app[extname]'}},
  },
});

const files = readdirSync(tmp);
const js = readFileSync(join(tmp, files.find(f => f.endsWith('.js'))), 'utf8');
let css = readFileSync(join(tmp, files.find(f => f.endsWith('.css'))), 'utf8');
if (readdirSync(tmp).some(f => f.endsWith('.js') && f !== 'app.js')) throw new Error('O bundle foi dividido em mais de um arquivo.');

// Fontes da marca embutidas no CSS (o build as deixa como /brand/..., que não existe em file://).
css = css.replace(/url\((['"]?)\/brand\/([\w.-]+\.woff2)\1\)/g, (_m, _q, file) =>
  `url(data:font/woff2;base64,${readFileSync(join(root, 'public/brand', file)).toString('base64')})`);
if (/url\((['"]?)\/brand\//.test(css)) throw new Error('Há referências /brand/ não embutidas no CSS.');

const safeJs = js.replaceAll('</script', '<\u005C/script').replaceAll('<!--', '<\u005C!--');
const assetTags = assets.map(({name, gzip, bytes}) => {
  const raw = bytes ? bytes() : readFileSync(join(vendor, name));
  return `<script type="text/plain" data-asset="${name}" data-gzip="${gzip ? 1 : 0}">${(gzip ? gzipSync(raw, {level: 9}) : raw).toString('base64')}</script>`;
}).join('\n');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gestão de horas | Minsait</title>
<meta name="description" content="Confira os apontamentos diários da equipe a partir dos PDFs do Dedicaciones." />
<link rel="icon" href="data:image/svg+xml;base64,${readFileSync(join(root, 'public/favicon.svg')).toString('base64')}" />
<style>${css}</style>
</head>
<body>
<div id="root"></div>
${assetTags}
<script type="module">${safeJs}</script>
</body>
</html>
`;
mkdirSync(outDir, {recursive: true});
writeFileSync(outFile, html);
writeFileSync(join(outDir, 'LICENCAS.txt'), ['PDF.js', readFileSync(join(vendor, 'PDFJS-LICENSE.txt'), 'utf8'), '', 'Tesseract.js', readFileSync(join(vendor, 'TESSERACT-LICENSE.txt'), 'utf8')].join('\n'));
console.log(`Gerado ${outFile} (${(html.length / 1048576).toFixed(1)} MB)`);
