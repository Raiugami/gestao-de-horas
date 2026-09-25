import {parsePages,type Person} from './audit';
import {recognizePage} from './ocr';
import {assetPath} from './asset-path';
export async function readPdf(file:File,month:string,onProgress:(s:string)=>void):Promise<Person>{
 if(file.size>40*1024*1024)throw new Error('Arquivo acima de 40 MB. Exporte um PDF menor.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('O arquivo não é um PDF válido.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const pdfjs=await import('pdfjs-dist');
 pdfjs.GlobalWorkerOptions.workerSrc=assetPath('/vendor/pdf.worker.min.mjs');
 const loading=pdfjs.getDocument({data:bytes,useSystemFonts:true,stopAtErrors:true});
 const doc=await loading.promise;
 let worker:Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>>|undefined;
 const pages:string[]=[];let ocr=false;
 try{
  if(doc.numPages>40)throw new Error('Limite de 40 páginas por PDF. Importe apenas o mês desejado.');
  for(let i=1;i<=doc.numPages;i++){
   onProgress(`${file.name} · página ${i} de ${doc.numPages}`);
   const p=await doc.getPage(i);const content=await p.getTextContent();let text=content.items.map(item=>'str'in item?item.str:'').join(' ');
   if(text.trim().length<40){
    ocr=true;onProgress(`${file.name} · lendo imagem da página ${i} de ${doc.numPages}`);
    if(!worker){const {createWorker}=await import('tesseract.js');worker=await createWorker('eng',1,{workerPath:assetPath('/vendor/worker.min.js'),corePath:assetPath('/vendor/tesseract-core-lstm.wasm.js'),langPath:assetPath('/vendor'),workerBlobURL:false,cacheMethod:'none'});await worker.setParameters({preserve_interword_spaces:'1'});}
    const viewport=p.getViewport({scale:2400/p.getViewport({scale:1}).width});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    await p.render({canvas,canvasContext:canvas.getContext('2d')!,viewport}).promise;
    text=await recognizePage(canvas,worker,month);canvas.width=0;canvas.height=0;
   }
   pages.push(text);p.cleanup();
  }
  const parsed=parsePages(pages,month);
  return {id:crypto.randomUUID(),name:file.name.replace(/\.pdf$/i,''),fileName:file.name,hash,...parsed,ocr,ocrReviewed:false,importedAt:new Date().toISOString(),pageCount:doc.numPages,exceptions:{},corrections:{}};
 }finally{await worker?.terminate();await loading.destroy();}
}
