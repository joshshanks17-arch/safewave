
const tracks=[
 {title:"Coastal Drift",artist:"SafeWave",src:"assets/audio/coastal-drift.wav",cover:"cover-ocean",genre:"lo-fi"},
 {title:"Neon Sunrise",artist:"Nova Lane",src:"assets/audio/neon-sunrise.wav",cover:"cover-neon",genre:"electronic"},
 {title:"Quiet Horizon",artist:"SafeWave AI Lab",src:"assets/audio/quiet-horizon.wav",cover:"cover-horizon",genre:"ambient"}
];

let current=Number(localStorage.getItem("safewaveCurrent")||0);
let queue=JSON.parse(localStorage.getItem("safewaveQueue")||"[]");
let favorites=JSON.parse(localStorage.getItem("safewaveFavorites")||"[]");
let recently=JSON.parse(localStorage.getItem("safewaveRecently")||"[]");
let shuffle=localStorage.getItem("safewaveShuffle")==="true";
let repeat=localStorage.getItem("safewaveRepeat")||"off";

const audio=document.querySelector("#audio");
const playBtn=document.querySelector("#playBtn");
const title=document.querySelector("#playerTitle");
const artist=document.querySelector("#playerArtist");
const progress=document.querySelector("#progress");
const currentTime=document.querySelector("#currentTime");
const duration=document.querySelector("#duration");
const thumb=document.querySelector(".player-thumb");
const player=document.querySelector("#player");

