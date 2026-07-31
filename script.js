
const tracks=[
 {title:"Coastal Drift",artist:"SafeWave",src:"assets/audio/coastal-drift-studio.wav",cover:"assets/covers/coastal-drift.svg",genre:"Lo-Fi",bpm:86,mood:"Calm",tags:["Lo-Fi","Calm","Focus","Travel"],description:"Warm textures, soft movement, and an easy coastal pulse designed for study sessions, travel edits, lifestyle videos, and reflective storytelling."},
 {title:"Neon Sunrise",artist:"Nova Lane",src:"assets/audio/neon-sunrise-studio.wav",cover:"assets/covers/neon-sunrise.svg",genre:"Electronic",bpm:108,mood:"Energy",tags:["Electronic","Upbeat","Gaming","Stream"],description:"Bright synth energy and forward motion for gaming content, livestreams, technology videos, city edits, and upbeat creator intros."},
 {title:"Quiet Horizon",artist:"SafeWave AI Lab",src:"assets/audio/quiet-horizon-studio.wav",cover:"assets/covers/quiet-horizon.svg",genre:"Ambient",bpm:74,mood:"Dreamy",tags:["Ambient","Dreamy","Cinematic","Sleep"],description:"A spacious, cinematic ambient piece for documentaries, nighttime visuals, meditation, emotional transitions, and moments that need room to breathe."}
];
let current=Number(localStorage.getItem("swCurrent")||0),queue=JSON.parse(localStorage.getItem("swQueue")||"[]"),favorites=JSON.parse(localStorage.getItem("swFavorites")||"[]"),shuffle=localStorage.getItem("swShuffle")==="true",repeat=localStorage.getItem("swRepeat")||"off",modalIndex=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const audio=$("#audio"),playBtn=$("#playBtn"),progress=$("#progress"),volume=$("#volume"),heroVisualizer=$("#heroVisualizer");
const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`:"0:00";
function toast(msg){const e=$("#toast");e.textContent=msg;e.classList.add("show");clearTimeout(window.swToast);window.swToast=setTimeout(()=>e.classList.remove("show"),1700)}
function renderCurrent(){
 const t=tracks[current];$("#playerTitle").textContent=t.title;$("#playerArtist").textContent=t.artist;$("#playerCover").style.backgroundImage=`url('${t.cover}')`;
 $("#fullscreenTitle").textContent=t.title;$("#fullscreenArtist").textContent=t.artist;$("#fullscreenArt").style.backgroundImage=`url('${t.cover}')`;$("#fullscreenBg").style.backgroundImage=`url('${t.cover}')`;
 $("#favoriteCurrent").textContent=favorites.includes(current)?"♥":"♡";$("#favoriteCurrent").classList.toggle("active",favorites.includes(current));
}
function loadTrack(i,autoplay=true){current=(i+tracks.length)%tracks.length;localStorage.setItem("swCurrent",current);audio.src=tracks[current].src;renderCurrent();if(autoplay)audio.play().catch(()=>{});}
function togglePlay(){audio.paused?audio.play().catch(()=>{}):audio.pause()}
function nextIndex(){if(repeat==="one")return current;if(queue.length){const n=queue.shift();saveQueue();return n}if(shuffle){let n=current;while(n===current)n=Math.floor(Math.random()*tracks.length);return n}return(current+1)%tracks.length}
function next(){loadTrack(nextIndex())}function prev(){loadTrack(current-1)}
audio.volume=Number(localStorage.getItem("swVolume")||.75);volume.value=audio.volume;loadTrack(current,false);
audio.addEventListener("play",()=>{playBtn.textContent="Ⅱ";$("#fullPlay").textContent="Ⅱ";heroVisualizer?.classList.add("playing")});
audio.addEventListener("pause",()=>{playBtn.textContent="▶";$("#fullPlay").textContent="▶";heroVisualizer?.classList.remove("playing")});
audio.addEventListener("timeupdate",()=>{const p=audio.duration?audio.currentTime/audio.duration*100:0;progress.value=p;$("#fullProgress").value=p;$("#currentTime").textContent=fmt(audio.currentTime);$("#fullCurrent").textContent=fmt(audio.currentTime)});
audio.addEventListener("loadedmetadata",()=>{$("#duration").textContent=fmt(audio.duration);$("#fullDuration").textContent=fmt(audio.duration)});
audio.addEventListener("ended",next);
playBtn.onclick=togglePlay;$("#fullPlay").onclick=togglePlay;$("#prevBtn").onclick=prev;$("#nextBtn").onclick=next;$("#fullPrev").onclick=prev;$("#fullNext").onclick=next;
progress.oninput=e=>{if(audio.duration)audio.currentTime=e.target.value/100*audio.duration};$("#fullProgress").oninput=e=>{if(audio.duration)audio.currentTime=e.target.value/100*audio.duration};
volume.oninput=e=>{audio.volume=e.target.value;localStorage.setItem("swVolume",e.target.value)};
$$("[data-track]").forEach(b=>b.onclick=()=>loadTrack(Number(b.dataset.track)));
function renderModes(){$("#shuffleBtn").classList.toggle("active",shuffle);$("#repeatBtn").classList.toggle("active",repeat!=="off");$("#repeatBtn").textContent=repeat==="one"?"↻¹":"↻"}
$("#shuffleBtn").onclick=()=>{shuffle=!shuffle;localStorage.setItem("swShuffle",shuffle);renderModes();toast(shuffle?"Shuffle on":"Shuffle off")};
$("#repeatBtn").onclick=()=>{repeat=repeat==="off"?"all":repeat==="all"?"one":"off";localStorage.setItem("swRepeat",repeat);renderModes();toast(repeat==="off"?"Repeat off":repeat==="one"?"Repeat one":"Repeat all")};renderModes();
function saveFavorites(){localStorage.setItem("swFavorites",JSON.stringify(favorites));renderFavorites()}
function toggleFavorite(i){favorites=favorites.includes(i)?favorites.filter(x=>x!==i):[...favorites,i];saveFavorites();renderCurrent();toast(favorites.includes(i)?"Added to favorites":"Removed from favorites")}
function renderFavorites(){$$("[data-favorite]").forEach(b=>{const on=favorites.includes(Number(b.dataset.favorite));b.textContent=on?"♥":"♡";b.classList.toggle("active",on)})}
$$("[data-favorite]").forEach(b=>b.onclick=()=>toggleFavorite(Number(b.dataset.favorite)));$("#favoriteCurrent").onclick=()=>toggleFavorite(current);renderFavorites();
function saveQueue(){localStorage.setItem("swQueue",JSON.stringify(queue));renderQueue()}
function addQueue(i){queue.push(i);saveQueue();toast(`${tracks[i].title} added to queue`)}
function renderQueue(){const l=$("#queueList");$("#queueCount").textContent=queue.length;if(!queue.length){l.innerHTML='<p class="empty">Your queue is empty.</p>';return}l.innerHTML=queue.map((i,p)=>`<article class="queue-item"><div class="queue-item-art" style="background-image:url('${tracks[i].cover}')"></div><div><strong>${tracks[i].title}</strong><small>${tracks[i].artist}</small></div><button data-remove="${p}">×</button></article>`).join("");$$("[data-remove]").forEach(b=>b.onclick=()=>{queue.splice(Number(b.dataset.remove),1);saveQueue()})}
$$("[data-queue]").forEach(b=>b.onclick=()=>addQueue(Number(b.dataset.queue)));$("#openQueue").onclick=()=>$("#queueDrawer").classList.add("open");$("#closeQueue").onclick=()=>$("#queueDrawer").classList.remove("open");$("#clearQueue").onclick=()=>{queue=[];saveQueue();toast("Queue cleared")};renderQueue();
function route(){const raw=(location.hash||"#home").slice(1),[view,q=""]=raw.split("?");const v=view==="discover"?"discover":"home";$$(".view").forEach(e=>e.classList.toggle("active",e.dataset.view===v));$$(".desktop-nav .route-link").forEach(e=>e.classList.toggle("active",e.getAttribute("href")===`#${v}`));$("#mobileMenu").classList.remove("open");if(v==="discover"){const g=new URLSearchParams(q).get("genre");if(g)applyFilter(g)}window.scrollTo({top:0,behavior:"smooth"})}
window.addEventListener("hashchange",route);route();
$("#menuBtn").onclick=()=>$("#mobileMenu").classList.toggle("open");
$$("[data-route]").forEach(e=>e.onclick=()=>{location.hash=`#${e.dataset.route}?genre=${e.dataset.filterRoute||"all"}`});
const rows=$$(".catalog-row");function updateCount(){const n=rows.filter(r=>r.style.display!=="none").length;$("#resultCount").textContent=`${n} track${n===1?"":"s"}`}
function applyFilter(f){$$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===f));rows.forEach(r=>r.style.display=f==="all"||r.dataset.genre.toLowerCase()===f?"grid":"none");updateCount()}
$$(".filter").forEach(b=>b.onclick=()=>applyFilter(b.dataset.filter));
$("#trackSearch").oninput=e=>{const q=e.target.value.toLowerCase();rows.forEach(r=>r.style.display=r.dataset.name.includes(q)?"grid":"none");updateCount()};
$$("[data-search]").forEach(b=>b.onclick=()=>{location.hash="#discover";setTimeout(()=>{$("#trackSearch").value=b.dataset.search;$("#trackSearch").dispatchEvent(new Event("input"));$("#trackSearch").focus()},60)});
function openModal(i){modalIndex=i;const t=tracks[i];$("#modalArt").style.backgroundImage=`url('${t.cover}')`;$("#modalTitle").textContent=t.title;$("#modalArtist").textContent=`${t.artist} • ${t.genre} • ${t.bpm} BPM`;$("#modalTags").innerHTML=t.tags.map(x=>`<span>${x}</span>`).join("");$("#modalDescription").textContent=t.description;$("#modalDownload").href=t.src;$("#modalDownload").download=t.src.split("/").pop();$("#trackModal").classList.add("open")}
$$("[data-open-track]").forEach(b=>b.onclick=()=>openModal(Number(b.dataset.openTrack)));$("#modalClose").onclick=()=>$("#trackModal").classList.remove("open");$("#modalPlay").onclick=()=>{loadTrack(modalIndex);$("#trackModal").classList.remove("open")};$("#modalQueue").onclick=()=>addQueue(modalIndex);
$("#expandPlayer").onclick=()=>$("#fullscreenPlayer").classList.add("open");$("#fullscreenClose").onclick=()=>$("#fullscreenPlayer").classList.remove("open");
$("#playerCollapse").onclick=()=>$("#player").classList.toggle("minimized");
function renderCommand(q=""){const filtered=tracks.map((t,i)=>({t,i})).filter(({t})=>(t.title+" "+t.artist+" "+t.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));$("#commandResults").innerHTML=filtered.map(({t,i})=>`<article class="command-result"><div class="command-art" style="background-image:url('${t.cover}')"></div><div><strong>${t.title}</strong><small>${t.artist} • ${t.genre}</small></div><button data-command-play="${i}">▶</button></article>`).join("");$$("[data-command-play]").forEach(b=>b.onclick=()=>{loadTrack(Number(b.dataset.commandPlay));closeCommand()})}
function openCommand(){$("#commandSearch").classList.add("open");$("#commandInput").focus();renderCommand()}function closeCommand(){$("#commandSearch").classList.remove("open")}
$("#searchTrigger").onclick=openCommand;$("#commandClose").onclick=closeCommand;$("#commandInput").oninput=e=>renderCommand(e.target.value);$("#commandSearch").onclick=e=>{if(e.target===$("#commandSearch"))closeCommand()};
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openCommand()}if(e.key==="Escape"){closeCommand();$("#trackModal").classList.remove("open");$("#fullscreenPlayer").classList.remove("open")}if(e.code==="Space"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();togglePlay()}});
$$("[data-download]").forEach(b=>b.onclick=()=>{const a=document.createElement("a");a.href=b.dataset.download;a.download=b.dataset.download.split("/").pop();a.click();toast("Download started")});


