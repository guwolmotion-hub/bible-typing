import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
test('한글 조합, 오타 수정, 완주 저장, 모드 전환과 재연습',async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'https://example.test/bible-typing/'});
 const w=dom.window;globalThis.document=w.document;globalThis.localStorage=w.localStorage;globalThis.Option=w.Option;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const realFetch=globalThis.fetch, realInterval=globalThis.setInterval;
 globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL('../passages.json',import.meta.url),'utf8'))});globalThis.setInterval=()=>0;
 try{
  await import('../app.js');const $=s=>document.querySelector(s),input=$('#typing');
  assert.equal(input.disabled,false);assert.ok($('#target').textContent.length>0);assert.equal($('#book').disabled,true);
  $('#complete').click();assert.match($('#message').textContent,/아직/);assert.equal($('#result-dialog').open,false);
  const target=$('#target').textContent;
  input.dispatchEvent(new w.CompositionEvent('compositionstart'));input.value='ㅇ';input.dispatchEvent(new w.Event('input'));
  assert.equal($('#accuracy').textContent,'100');assert.equal($('#target .wrong'),null);
  input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true}));assert.equal($('#result-dialog').open,false);
  input.value=target[0];input.dispatchEvent(new w.CompositionEvent('compositionend'));input.dispatchEvent(new w.Event('input'));
  assert.equal($('#accuracy').textContent,'100');
  input.value=target[0]+'X';input.dispatchEvent(new w.Event('input'));assert.equal($('#accuracy').textContent,'50');assert.ok($('#target .wrong'));
  input.value=target;input.dispatchEvent(new w.Event('input'));$('#complete').click();assert.equal($('#result-dialog').open,true);assert.equal(input.disabled,true);
  const saved=JSON.parse(localStorage.getItem('word-type-records'));assert.equal(saved.length,1);assert.ok(saved[0].accuracy<100);assert.equal($('#daily-count').textContent,'1');
  $('#complete').click();assert.equal(JSON.parse(localStorage.getItem('word-type-records')).length,1);
  $('#result-next').click();assert.equal($('#result-dialog').open,false);assert.equal(input.value,'');assert.equal(input.disabled,false);assert.equal($('#book').disabled,false);
  document.querySelector('[data-mode="long"]').click();assert.equal($('#mode-label').textContent,'LONG PRACTICE');assert.ok($('#target').textContent.length>150);
  $('#book').value='시편';$('#book').dispatchEvent(new w.Event('change'));assert.match($('#reference').textContent,/^시편/);
  input.value='아';input.dispatchEvent(new w.Event('input'));$('#restart').click();assert.equal(input.value,'');assert.equal($('#accuracy').textContent,'100');assert.equal($('#elapsed').textContent,'00:00');
  $('#theme').click();assert.equal(document.body.classList.contains('dark'),true);assert.equal(localStorage.getItem('word-type-theme'),'dark');$('#records').click();assert.equal(document.querySelectorAll('.record-row').length,1);
 }finally{globalThis.fetch=realFetch;globalThis.setInterval=realInterval;dom.window.close();}
});
