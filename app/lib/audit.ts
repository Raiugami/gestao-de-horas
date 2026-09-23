export type Day = { day:number; weekday:number; cents:number|null; entries:number[]; evidence:string; issue?:string; nonLabor:boolean };
export type Person = { id:string; name:string; fileName:string; hash:string; days:Day[]; warnings:string[]; ocr:boolean; ocrReviewed:boolean; importedAt:string; pageCount:number; exceptions:Record<string,string>; corrections:Record<string,{cents:number;reason:string}> };
export const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
export const displayName=(s:string)=>s.replace(/_+/g,' ').replace(/\s+/g,' ').trim();
export const currentMonth=()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`};
export const monthDays=(month:string)=>{const [y,m]=month.split('-').map(Number);return new Date(y,m,0).getDate()};
export const weekDay=(month:string,day:number)=>{const [y,m]=month.split('-').map(Number);return new Date(y,m-1,day).getDay()};
export const suggestedHolidays=(month:string):Record<string,string>=>{
 const names:Record<string,string>={'01-01':'Confraternização Universal','04-21':'Tiradentes','05-01':'Dia Mundial do Trabalho','09-07':'Independência do Brasil','10-12':'Nossa Senhora Aparecida','11-02':'Finados','11-15':'Proclamação da República','11-20':'Dia Nacional de Zumbi e da Consciência Negra','12-25':'Natal'};
 const prefix=month.slice(5);
 return Object.fromEntries(Object.entries(names).filter(([date])=>date.startsWith(`${prefix}-`)).map(([date,name])=>[String(Number(date.slice(3))),name]));
};
export const hours=(cents:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(cents/100);
export const toCents=(s:string)=>{if(!/^\d+(?:[.,]\d{1,2})?$/.test(s.trim()))return null; const n=Math.round(Number(s.replace(',','.'))*100);return Number.isSafeInteger(n)&&n>=0&&n<=2400?n:null};
const weekdays:Record<string,number>={DOMINGO:0,SEGUNDA:1,LUNES:1,TERCA:2,MARTES:2,QUARTA:3,MIERCOLES:3,QUINTA:4,JUEVES:4,SEXTA:5,VIERNES:5,SABADO:6};
export function parsePages(pages:string[],month:string){
 const text=normalize(pages.join('\n'));
 const markers=[...text.matchAll(/(?:^|\s)(\d{1,2})\s*(SEGUNDA|TERCA|QUARTA|QUINTA|SEXTA|SABADO|DOMINGO|LUNES|MARTES|MIERCOLES|JUEVES|VIERNES)(?:\s*-?\s*FEIRA)?/g)];
 const days:Day[]=[];const warnings:string[]=[];
 const numDays=monthDays(month);
 if(!/IMPUTA|INPUTA|MPUTA|DEDICACIONES/.test(text))warnings.push('Cabeçalho do Dedicaciones não reconhecido. Confira o documento.');
 const seen=new Set<number>();
 for(let i=0;i<markers.length;i++){
  const marker=markers[i],day=Number(marker[1]);
  const evidence=text.slice(marker.index!+marker[0].length,i+1<markers.length?markers[i+1].index:text.length).trim();
  if(day<1||day>numDays){warnings.push(`Dia ${day} fora do mês selecionado.`);continue;}
  if(seen.has(day)){warnings.push(`Dia ${day} repetido no PDF. Verifique se há mais de um período.`);continue;}seen.add(day);
  const matches=[...evidence.matchAll(/(?:^|\s)(\d+(?:[.,]\d+)?)\s+(SEM\s+(?:VALIDAR|IMPUTAR)|SIN\s+(?:VISAR|IMPUTAR)|VALIDAD[OA]S?|VISAD[OA]S?|APROVAD[OA]S?)(?![A-Z])/g)];
  const statusCount=[...evidence.matchAll(/\b(?:SEM\s+(?:VALIDAR|IMPUTAR)|SIN\s+(?:VISAR|IMPUTAR)|VALIDAD[OA]S?|VISAD[OA]S?|APROVAD[OA]S?)\b/g)].length;
  const nonLabor=/\b(?:NA[OG0] LABORAL|NO LABORABLE)\b/.test(evidence);
  const entries=matches.map(m=>toCents(m[1]));
  let cents:number|null=entries.length&&entries.every(x=>x!==null)?entries.reduce<number>((a,b)=>a+(b??0),0):nonLabor?0:null;
  let issue:string|undefined;
  if(statusCount!==matches.length||entries.some(x=>x===null)||(!entries.length&&!nonLabor)){cents=null;issue='Não foi possível ler todos os lançamentos deste dia.';}
  if(cents!==null&&cents>2400){cents=null;issue='Total diário fora do intervalo esperado para leitura.';}
  if(weekdays[marker[2]]!==weekDay(month,day)){issue='Dia da semana incompatível com o mês selecionado.';warnings.push('O calendário do PDF não corresponde ao mês selecionado.');}
  if(i>0&&day<Number(markers[i-1][1]))warnings.push('A sequência de dias do PDF está fora de ordem.');
  days.push({day,weekday:weekdays[marker[2]],cents,entries:entries.filter((x):x is number=>x!==null),evidence,issue,nonLabor});
 }
 for(let day=1;day<=numDays;day++)if(!seen.has(day))days.push({day,weekday:weekDay(month,day),cents:null,entries:[],evidence:'Dia não identificado no PDF.',issue:'Dia não identificado no PDF.',nonLabor:false});
 if(seen.size!==numDays)warnings.push(`${seen.size} de ${numDays} dias reconhecidos. Os demais precisam de revisão.`);
 if(pages.some(p=>p.trim().length<20))warnings.push('Uma ou mais páginas não puderam ser lidas.');
 return {days:days.sort((a,b)=>a.day-b.day),warnings:[...new Set(warnings)]};
}
export function dayResult(p:Person,d:Day,month:string,holidays:Record<string,string>){
 const exception=p.exceptions[d.day]||holidays[d.day];const weekend=[0,6].includes(weekDay(month,d.day));const correction=p.corrections[d.day];const cents=correction?.cents??d.cents;
 const expected=exception||weekend?0:800;
 const uncertain=(!correction&&(cents===null||!!d.issue))||(p.ocr&&!p.ocrReviewed);
 const status=uncertain?'review':exception||weekend?'excluded':cents===800?'ok':'pending';
 const reason=exception||(weekend?'Fim de semana':uncertain?'Leitura a revisar':cents===800?'8 horas conferidas':cents===0?'Sem horas lançadas':cents!<800?'Abaixo de 8 horas':'Acima de 8 horas');
 return {cents,expected,status,reason,correction,weekend,exception};
}
export type JiraDayAdjustment={hours:number;jiraHours:number};
export function summary(p:Person,month:string,holidays:Record<string,string>,jiraAdjustments:Record<string,JiraDayAdjustment>={}){
 const results=p.days.map(d=>{const result=dayResult(p,d,month,holidays);const adjustment=jiraAdjustments[String(d.day)];const covered=Boolean(adjustment&&result.cents!==null&&result.cents+adjustment.hours===adjustment.jiraHours);if(!covered||result.status!=='pending')return result;const expected=Math.max(0,result.expected-adjustment!.hours);return {...result,expected,status:result.cents===expected?'ok':'pending',reason:result.cents===expected?'8 horas conferidas':result.reason};});
 const pending=results.filter(x=>x.status==='pending').length;const review=results.filter(x=>x.status==='review').length;
 return {total:results.reduce((a,x)=>a+(x.cents??0),0),expected:results.reduce((a,x)=>a+x.expected,0),pending,review,ok:results.filter(x=>x.status==='ok').length,excluded:results.filter(x=>x.status==='excluded').length,status:review||p.warnings.length?'review':pending?'pending':'ok',missing:results.reduce((a,x)=>a+(x.status==='pending'?Math.max(0,x.expected-(x.cents??0)):0),0),excess:results.reduce((a,x)=>a+(x.status==='pending'?Math.max(0,(x.cents??0)-x.expected):0),0)};
}
export function csvCell(v:unknown){const text=String(v??'');return '"'+(/^[=+\-@\t\r]/.test(text)?"'":'')+text.replace(/"/g,'""')+'"'}
export function escapeHtml(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