// Wave 7 — Premium Platform
const collections={
 travel:[0,2,0,1],
 creator:[1,0,1,2],
 night:[2,1,2,0]
};
function renderActiveTrack(){
 document.body.dataset.themeTrack=String(current);
 document.querySelectorAll("[data-track-card],.catalog-row").forEach(el=>el.classList.remove("active-track"));
 document.querySelector(`[data-track-card="${current}"]`)?.classList.add("active-track");
 document.querySelectorAll(".catalog-row")[current]?.classList.add("active-track");
}
audio.addEventListener("play",renderActiveTrack);
audio.addEventListener("loadedmetadata",renderActiveTrack);
document.querySelectorAll("[data-collection]").forEach(btn=>btn.addEventListener("click",()=>{
 const list=collections[btn.dataset.collection]||[];
 queue.push(...list);saveQueue();toast("Collection added to queue");
}));
document.querySelectorAll("[data-collection-play]").forEach(btn=>btn.addEventListener("click",()=>{
 const list=collections[btn.dataset.collection]||[];
 if(!list.length)return;
 queue=[...list.slice(1),...queue];saveQueue();loadTrack(list[0],true);toast("Collection started");
}));
document.querySelectorAll("[data-smart-query]").forEach(btn=>btn.addEventListener("click",()=>{
 const q=btn.dataset.smartQuery;
 const search=document.querySelector("#trackSearch");
 if(search){search.value=q;search.dispatchEvent(new Event("input"));search.focus();}
}));
document.querySelector("#copyAttribution")?.addEventListener("click",async()=>{
 const t=tracks[modalIndex];
 const text=`Music: ${t.title} by ${t.artist} — Licensed via SafeWave`;
 try{await navigator.clipboard.writeText(text);toast("Attribution copied");}
 catch{toast("Copy unavailable on this browser");}
});
const originalLoadTrack=loadTrack;
loadTrack=function(i,autoplay=true){
 originalLoadTrack(i,autoplay);
 renderActiveTrack();
};
renderActiveTrack();
