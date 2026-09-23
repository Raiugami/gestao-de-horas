import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {parseJiraWorkbook,findJiraPerson} from '../lib/jira';

function workbook(rows:unknown[][]){
 const sheet=XLSX.utils.aoa_to_sheet(rows);const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'Sheet0');
 return XLSX.write(book,{type:'buffer',bookType:'xls'});
}

test('parses Jira monthly export and aggregates issue rows by person',()=>{
 const data=workbook([
  ['September-26',null,null,null,'01','02','03'],
  ['Name','Issue','Total','%','Tue','Wed','Thu'],
  ['Pessoa Um',null,16,100,8,8,null],
  [null,'VBRAMO-27650-Ausência: Pessoa Um',8,50,null,null,8],
  [null,'VBRAMO-2 - Projeto',8,50,8,8,null],
  ['Pessoa Dois',null,8,100,8,null,null]
 ]);
 const result=parseJiraWorkbook(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'export.xls');
 assert.equal(result.month,'2026-09');assert.equal(result.people.length,2);assert.deepEqual(result.people[0].days,{'1':8*100,'2':8*100,'3':8*100});assert.equal(result.people[0].total,24*100);assert.deepEqual(result.people[0].issues,['VBRAMO-27650-Ausência: Pessoa Um','VBRAMO-2 - Projeto']);assert.deepEqual(result.people[0].justifications,{'3':'atestado'});
});

test('rejects exports without a recognizable month',()=>{
 const data=workbook([['Jira'],['Name','Issue','Total','%','01']]);
 assert.throws(()=>parseJiraWorkbook(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'export.xls'),/mês/);
});

test('classifies Holidays as vacation evidence',()=>{
 const data=workbook([['September-26',null,null,null,'01'],['Name','Issue','Total','%','Tue'],['Pessoa',null,8,100,null],[null,'VBRAMO-9 - Holidays',8,100,8]]);
 const result=parseJiraWorkbook(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'export.xls');
 assert.equal(result.people[0].justifications['1'],'ferias');
});

test('prioritizes vacation when the issue also says absence',()=>{
 const data=workbook([['September-26',null,null,null,'01'],['Name','Issue','Total','%','Tue'],['Pessoa',null,8,100,null],[null,'VBRAMO-9 - Ausência: Férias',8,100,8]]);
 const result=parseJiraWorkbook(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'export.xls');
 assert.equal(result.people[0].justifications['1'],'ferias');
});

test('classifies the real Camilly absence issue format',()=>{
 const data=workbook([
  ['September-26',null,null,null,'01','02','03'],
  ['Name','Issue','Total','%','Tue','Wed','Thu'],
  ['De Barros Santos, Camilly',null,11.17,100,null,null,null],
  [null,'VBRAMO-27650 - Ausência: Camilly De Barros',1,0.6,null,1,null],
  [null,'VBRAMO-27799 - Ausência: Camilly De Barros',3.17,1.89,null,null,3.17]
 ]);
 const result=parseJiraWorkbook(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'export.xls');
 assert.equal(result.people[0].justifications['2'],'atestado');
 assert.equal(result.people[0].justifications['3'],'atestado');
 assert.equal(result.people[0].justificationHours?.['2'],100);
 assert.equal(result.people[0].justificationHours?.['3'],317);
});

test('keeps atestado and vacation categories on the same day',()=>{
 const data=workbook([
  ['September-26',null,null,null,'01'],
  ['Name','Issue','Total','%','Tue'],
  ['Pessoa',null,8,100,null],
  [null,'VBRAMO-1 - Ausência: Pessoa',2,25,2],
  [null,'VBRAMO-2 - Holidays: Pessoa',2,25,2],
  [null,'VBRAMO-3 - Projeto',4,50,4]
 ]);
 const result=parseJiraWorkbook(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'export.xls');
 assert.deepEqual(result.people[0].justificationCategories?.['1'],['atestado','ferias']);
 assert.equal(result.people[0].justificationHours?.['1'],400);
});

test('matches abbreviated PDF names to one complete Jira name',()=>{
 const records=[{name:'Francelino De Jesus Da Silva, Arilson',days:{},issues:[],justifications:{},total:0},{name:'Santos Silva, Taina',days:{},issues:[],justifications:{},total:0}];
 assert.equal(findJiraPerson({name:'Arilson'},records)?.name,'Francelino De Jesus Da Silva, Arilson');
 assert.equal(findJiraPerson({name:'Taina'},records)?.name,'Santos Silva, Taina');
});

test('normalizes underscores, punctuation and accents when matching Jira names',()=>{
 const records=[{name:'Antonio, Gabriel',days:{},issues:[],justifications:{},total:0}];
 assert.equal(findJiraPerson({name:'Gabríel_Antônio'},records)?.name,'Antonio, Gabriel');
});

test('does not guess when an abbreviated name is ambiguous',()=>{
 const records=[{name:'Ana Silva',days:{},issues:[],justifications:{},total:0},{name:'Ana Santos',days:{},issues:[],justifications:{},total:0}];
 assert.equal(findJiraPerson({name:'Ana'},records),undefined);
});
