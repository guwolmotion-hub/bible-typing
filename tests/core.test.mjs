import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {keyCount,changedInput,dailyIndex,localDay,clock} from '../core.mjs';
test('두벌식 자소와 겹모음·겹받침의 실제 키 수',()=>{
 assert.equal(keyCount('가'),2);assert.equal(keyCount('각'),3);assert.equal(keyCount('과'),3);assert.equal(keyCount('괜'),4);assert.equal(keyCount('값'),4);assert.equal(keyCount('왜'),3);assert.equal(keyCount('A '),2);
});
test('삽입·삭제·오타 수정 시 새로운 입력만 집계',()=>{
 assert.deepEqual(changedInput('','여','여호와'),{attempts:1,correct:1});
 assert.deepEqual(changedInput('여오','여호','여호와'),{attempts:1,correct:1});
 assert.deepEqual(changedInput('여오','여','여호와'),{attempts:0,correct:0});
 assert.deepEqual(changedInput('여호','여호','여호와'),{attempts:0,correct:0});
 assert.deepEqual(changedInput('여와','여호와','여호와'),{attempts:1,correct:1});
});
test('로컬 날짜·오늘의 말씀의 결정성·경과 시간',()=>{
 assert.equal(localDay(new Date(2026,10,4)),'2026-11-04');assert.equal(dailyIndex('2026-11-04',30),dailyIndex('2026-11-04',30));assert.ok(dailyIndex('2026-11-04',30)<30);assert.equal(clock(125),'02:05');
});
test('모든 연습은 고유한 출처와 정상화된 실제 본문을 가짐',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../passages.json',import.meta.url),'utf8'));assert.equal(d.short.length,30);assert.equal(d.long.length,12);
 assert.equal(new Set([...d.short,...d.long].map(p=>p.id)).size,42);
 for(const p of [...d.short,...d.long]){assert.ok(p.text.length>0);assert.ok(!/[<>\r\n]| {2}/.test(p.text));assert.match(p.ref,/\d+:\d+/);}
 assert.ok(d.long.every(p=>p.verses>=6));
});
