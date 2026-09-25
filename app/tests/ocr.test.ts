import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePages} from '../lib/audit';
import {readOCRDate,resolveOCRDay,resolveOCRWeekday} from '../lib/ocr';

test('OCR accepts punctuation after a date without accepting header dates or codes',()=>{
 assert.equal(readOCRDate('1                        )'),1);
 assert.equal(readOCRDate('28                 :'),28);
 assert.equal(readOCRDate('1.'),1);
 assert.equal(readOCRDate('09/2026, 09:49'),null);
 assert.equal(readOCRDate('1.4.1'),null);
 assert.equal(readOCRDate('24TP08'),null);
 assert.equal(readOCRDate('1 Terça'),null);
});

test('OCR date reconciliation follows the selected month including leap years',()=>{
 assert.equal(resolveOCRDay(readOCRDate('1 )'),'TERCA',undefined,'2026-09'),1);
 assert.equal(resolveOCRDay(null,'QUARTA',1,'2026-09'),2);
 assert.equal(resolveOCRDay(null,'QUINTA',28,'2024-02'),29);
 assert.equal(resolveOCRDay(null,'DOMINGO',28,'2026-02'),null);
 assert.equal(resolveOCRDay(31,'SEGUNDA',30,'2026-04'),null);
 assert.equal(resolveOCRDay(1,'SABADO',undefined,'2026-08'),1);
});

test('Sibele day one remains an eight-hour vacation entry after OCR punctuation',()=>{
 const first=resolveOCRDay(readOCRDate('1                        )'),'TERCA',undefined,'2026-09');
 assert.equal(first,1);
 const parsed=parsePages([`IMPUTAÇÃO DE HORAS ${first} Terça Y2025 1 Vacaciones 2025 -- -- 8 FÉRIAS 2 Quarta Y2025 1 Vacaciones 2025 -- -- 8 FÉRIAS`],'2026-09');
 assert.equal(parsed.days[0].cents,800);
 assert.equal(parsed.days[0].vacation,true);
 assert.equal(parsed.days[0].entries.length,1);
});

test('OCR recovers a misread sequential date from its weekday',()=>{
 assert.equal(resolveOCRDay(1,'SEXTA',10,'2026-09'),11);
 assert.equal(resolveOCRDay(16,'QUINTA',9,'2026-09'),10);
});

test('OCR recovers an unreadable date from the next weekday in the adjacent row',()=>{
 assert.equal(resolveOCRDay(null,'SEXTA',10,'2026-09',true),11);
});

test('OCR does not assign a distant row with the same weekday to the next date',()=>{
 assert.equal(resolveOCRDay(18,'SEXTA',10,'2026-09',false),null);
});

test('OCR keeps each adjacent workday in its own hour total',()=>{
 const day11=resolveOCRDay(1,'SEXTA',10,'2026-09');
 assert.equal(day11,11);
 const text=`IMPUTAÇÃO DE HORAS 10 Quinta 24TP08 1.1.1 MOD -- -- 8 SEM VALIDAR ${day11} Sexta 24TP08 1.1.1 MOD -- -- 8 SEM VALIDAR 12 Sábado NÃO LABORAL`;
 const days=parsePages([text],'2026-09').days;
 assert.equal(days.find(day=>day.day===10)?.cents,800);
 assert.equal(days.find(day=>day.day===11)?.cents,800);
});

test('OCR accepts the next numbered date when the weekday label is unreadable',()=>{
 const day=resolveOCRDay(11,undefined,10,'2026-09');
 assert.equal(day,11);
 const weekday=resolveOCRWeekday(day!,undefined,'2026-09');
 assert.equal(weekday,'SEXTA');
 assert.equal(resolveOCRDay(12,undefined,10,'2026-09'),null);
 const parsed=parsePages([`IMPUTAÇÃO DE HORAS 10 Quinta 24TP08 -- -- 8 SEM VALIDAR ${day} ${weekday} 24TP08 -- -- 8 SEM VALIDAR 12 Sábado NÃO LABORAL`],'2026-09');
 assert.equal(parsed.days.find(item=>item.day===10)?.cents,800);
 assert.equal(parsed.days.find(item=>item.day===11)?.cents,800);
});

test('OCR keeps the Karin September rows separate when day 11 is read as an invalid token',()=>{
 const candidates:[number|null,string,boolean,number][]=[
  [10,'QUINTA',true,800],[null,'SEXTA',true,800],[12,'SABADO',true,0],[13,'DOMINGO',true,0],
  [14,'SEGUNDA',true,800],[15,'TERCA',true,800],[16,'QUARTA',true,800],[17,'QUINTA',true,800],
  [18,'SEXTA',true,800],[19,'SABADO',true,0],[20,'DOMINGO',true,0],[21,'SEGUNDA',true,800],
  [22,'TERCA',true,800],[23,'QUARTA',true,800],[24,'QUINTA',true,800],[25,'SEXTA',true,800],[26,'SABADO',true,0],
 ];
 let previous:number|undefined;
 const rows=candidates.map(([candidate,weekday,adjacent,hours])=>{
  const day=resolveOCRDay(candidate,weekday,previous,'2026-09',adjacent);
  assert.notEqual(day,null);
  previous=day!;
  return `${day} ${weekday} ${hours===0?'NÃO LABORAL':`24TP08 1.4.1 MOD -- -- ${hours/100} SEM VALIDAR`}`;
 });
 const parsed=parsePages([`IMPUTAÇÃO DE HORAS ${rows.join(' ')}`],'2026-09');
 assert.equal(parsed.days.find(day=>day.day===10)?.cents,800);
 assert.equal(parsed.days.find(day=>day.day===11)?.cents,800);
 assert.equal(parsed.days.find(day=>day.day===10)?.entries.length,1);
 for(const day of [21,22,23,24,25])assert.equal(parsed.days.find(item=>item.day===day)?.cents,800);
});
