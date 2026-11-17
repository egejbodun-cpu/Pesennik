const app=document.querySelector('#app');
const escapeHTML=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!location.pathname.endsWith('song.html')){
app.innerHTML=`<section class="hero"><div><h1>Песенник<br>Ширы и Эгея</h1><p>Знакомые мотивы, новые истории.<br>Выбери песню — и пой вместе с нами.</p></div><div class="cover"><img src="cover.jpg" alt="Обложка песенника Ширы и Эгея"></div></section><section><h2>Оглавление</h2><input type="search" id="search" placeholder="Название или слова песни…" aria-label="Поиск по названию и тексту песни"><div id="list"></div></section>`;
const normalizeSearch=text=>text.toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/\s+/g,' ').trim();
const searchText=new Map(songs.map(song=>[song,normalizeSearch(song.title+' '+song.verses.flat().join(' ').replace(/\[[^\]]+\]/g,''))]));
const list=document.querySelector('#list');function filter(){const q=normalizeSearch(document.querySelector('#search').value);const found=songs.filter(s=>searchText.get(s).includes(q));list.innerHTML=found.map(s=>`<a class="song-link" href="song.html?id=${encodeURIComponent(s.id)}"><span class="number">${String(songs.indexOf(s)+1).padStart(2,'0')}</span><span>${escapeHTML(s.title)}</span><span class="arrow" aria-hidden="true">↗</span></a>`).join('')||'<p class="empty">По вашему запросу песни не найдены.</p>';}document.querySelector('#search').addEventListener('input',filter);filter();
}else{
const song=songs.find(s=>s.id===new URLSearchParams(location.search).get('id'));
if(!song){app.innerHTML='<h1>Песня не найдена</h1><a href="index.html">К оглавлению →</a>';}else{
document.title=song.title+' — Песенник Ширы и Эгея';let shift=0,playing=false,last=0,position=window.scrollY,frame;
const notes=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];const flats={Db:1,Eb:3,Gb:6,Ab:8,Bb:10};
function transpose(chord){if(!shift)return chord;return chord.replace(/([A-G])([#b]?)/g,(_,n,a)=>{let i=flats[n+a]??notes.indexOf(n+a);return notes[(i+shift+24)%12];});}
app.innerHTML=`<a class="back" href="index.html">← Оглавление</a><h1 class="song-title">${escapeHTML(song.title)}</h1><p class="note">${escapeHTML(song.note||'')}</p><div id="verses" class="verses"></div>${song.audio?`<audio controls preload="none" aria-label="Аудиозапись песни" src="${song.audio}"></audio>`:''}<div class="toolbar" role="region" aria-label="Управление песней"><div class="group"><span class="label">Тональность</span><button id="minus" aria-label="Понизить на полтона">−</button><span id="shift" aria-live="polite">0</span><button id="plus" aria-label="Повысить на полтона">+</button><button id="reset" aria-label="Исходная тональность">Сброс</button></div><div class="group"><button id="play" aria-pressed="false">▶ Прокрутка</button><input id="speed" type="range" min="5" max="80" value="25" aria-label="Скорость прокрутки"><output for="speed" id="speed-label">25 пкс/с</output></div></div>`;
function renderLine(line){
 const tokens=line.split(/(\[[^\]]+\])/);let pending='',color='',html='';
 const paint=text=>color?'<span style="color:'+color+'">'+text+'</span>':text;
 for(const token of tokens){
  const colorTag=token.match(/^\[color=(pink|orange|#[0-9a-fA-F]{6})\]$/);
  if(colorTag){color=['pink','orange'].includes(colorTag[1])?'var(--character-'+colorTag[1]+')':colorTag[1];continue;}
  if(token==='[/color]'){color='';continue;}
  if(/^\[[^\]]+\]$/.test(token)){pending=transpose(token.slice(1,-1));continue;}
  for(const char of token){
   if(pending){html+='<span class="anchor"><span class="chord">'+escapeHTML(pending)+'</span>'+paint(escapeHTML(char))+'</span>';pending='';}
   else html+=char===' '?'\u0001':paint(escapeHTML(char));
  }
 }
 if(pending)html+='<span class="anchor"><span class="chord">'+escapeHTML(pending)+'</span>&nbsp;</span>';
 return '<div class="lyric-line">'+html.split('\u0001').map(word=>'<span class="word">'+word+'</span>').join(' ')+'</div>';
}
function render(){document.querySelector('#verses').innerHTML=song.verses.map(verse=>'<section class="verse">'+verse.map(renderLine).join('')+'</section>').join('');document.querySelector('#shift').textContent=shift>0?'+'+shift:String(shift);}
document.querySelector('#minus').onclick=()=>{shift=Math.max(-12,shift-1);render();};document.querySelector('#plus').onclick=()=>{shift=Math.min(12,shift+1);render();};document.querySelector('#reset').onclick=()=>{shift=0;render();};render();
const play=document.querySelector('#play'),speed=document.querySelector('#speed');speed.oninput=()=>document.querySelector('#speed-label').textContent=speed.value+' пкс/с';
function stop(){playing=false;cancelAnimationFrame(frame);play.textContent='▶ Прокрутка';play.setAttribute('aria-pressed','false');}
function tick(t){if(!playing)return;if(last){position+=Math.min(t-last,100)/1000*Number(speed.value);window.scrollTo(0,position);}last=t;if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2){stop();return;}frame=requestAnimationFrame(tick);}
play.onclick=()=>{if(playing){stop();return;}playing=true;last=0;position=window.scrollY;play.textContent='Ⅱ Пауза';play.setAttribute('aria-pressed','true');frame=requestAnimationFrame(tick);};
window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',e=>{if(!e.target.closest('.toolbar'))stop();},{passive:true});window.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)&&!e.target.closest('.toolbar'))stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
}}




