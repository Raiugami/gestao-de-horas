import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePages} from '../lib/audit';
import {resolveOCRDay,resolveOCRWeekday} from '../lib/ocr';

test('OCR recovers a misread sequential date from its weekday',()=>{
 assert.equal(resolveOCRDay(1,'SEXTA',10,'2026-09'),11);
 assert.equal(resolveOCRDay(16,'QUINTA',9,'2026-09'),10);
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
