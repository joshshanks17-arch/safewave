
const tracks=[
 {title:"Coastal Drift",artist:"SafeWave",src:"assets/audio/coastal-drift.wav",cover:"cover-ocean"},
 {title:"Neon Sunrise",artist:"Nova Lane",src:"assets/audio/neon-sunrise.wav",cover:"cover-neon"},
 {title:"Quiet Horizon",artist:"SafeWave AI Lab",src:"assets/audio/quiet-horizon.wav",cover:"cover-horizon"}
];
let current=0;
let queue=JSON.parse(localStorage.getItem("safewaveQueue")||"[]");
let favorites=JSON.parse(localStorage.getItem("safewaveFavorites")||"[]");
const audio=document.querySelector("#audio"),playBtn=document.querySelector("#playBtn"),
title=document.querySelector("#playerTitle"),artist=document.querySelector("#playerArtist"),
progress=document.querySelector("#progress"),currentTime=document.querySelector("#currentTime"),
duration=document.querySelector("#duration"),thumb=document.querySelector(".player-thumb");
const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`:"0:00";

function toast(message){
 const el=document.querySelector("#toast"); if(!el)return;
 el.textContent=message; el.classList.add("show");
 clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove("show"),1800);
}
function loadTrack(i,autoplay=false){
 if(!audio)return;
 current=(i+tracks.length)%tracks.length;
 const t=tracks[current];
 audio.src=t.src;
 if(title)title.textContent=t.title;
 if(artist)artist.textContent=t.artist;
 if(thumb)thumb.className=`player-thumb ${t.cover}`;
 if(autoplay)audio.play().catch(()=>{});
}
function togglePlay(){if(!audio)return;if(!audio.src)loadTrack(current);audio.paused?audio.play():audio.pause()}
function playNext(){
 if(queue.length){
   const next=queue.shift(); saveQueue(); loadTrack(next,true);
 }else loadTrack(current+1,true);
}
if(audio){
 loadTrack(0);audio.volume=.75;
 audio.addEventListener("play",()=>{if(playBtn)playBtn.textContent="Ⅱ"});
 audio.addEventListener("pause",()=>{if(playBtn)playBtn.textContent="▶"});
 audio.addEventListener("timeupdate",()=>{if(progress)progress.value=audio.duration?(audio.currentTime/audio.duration)*100:0;if(currentTime)currentTime.textContent=fmt(audio.currentTime)});
 audio.addEventListener("loadedmetadata",()=>{if(duration)duration.textContent=fmt(audio.duration)});
 audio.addEventListener("ended",playNext);
}
playBtn?.addEventListener("click",togglePlay);
document.querySelector("#prevBtn")?.addEventListener("click",()=>loadTrack(current-1,true));
document.querySelector("#nextBtn")?.addEventListener("click",playNext);
progress?.addEventListener("input",()=>{if(audio.duration)audio.currentTime=(progress.value/100)*audio.duration});
document.querySelector("#volume")?.addEventListener("input",e=>audio.volume=e.target.value);
document.querySelectorAll("[data-track]").forEach(btn=>btn.addEventListener("click",()=>loadTrack(Number(btn.dataset.track),true)));
document.querySelector("[data-play-featured]")?.addEventListener("click",()=>loadTrack(0,true));
document.querySelector(".menu-button")?.addEventListener("click",()=>document.querySelector(".nav-links")?.classList.toggle("open"));

const search=document.querySelector("#trackSearch"),rows=[...document.querySelectorAll(".music-row")];
search?.addEventListener("input",()=>{const q=search.value.toLowerCase();rows.forEach(r=>r.style.display=r.dataset.name.includes(q)?"grid":"none")});
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
 const f=btn.dataset.filter;rows.forEach(r=>r.style.display=(f==="all"||r.dataset.name.includes(f))?"grid":"none");
}));
document.querySelectorAll("[data-download]").forEach(btn=>btn.addEventListener("click",()=>{
 const a=document.createElement("a");a.href=btn.dataset.download;a.download=btn.dataset.download.split("/").pop();a.click();toast("Download started");
}));

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
renderQueue();renderFavorites();
