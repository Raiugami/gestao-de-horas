import type {Worker} from 'tesseract.js';
import {normalize,monthDays,weekDay} from './audit';
type OCRLine={text:string;bbox:{x0:number;y0:number;x1:number;y1:number};words:{text:string;bbox:{x0:number;y0:number;x1:number;y1:number}}[]};
function lines(data:{blocks?:unknown}){return ((data.blocks??[]) as {paragraphs:{lines:OCRLine[]}[]}[]).flatMap(b=>b.paragraphs.flatMap(p=>p.lines));}
const weekdayNumbers:Record<string,number>={DOMINGO:0,SEGUNDA:1,LUNES:1,TERCA:2,MARTES:2,QUARTA:3,MIERCOLES:3,QUINTA:4,JUEVES:4,SEXTA:5,VIERNES:5,SABADO:6};
const weekdayNames=['DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO'];
export function resolveOCRDay(candidate:number,weekday:string|undefined,previousDay:number|undefined,month:string){
 const totalDays=monthDays(month),nextDay=previousDay===undefined?undefined:previousDay+1,weekdayNumber=weekday?weekdayNumbers[weekday]:undefined;
 if(nextDay&&nextDay<=totalDays&&weekdayNumber!==undefined&&weekDay(month,nextDay)===weekdayNumber)return nextDay;
 if(candidate<1||candidate>totalDays)return null;
 if(nextDay!==undefined&&candidate!==nextDay)return null;
 return candidate;
}
export function resolveOCRWeekday(day:number,detected:string|undefined,month:string){return detected??weekdayNames[weekDay(month,day)];}
export async function recognizePage(canvas:HTMLCanvasElement,worker:Worker,month:string){
 const ctx=canvas.getContext('2d')!;const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){const c=(pixels.data[i]+pixels.data[i+1]+pixels.data[i+2])/3<210?0:255;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=c;}ctx.putImageData(pixels,0,0);
 await worker.setParameters({tessedit_pageseg_mode:'6' as never,preserve_interword_spaces:'1',tessedit_char_whitelist:''});
 const full=await worker.recognize(canvas,{}, {text:true,blocks:true});
 // Separate the narrow day column from the hours table; OCR otherwise mixes
 // the day number with the entry on the same visual line.
 const left=document.createElement('canvas');const x=Math.floor(canvas.width*.06),w=Math.floor(canvas.width*.095);left.width=w*2;left.height=canvas.height*2;left.getContext('2d')!.drawImage(canvas,x,0,w,canvas.height,0,0,left.width,left.height);
 const col=await worker.recognize(left,{}, {text:true,blocks:true});const leftLines=lines(col.data);const mainLines=lines(full.data);
 const markers:{day:number;word:string;y:number}[]=[];
 for(let i=0;i<leftLines.length-1;i++){
  const line=leftLines[i];const match=line.text.trim().replace(/[|lI]/g,'1').match(/^(\d{1,2})\s*[:.]?$/);if(!match)continue;
  const weekday=normalize(leftLines[i+1].text).replace(/^TERGA/,'TERCA').replace(/^SEABADO/,'SABADO').match(/^(SEGUNDA|TERCA|QUARTA|QUINTA|SEXTA|SABADO|DOMINGO|LUNES|MARTES|MIERCOLES|JUEVES|VIERNES)/);
  let day=Number(match[1]);
  if(markers.length&&day!==markers.at(-1)!.day+1){
   const box=line.words[0].bbox;const crop=document.createElement('canvas');const pad=24;crop.width=(box.x1-box.x0+8)*3+pad*2;crop.height=(box.y1-box.y0+8)*3+pad*2;const c=crop.getContext('2d')!;c.fillStyle='white';c.fillRect(0,0,crop.width,crop.height);c.drawImage(left,box.x0-4,box.y0-4,box.x1-box.x0+8,box.y1-box.y0+8,pad,pad,crop.width-pad*2,crop.height-pad*2);
   await worker.setParameters({tessedit_pageseg_mode:'7' as never,tessedit_char_whitelist:'0123456789'});const retry=(await worker.recognize(crop)).data.text.trim();if(/^\d{1,2}$/.test(retry))day=Number(retry);await worker.setParameters({tessedit_pageseg_mode:'6' as never,tessedit_char_whitelist:''});crop.width=0;crop.height=0;
  }
  const resolvedDay=resolveOCRDay(day,weekday?.[1],markers.at(-1)?.day,month);if(resolvedDay===null)continue;
  markers.push({day:resolvedDay,word:resolveOCRWeekday(resolvedDay,weekday?.[1],month),y:line.bbox.y0/2});
 }
 if(!markers.length){left.width=0;left.height=0;return full.data.text;}
 const top=mainLines.filter(l=>l.bbox.y1<markers[0].y).map(l=>l.text).join(' ');
 const output=markers.map((m,i)=>{const bottom=markers[i+1]?.y??canvas.height;const words=mainLines.flatMap(l=>l.words).filter(w=>w.bbox.x0>=canvas.width*.155&&(w.bbox.y0+w.bbox.y1)/2>=m.y-4&&(w.bbox.y0+w.bbox.y1)/2<bottom-4);return `${m.day} ${m.word} ${words.map(w=>w.text).join(' ')}`});
 left.width=0;left.height=0;return top+'\n'+output.join('\n');
}
