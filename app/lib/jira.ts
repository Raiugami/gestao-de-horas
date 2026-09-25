import * as XLSX from 'xlsx';
import {normalize,displayName,type Person,dayResult} from './audit';

export type JiraCategory='atestado'|'ferias';
export type JiraIssue = {name:string;days:Record<string,number>};
export type JiraPerson = {name:string;days:Record<string,number>;issues:string[];issueDetails?:JiraIssue[];justifications:Record<string,JiraCategory>;justificationCategories?:Record<string,JiraCategory[]>;justificationHours?:Record<string,number>;total:number};
export type JiraImport = {month:string;people:JiraPerson[];fileName:string};

const months:Record<string,string>={january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12',janeiro:'01',fevereiro:'02',marco:'03',abril:'04',maio:'05',junho:'06',julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12'};
const text=(value:unknown)=>String(value??'').trim();
const cents=(value:unknown)=>{if(typeof value==='number'&&Number.isFinite(value))return Math.round(value*100);const valueText=text(value).replace(',','.');if(!valueText)return 0;const number=Number(valueText);return Number.isFinite(number)?Math.round(number*100):0};
const classifyIssue=(value:string):JiraCategory|undefined=>{const issue=normalize(value);if(/^VBRAMO-\d+\s*-\s*HOLIDAYS$/.test(issue))return 'ferias';if(/\b(?:FERIAS|VACACIONES|HOLIDAYS)\b/.test(issue))return undefined;return /\b(?:AUSENCIA|ATESTAD|CERTIFICADO MEDICO)\b/.test(issue)?'atestado':undefined};
export function jiraCategoriesForDay(person:JiraPerson|undefined,day:string):JiraCategory[]{if(!person)return [];if(person.issueDetails!==undefined)return Array.from(new Set(person.issueDetails.map(issue=>issue.days[day]>0?classifyIssue(issue.name):undefined).filter((category):category is JiraCategory=>Boolean(category))));return person.justificationCategories?.[day]??(person.justifications?.[day]?[person.justifications[day]]:[]);}
export function jiraJustificationHoursForDay(person:JiraPerson|undefined,day:string){if(!person)return 0;if(person.issueDetails)return person.issueDetails.reduce((sum,issue)=>sum+(issue.days[day]>0&&classifyIssue(issue.name)?issue.days[day]:0),0);return person.justificationHours?.[day]??0;}
function parseMonth(value:unknown){
 const match=text(value).match(/^([A-Za-zÀ-ÿ]+)-(\d{2}|\d{4})$/);if(!match)return null;
 const month=months[normalize(match[1]).toLowerCase()];if(!month)return null;
 const year=match[2].length===2?`20${match[2]}`:match[2];return `${year}-${month}`;
}
export function parseJiraWorkbook(data:ArrayBuffer,fileName:string):JiraImport{
 const workbook=XLSX.read(data,{type:'array',cellDates:false});const sheet=workbook.Sheets[workbook.SheetNames[0]];const rows=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:null});
 const month=parseMonth(rows[0]?.[0]);if(!month)throw new Error('Não foi possível identificar o mês na exportação do Jira.');
 const headerIndex=rows.findIndex(row=>text(row[0]).toLowerCase()==='name');if(headerIndex<1)throw new Error('A exportação do Jira não contém a coluna Name.');
 const dayColumns=rows[headerIndex-1].map((value,index)=>({day:Number(value),index})).filter(x=>Number.isInteger(x.day)&&x.day>=1&&x.day<=31&&x.index>=4);
 if(!dayColumns.length)throw new Error('A exportação do Jira não contém colunas diárias reconhecidas.');
 const people:{name:string;parent:Record<string,number>;issues:{name:string;days:Record<string,number>}[]}[]=[];let current:typeof people[number]|undefined;
 for(const row of rows.slice(headerIndex+1)){
  const name=text(row[0]);const issue=text(row[1]);
  if(current&&issue){current.issues.push({name:issue,days:Object.fromEntries(dayColumns.map(({day,index})=>[String(day),cents(row[index])]))});continue;}
  if(name){current={name,parent:Object.fromEntries(dayColumns.map(({day,index})=>[String(day),cents(row[index])])),issues:[]};people.push(current);}
 }
 if(!people.length)throw new Error('Nenhuma pessoa foi encontrada na exportação do Jira.');
 return {month,people:people.map(person=>{const days=person.issues.length?Object.fromEntries(dayColumns.map(({day})=>{const key=String(day);return [key,person.issues.reduce((sum,issue)=>sum+(issue.days[key]??0),0)]})):person.parent;const justifications:Record<string,JiraCategory>={};const justificationCategories:Record<string,JiraCategory[]>={};const justificationHours:Record<string,number>={};for(const issue of person.issues){const category=classifyIssue(issue.name);if(category)for(const [day,value] of Object.entries(issue.days))if(value>0){justifications[day]=justifications[day]??category;justificationCategories[day]=justificationCategories[day]??[];if(!justificationCategories[day].includes(category))justificationCategories[day].push(category);justificationHours[day]=(justificationHours[day]??0)+value;}}return {name:person.name,days,issues:person.issues.map(issue=>issue.name),issueDetails:person.issues,justifications,justificationCategories,justificationHours,total:Object.values(days).reduce((sum,value)=>sum+value,0)}}),fileName};
}
export async function readJiraFile(file:File){return parseJiraWorkbook(await file.arrayBuffer(),file.name);}
const nameTokens=(value:string)=>normalize(displayName(value)).replace(/[^A-Z0-9]+/g,' ').split(' ').filter(Boolean);
const nameKey=(value:string)=>nameTokens(value).sort().join(' ');
export function findJiraPerson(person:Pick<Person,'name'>,records:JiraPerson[]){
 const exact=nameKey(person.name);const exactMatch=records.find(record=>nameKey(record.name)===exact);if(exactMatch)return exactMatch;
 const pdfTokens=nameTokens(person.name);const scored=records.map(record=>{const jiraTokens=nameTokens(record.name);const pdfIncluded=pdfTokens.every(token=>jiraTokens.includes(token));const jiraIncluded=jiraTokens.every(token=>pdfTokens.includes(token));return {record,score:pdfIncluded?100+pdfTokens.length:jiraIncluded?90+jiraTokens.length:0};}).filter(result=>result.score>0).sort((a,b)=>b.score-a.score);
 if(!scored.length||scored[0].score===scored[1]?.score)return undefined;return scored[0].record;
}
export function jiraDifferences(person:Person,jira:JiraPerson|undefined,month:string,holidays:Record<string,string>){
 if(!jira)return {missingInJira:0,missingInDedicaciones:0,different:0,days:[] as number[],missingInDedicacionesDays:[] as number[],details:[] as {day:number;pdf:number;jira:number;justified:number;activities:number;coveredByJustification:boolean;different:boolean}[]};
 const days=person.days.map(day=>{const key=String(day.day);const pdf=dayResult(person,day,month,holidays).cents??0;const jiraHours=jira.days[key]??0;const justified=jiraJustificationHoursForDay(jira,key);const coveredByJustification=pdf+justified===jiraHours;return {day:day.day,pdf,jira:jiraHours,justified,activities:Math.max(0,jiraHours-justified),coveredByJustification,different:pdf!==jiraHours&&!coveredByJustification&&(!dayResult(person,day,month,holidays).exception)}});
 return {missingInJira:days.filter(x=>x.different&&x.pdf>0&&x.jira===0).length,missingInDedicaciones:days.filter(x=>x.different&&x.jira>0&&x.pdf===0).length,different:days.filter(x=>x.different).length,days:days.filter(x=>x.different).map(x=>x.day),missingInDedicacionesDays:days.filter(x=>x.different&&x.jira>0&&x.pdf===0).map(x=>x.day),details:days.filter(x=>x.different||x.justified>0)};
}
