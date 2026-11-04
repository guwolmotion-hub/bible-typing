import {keyCount,changedInput,localDay,dailyIndex,clock,splitLines} from './core.mjs';
const $=s=>document.querySelector(s);
let data,mode='today',passage,lines=[],lineIndex=0;
let started=0,finished=false,composing=false,previous='',attempts=0,correctAttempts=0,stoppedTime=0,autoTimer;
let history=[];
try{const saved=JSON.parse(localStorage.getItem('word-type-records')||'[]');if(Array.isArray(saved))history=saved.filter(r=>r&&typeof r.ref==='string'&&typeof r.day==='string'&&Number.isFinite(r.speed)&&Number.isFinite(r.accuracy)&&Number.isFinite(r.seconds)).slice(0,50);}catch{}
try{if(localStorage.getItem('word-type-theme')==='dark')document.body.classList.add('dark');}catch{}
function syncTheme(){const dark=document.body.classList.contains('dark');$('#theme').textContent=dark?'☀':'☾';$('#theme').setAttribute('aria-label',dark?'밝은 화면으로 전환':'어두운 화면으로 전환');}
syncTheme();
$('#theme').onclick=()=>{document.body.classList.toggle('dark');syncTheme();try{localStorage.setItem('word-type-theme',document.body.classList.contains('dark')?'dark':'light');}catch{}};
$('#date').textContent=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(new Date());
function dailyCount(){const n=history.filter(r=>r.day===localDay()).length;$('#daily-count').textContent=n;$('#daily-note').textContent=n?'오늘도 말씀과 가까워졌어요':'작은 시작이 쌓이는 하루';}
function pool(){return data[mode==='long'?'long':'short'].filter(p=>$('#book').value==='all'||p.book===$('#book').value);}
function updateBooks(){const s=$('#book');s.replaceChildren(new Option('모든 말씀','all'));[...new Set(data[mode==='long'?'long':'short'].map(p=>p.book))].forEach(b=>s.add(new Option(b,b)));s.disabled=mode==='today';}
function pick(){const items=pool();if(mode==='today')return data.short[dailyIndex(localDay(),data.short.length)];const others=items.filter(p=>p.id!==passage?.id),choices=others.length?others:items;return choices[Math.floor(Math.random()*choices.length)];}
function current(){return lines[lineIndex];}
function reset(p=passage,focus=false){
 clearTimeout(autoTimer);passage=p;started=0;stoppedTime=0;finished=false;composing=false;previous='';attempts=0;correctAttempts=0;lineIndex=0;
 const width=globalThis.innerWidth||1440;
 const available=$('.reading-area').clientWidth||Math.max(220,width-(width<=650?64:width<=1100?116:196));
 const font=width>=1700?30:width<=650?22:width<=1100?25:27;
 lines=splitLines(p.text,Math.max(8,Math.min(42,Math.floor((available-(width<=650?28:60))/font))));
 $('#typing').disabled=false;$('#complete').disabled=false;$('#message').textContent='';$('#reference').textContent=p.ref;$('#passage-title').textContent=p.title;$('#passage-title').hidden=!p.title;
 $('#total-count').textContent=p.text.length;$('#mode-label').textContent={today:'오늘의 말씀',short:'단문 연습',long:'장문 연습'}[mode];
 $('#passage-count').textContent=mode==='today'?'매일 만나는 한 구절':`${pool().length}편 · ${p.verses}개 절`;
 $('#next').textContent=mode==='today'?'단문 더 연습 →':'다른 말씀 →';showLine(focus);stats();
}
function showLine(focus=true){
 previous='';$('#typing').value='';$('#typing').maxLength=current().text.length+10;$('#typing').placeholder='위의 말씀을 한 줄씩 입력해 주세요.';
 $('#previous-line').textContent=lineIndex?lines[lineIndex-1].text:' ';$('#upcoming-line').textContent=lines[lineIndex+1]?.text||' ';
 $('#line-position').textContent=`${lineIndex+1} / ${lines.length}줄`;$('#complete').innerHTML=lineIndex===lines.length-1?'연습 완료 <span>↵</span>':'다음 줄 <span>↵</span>';
 $('#input-hint').textContent='현재 줄의 마지막 글자까지 입력해 주세요';render();if(focus)$('#typing').focus();
}
function render(){
 const value=$('#typing').value,frag=document.createDocumentFragment();
 [...current().text].forEach((c,i)=>{const span=document.createElement('span');span.textContent=c;if(i<value.length)span.className=composing&&i===value.length-1?'composing':c===value[i]?'correct':'wrong';else if(i===value.length)span.className='cursor';frag.append(span);});$('#target').replaceChildren(frag);
 const typed=current().start+Math.min(value.length,current().text.length);$('#typed-count').textContent=typed;
 const progress=Math.min(100,Math.round(typed/passage.text.length*100));$('#progress').style.width=progress+'%';$('.progress-track').setAttribute('aria-valuenow',progress);
}
function seconds(){return started?(stoppedTime||performance.now()-started)/1000:0;}
function stats(){
 const value=$('#typing').value,good=passage?passage.text.slice(0,current().start)+[...value].filter((c,i)=>c===current().text[i]).join(''):'';
 const sec=seconds(),speed=sec>=1?Math.round(keyCount(good)*60/sec):0,accuracy=attempts?Math.round(correctAttempts/attempts*100):100;
 $('#speed').textContent=speed;$('#accuracy').textContent=accuracy;$('#elapsed').textContent=clock(sec);return {speed,accuracy,seconds:Math.round(sec)};
}
function begin(){if(!started&&!finished)started=performance.now();}
function commit(){
 if(finished||!passage)return;
 const value=$('#typing').value,d=changedInput(previous,value,current().text);attempts+=d.attempts;correctAttempts+=d.correct;previous=value;render();stats();clearTimeout(autoTimer);
 if(!composing&&value===current().text){const activeLine=current();autoTimer=setTimeout(()=>{if(!composing&&!finished&&current()===activeLine&&$('#typing').value===activeLine.text)complete();},0);}
}
$('#typing').addEventListener('compositionstart',()=>{clearTimeout(autoTimer);composing=true;begin();});$('#typing').addEventListener('compositionend',()=>{composing=false;commit();});$('#typing').addEventListener('input',()=>{begin();if(!composing)commit();else render();});
$('#typing').addEventListener('paste',e=>{e.preventDefault();$('#message').textContent='직접 한 글자씩 입력하며 말씀을 연습해 주세요.';});$('#typing').addEventListener('drop',e=>e.preventDefault());
$('#typing').addEventListener('keydown',e=>{if(e.key==='Enter'){if(e.isComposing||composing||e.keyCode===229)return;e.preventDefault();complete();}});
function complete(){
 if(composing||finished||!passage)return;commit();clearTimeout(autoTimer);
 if($('#typing').value!==current().text){$('#message').textContent=$('#typing').value.length<current().text.length?'아직 이 줄에 말씀이 남아 있어요. 마지막 글자까지 입력해 주세요.':'붉게 표시된 글자와 띄어쓰기를 확인해 주세요.';$('#typing').focus();return;}
 $('#message').textContent='';if(lineIndex<lines.length-1){lineIndex++;showLine();stats();return;}
 stoppedTime=performance.now()-started;finished=true;$('#typing').disabled=true;$('#complete').disabled=true;
 const result={...stats(),ref:passage.ref,day:localDay(),mode};history.unshift(result);history=history.slice(0,50);let stored=true;try{localStorage.setItem('word-type-records',JSON.stringify(history));}catch{stored=false;}
 dailyCount();$('#result-ref').textContent=passage.ref;$('#result-speed').textContent=result.speed+'타';$('#result-accuracy').textContent=result.accuracy+'%';$('#result-time').textContent=clock(result.seconds);$('.result-note').textContent=stored?'한 줄 한 줄, 말씀을 끝까지 담았어요.':'브라우저 저장 공간을 사용할 수 없어 이번 기록은 현재 화면에만 남습니다.';$('#result-dialog').showModal();
}
function setMode(next,focus=false){mode=next;document.querySelectorAll('.tab').forEach(t=>{const active=t.dataset.mode===mode;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));});updateBooks();reset(pick(),focus);}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{if(data)setMode(t.dataset.mode);});$('#book').onchange=()=>reset(pick());$('#restart').onclick=()=>{if(passage)reset(passage,true);};
function next(){if(!data)return;if(mode==='today')setMode('short',true);else reset(pick(),true);}$('#next').onclick=next;$('#complete').onclick=complete;$('#result-next').onclick=()=>{$('#result-dialog').close();next();};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
$('#records').onclick=()=>{const list=$('#record-list');list.replaceChildren();if(!history.length){const p=document.createElement('p');p.className='empty';p.textContent='아직 연습 기록이 없어요. 첫 말씀을 완주해 보세요.';list.append(p);}history.forEach(r=>{const row=document.createElement('div');row.className='record-row';const details=document.createElement('div'),ref=document.createElement('span'),day=document.createElement('small'),score=document.createElement('span');ref.textContent=r.ref;day.textContent=r.day+' · '+({today:'오늘의 말씀',short:'단문',long:'장문'}[r.mode]||'연습');details.append(ref,day);score.textContent=`${r.speed}타 · ${r.accuracy}% · ${clock(r.seconds)}`;row.append(details,score);list.append(row);});$('#records-dialog').showModal();};
setInterval(()=>{if(started&&!finished)stats();},250);dailyCount();
try{const response=await fetch('./passages.json');if(!response.ok)throw Error(response.status);data=await response.json();setMode('today');}catch(e){$('#reference').textContent='말씀을 불러오지 못했어요';$('#target').textContent='인터넷 연결을 확인한 뒤 새로고침해 주세요.';$('#message').textContent='연결이 돌아오면 다시 시도할 수 있어요.';}