const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`:"0:00";

function toast(message){
 const el=document.querySelector("#toast"); if(!el)return;
 el.textContent=message; el.classList.add("show");
 clearTimeout(window.toastTimer);
 window.toastTimer=setTimeout(()=>el.classList.remove("show"),1800);
}

function rememberTrack(i){
 recently=[i,...recently.filter(x=>x!==i)].slice(0,6);
 localStorage.setItem("safewaveRecently",JSON.stringify(recently));
 renderRecently();
}

function loadTrack(i,autoplay=false,restoreTime=false){
 if(!audio)return;
 current=(i+tracks.length)%tracks.length;
 const t=tracks[current];
 audio.src=t.src;
 localStorage.setItem("safewaveCurrent",String(current));
 if(title)title.textContent=t.title;
 if(artist)artist.textContent=t.artist;
 if(thumb)thumb.className=`player-thumb ${t.cover}`;
 document.querySelector(".now-playing-art")?.classList.toggle("playing",autoplay);
 audio.addEventListener("loadedmetadata",()=>{
   if(restoreTime){
     const saved=Number(sessionStorage.getItem("safewaveTime")||0);
     if(saved<audio.duration) audio.currentTime=saved;
   }
 },{once:true});
 rememberTrack(current);
 if(autoplay) audio.play().catch(()=>{});
}

function togglePlay(){
 if(!audio)return;
 if(!audio.src)loadTrack(current);
 audio.paused?audio.play().catch(()=>{}):audio.pause();
}

function chooseNext(){
 if(repeat==="one") return current;
 if(queue.length){
   const next=queue.shift(); saveQueue(); return next;
 }
 if(shuffle){
   if(tracks.length===1)return current;
   let next=current;
   while(next===current)next=Math.floor(Math.random()*tracks.length);
   return next;
 }
 return (current+1)%tracks.length;
}

function playNext(){loadTrack(chooseNext(),true)}
function playPrevious(){loadTrack((current-1+tracks.length)%tracks.length,true)}

if(audio){
 loadTrack(current,false,true);
 audio.volume=Number(localStorage.getItem("safewaveVolume")||.75);
 const volume=document.querySelector("#volume"); if(volume)volume.value=audio.volume;

 audio.addEventListener("play",()=>{
   if(playBtn)playBtn.textContent="Ⅱ";
   document.querySelector(".now-playing-art")?.classList.add("playing");
 });
 audio.addEventListener("pause",()=>{
   if(playBtn)playBtn.textContent="▶";
   document.querySelector(".now-playing-art")?.classList.remove("playing");
 });
 audio.addEventListener("timeupdate",()=>{
   if(progress)progress.value=audio.duration?(audio.currentTime/audio.duration)*100:0;
   if(currentTime)currentTime.textContent=fmt(audio.currentTime);
   sessionStorage.setItem("safewaveTime",String(audio.currentTime));
 });
 audio.addEventListener("loadedmetadata",()=>{if(duration)duration.textContent=fmt(audio.duration)});
 audio.addEventListener("ended",playNext);
}

playBtn?.addEventListener("click",togglePlay);
document.querySelector("#prevBtn")?.addEventListener("click",playPrevious);
document.querySelector("#nextBtn")?.addEventListener("click",playNext);
progress?.addEventListener("input",()=>{if(audio.duration)audio.currentTime=(progress.value/100)*audio.duration});
document.querySelector("#volume")?.addEventListener("input",e=>{
 audio.volume=e.target.value;
 localStorage.setItem("safewaveVolume",String(e.target.value));
});

document.querySelectorAll("[data-track]").forEach(btn=>btn.addEventListener("click",()=>loadTrack(Number(btn.dataset.track),true)));
document.querySelector(".menu-button")?.addEventListener("click",()=>document.querySelector(".nav-links")?.classList.toggle("open"));

const shuffleBtn=document.querySelector("#shuffleBtn");
const repeatBtn=document.querySelector("#repeatBtn");
function renderModes(){
 shuffleBtn?.classList.toggle("active",shuffle);
 repeatBtn?.classList.toggle("active",repeat!=="off");
 if(repeatBtn)repeatBtn.textContent=repeat==="one"?"↻¹":"↻";
}
shuffleBtn?.addEventListener("click",()=>{
 shuffle=!shuffle; localStorage.setItem("safewaveShuffle",String(shuffle));
 renderModes(); toast(shuffle?"Shuffle on":"Shuffle off");
});
repeatBtn?.addEventListener("click",()=>{
 repeat=repeat==="off"?"all":repeat==="all"?"one":"off";
 localStorage.setItem("safewaveRepeat",repeat);
 renderModes(); toast(repeat==="off"?"Repeat off":repeat==="one"?"Repeat one":"Repeat all");
});
renderModes();

function saveQueue(){localStorage.setItem("safewaveQueue",JSON.stringify(queue));renderQueue()}
function addQueue(i){queue.push(i);saveQueue();toast(`${tracks[i].title} added to queue`)}
function renderQueue(){
 const list=document.querySelector("#queueList"),count=document.querySelector("#queueCount");
 if(count)count.textContent=queue.length;
 if(!list)return;
 if(!queue.length){list.innerHTML='<p class="empty-queue">Your queue is empty.</p>';return}
 list.innerHTML=queue.map((i,pos)=>`<div class="queue-item"><div class="queue-item-cover ${tracks[i].cover}"></div><div><strong>${tracks[i].title}</strong><small>${tracks[i].artist}</small></div><button data-remove-queue="${pos}">×</button></div>`).join("");
 list.querySelectorAll("[data-remove-queue]").forEach(btn=>btn.addEventListener("click",()=>{queue.splice(Number(btn.dataset.removeQueue),1);saveQueue()}));
}
document.querySelectorAll("[data-queue]").forEach(btn=>btn.addEventListener("click",()=>addQueue(Number(btn.dataset.queue))));
document.querySelector("#openQueue")?.addEventListener("click",()=>document.querySelector("#queueDrawer")?.classList.add("open"));
document.querySelector("#closeQueue")?.addEventListener("click",()=>document.querySelector("#queueDrawer")?.classList.remove("open"));
document.querySelector("#clearQueue")?.addEventListener("click",()=>{queue=[];saveQueue();toast("Queue cleared")});

function saveFavorites(){localStorage.setItem("safewaveFavorites",JSON.stringify(favorites));renderFavorites()}
function toggleFavorite(i){
 favorites=favorites.includes(i)?favorites.filter(x=>x!==i):[...favorites,i];
 saveFavorites();toast(favorites.includes(i)?"Added to favorites":"Removed from favorites");
}
function renderFavorites(){
 document.querySelectorAll("[data-favorite]").forEach(btn=>{
   const active=favorites.includes(Number(btn.dataset.favorite));
   btn.classList.toggle("active",active);btn.textContent=active?"♥":"♡";
 });
}
document.querySelectorAll("[data-favorite]").forEach(btn=>btn.addEventListener("click",()=>toggleFavorite(Number(btn.dataset.favorite))));

document.querySelectorAll("[data-download]").forEach(btn=>btn.addEventListener("click",()=>{
 const a=document.createElement("a");a.href=btn.dataset.download;a.download=btn.dataset.download.split("/").pop();a.click();toast("Download started");
}));

const search=document.querySelector("#trackSearch");
const rows=[...document.querySelectorAll(".music-row")];
function applySearch(q=""){
 const text=q.toLowerCase();
 rows.forEach(r=>r.style.display=r.dataset.name.includes(text)?"grid":"none");
}
search?.addEventListener("input",()=>applySearch(search.value));

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
 const f=btn.dataset.filter;
 rows.forEach(r=>r.style.display=(f==="all"||r.dataset.name.includes(f))?"grid":"none");
}));

document.querySelector("#heroSearch")?.addEventListener("submit",e=>{
 e.preventDefault();
 const q=document.querySelector("#heroSearchInput")?.value||"";
 location.hash="#browse";
 setTimeout(()=>{if(search){search.value=q;applySearch(q);search.focus()}},0);
});

function renderRecently(){
 const section=document.querySelector("#recentlySection"),grid=document.querySelector("#recentlyGrid");
 if(!section||!grid)return;
 section.hidden=!recently.length;
 grid.innerHTML=recently.map(i=>`<article class="recent-item"><div class="recent-cover ${tracks[i].cover}"></div><div><strong>${tracks[i].title}</strong><small>${tracks[i].artist}</small></div><button data-recent-play="${i}">▶</button></article>`).join("");
 grid.querySelectorAll("[data-recent-play]").forEach(btn=>btn.addEventListener("click",()=>loadTrack(Number(btn.dataset.recentPlay),true)));
}

function route(){
 const raw=(location.hash||"#home").slice(1);
 const [page,query=""]=raw.split("?");
 const view=page==="browse"?"browse":"home";
 document.querySelectorAll(".app-view").forEach(v=>v.classList.toggle("active",v.dataset.view===view));
 document.querySelectorAll(".nav-links .route-link").forEach(a=>a.classList.toggle("route-active",a.getAttribute("href")===`#${view}`));
 document.querySelector(".nav-links")?.classList.remove("open");
 if(view==="browse"){
   const params=new URLSearchParams(query);
   const genre=params.get("genre");
   if(genre){
     document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===genre));
     rows.forEach(r=>r.style.display=r.dataset.name.includes(genre)?"grid":"none");
   }
 }
 window.scrollTo({top:0,behavior:"smooth"});
}
window.addEventListener("hashchange",route);
route();

document.querySelector("#playerCollapse")?.addEventListener("click",()=>{
 player?.classList.toggle("minimized");
 document.body.classList.toggle("player-minimized",player?.classList.contains("minimized"));
});

document.addEventListener("keydown",e=>{
 if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
 if(e.code==="Space"){e.preventDefault();togglePlay()}
 if(e.code==="ArrowRight"&&e.altKey)playNext();
 if(e.code==="ArrowLeft"&&e.altKey)playPrevious();
});

renderQueue();
renderFavorites();
renderRecently();
