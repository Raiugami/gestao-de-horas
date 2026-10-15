export function assetPath(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}

// O build em arquivo único (single/asset-path.ts) substitui este módulo e embute os recursos.
type PdfWorkerOptions = {GlobalWorkerOptions: {workerSrc: string}};

export async function configurePdfWorker(pdfjs: PdfWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = assetPath('/vendor/pdf.worker.min.mjs');
}

export async function ocrWorkerConfig() {
  return {
    langs: 'eng' as string | {code: string; data: Uint8Array}[],
    workerPath: assetPath('/vendor/worker.min.js'),
    corePath: assetPath('/vendor/tesseract-core-lstm.wasm.js'),
    langPath: assetPath('/vendor') as string | undefined,
  };
}
