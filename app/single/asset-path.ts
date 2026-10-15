// Versão do build em arquivo único: os recursos ficam embutidos no próprio HTML
// (<script type="text/plain" data-asset="...">) e viram blob: URLs sob demanda.
// Em file:// o navegador recusa workers de módulo; por isso o worker do PDF.js é
// embutido como script clássico (ver scripts/build-single.mjs) e usado via workerPort.
const urls = new Map<string, Promise<string>>();

function decode(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gunzip(bytes: Uint8Array) {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function assetElement(name: string) {
  const element = document.querySelector<HTMLScriptElement>(`script[data-asset="${name}"]`);
  if (!element) throw new Error(`Recurso embutido ausente no arquivo: ${name}`);
  return element;
}

function scriptUrl(name: string) {
  let url = urls.get(name);
  if (!url) {
    const element = assetElement(name);
    const bytes = decode(element.textContent ?? '');
    url = (element.dataset.gzip === '1' ? gunzip(bytes) : Promise.resolve(bytes)).then(data =>
      URL.createObjectURL(new Blob([data as BlobPart], {type: 'text/javascript'})));
    urls.set(name, url);
  }
  return url;
}

export async function configurePdfWorker(pdfjs: {GlobalWorkerOptions: {workerPort?: Worker | null}}) {
  // Um worker novo por leitura: o PDF.js não aceita reutilizar a mesma porta.
  pdfjs.GlobalWorkerOptions.workerPort = new Worker(await scriptUrl('pdf.worker.classic.js'));
}

let ocrWorkerUrl: Promise<string> | undefined;

function buildOcrWorker() {
  // O worker do OCR precisa do núcleo e do modelo, mas em file:// ele não consegue carregar outros blob:.
  // Por isso o script do worker recebe o modelo (base64) e responde a fetch('.../eng.traineddata.gz') com ele.
  const model = assetElement('eng.traineddata.gz').textContent?.trim() ?? '';
  const head = 'self.fetch=(f=>(u,...a)=>String(u).endsWith("/eng.traineddata.gz")?Promise.resolve(new Response(Uint8Array.from(atob(__embeddedModel),c=>c.charCodeAt(0)))):f(u,...a))(self.fetch);';
  return gunzip(decode(assetElement('tesseract.worker.combined.js').textContent ?? '')).then(code =>
    URL.createObjectURL(new Blob(['var __embeddedModel="', model, '";', head, '\n', code as BlobPart], {type: 'text/javascript'})));
}

export async function ocrWorkerConfig() {
  ocrWorkerUrl ??= buildOcrWorker();
  return {
    langs: 'eng' as string | {code: string; data: Uint8Array}[],
    workerPath: await ocrWorkerUrl,
    // O núcleo já está dentro do worker (TesseractCore existe), então o tesseract.js não o importa de novo.
    corePath: 'embedded-core.js',
    langPath: 'https://embedded.invalid' as string | undefined,
  };
}
