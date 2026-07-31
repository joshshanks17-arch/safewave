
const tracks=[
 {title:"Coastal Drift",artist:"SafeWave",src:"assets/audio/coastal-drift-studio.wav",cover:"assets/covers/coastal-drift.svg",genre:"Lo-Fi",bpm:86,mood:"Calm",tags:["Lo-Fi","Calm","Focus","Travel"],description:"Warm textures, soft movement, and an easy coastal pulse designed for study sessions, travel edits, lifestyle videos, and reflective storytelling."},
 {title:"Neon Sunrise",artist:"Nova Lane",src:"assets/audio/neon-sunrise-studio.wav",cover:"assets/covers/neon-sunrise.svg",genre:"Electronic",bpm:108,mood:"Energy",tags:["Electronic","Upbeat","Gaming","Stream"],description:"Bright synth energy and forward motion for gaming content, livestreams, technology videos, city edits, and upbeat creator intros."},
 {title:"Quiet Horizon",artist:"SafeWave AI Lab",src:"assets/audio/quiet-horizon-studio.wav",cover:"assets/covers/quiet-horizon.svg",genre:"Ambient",bpm:74,mood:"Dreamy",tags:["Ambient","Dreamy","Cinematic","Sleep"],description:"A spacious, cinematic ambient piece for documentaries, nighttime visuals, meditation, emotional transitions, and moments that need room to breathe."},
 {title:"Golden Hour Drive",artist:"SafeWave Originals",src:"assets/audio/golden-hour-drive.wav",cover:"assets/covers/golden-hour-drive.svg",genre:"Acoustic",bpm:96,mood:"Uplifting",tags:["Acoustic","Travel","Warm","Road Trip"],description:"A bright road-trip instrumental with warm harmony, steady motion, and an optimistic melody for travel films, lifestyle content, and brand stories."},
 {title:"Apex Rising",artist:"SafeWave Originals",src:"assets/audio/apex-rising.wav",cover:"assets/covers/apex-rising.svg",genre:"Cinematic",bpm:124,mood:"Epic",tags:["Cinematic","Epic","Trailer","Intense"],description:"A driving cinematic cue with rising harmony, bold percussion, and heroic melodic movement for trailers, reveals, sports, and dramatic edits."},
 {title:"Digital Rain",artist:"Nova Lane",src:"assets/audio/digital-rain.wav",cover:"assets/covers/digital-rain.svg",genre:"Electronic",bpm:102,mood:"Atmospheric",tags:["Electronic","Technology","Night","Cyberpunk"],description:"Atmospheric electronic motion with a clean digital pulse for technology videos, nighttime city footage, game streams, and futuristic storytelling."}
];
let history=JSON.parse(localStorage.getItem("swHistory")||"[]"),playlists=JSON.parse(localStorage.getItem("swPlaylists")||"[]"),current=Number(localStorage.getItem("swCurrent")||0),queue=JSON.parse(localStorage.getItem("swQueue")||"[]"),favorites=JSON.parse(localStorage.getItem("swFavorites")||"[]"),shuffle=localStorage.getItem("swShuffle")==="true",repeat=localStorage.getItem("swRepeat")||"off",modalIndex=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const audio=$("#audio"),playBtn=$("#playBtn"),progress=$("#progress"),volume=$("#volume"),heroVisualizer=$("#heroVisualizer");
const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`:"0:00";
function toast(msg){const e=$("#toast");e.textContent=msg;e.classList.add("show");clearTimeout(window.swToast);window.swToast=setTimeout(()=>e.classList.remove("show"),1700)}
function renderCurrent(){
 const t=tracks[current];$("#playerTitle").textContent=t.title;$("#playerArtist").textContent=t.artist;$("#playerCover").style.backgroundImage=`url('${t.cover}')`;
 $("#fullscreenTitle").textContent=t.title;$("#fullscreenArtist").textContent=t.artist;$("#fullscreenArt").style.backgroundImage=`url('${t.cover}')`;$("#fullscreenBg").style.backgroundImage=`url('${t.cover}')`;
 $("#favoriteCurrent").textContent=favorites.includes(current)?"♥":"♡";$("#favoriteCurrent").classList.toggle("active",favorites.includes(current));
}
function loadTrack(i,autoplay=true){current=(i+tracks.length)%tracks.length;localStorage.setItem("swCurrent",current);audio.src=tracks[current].src;history=[current,...history.filter(x=>x!==current)].slice(0,20);localStorage.setItem("swHistory",JSON.stringify(history));renderCurrent();renderLibrary();if(autoplay)audio.play().catch(()=>{});}
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
function saveFavorites(){localStorage.setItem("swFavorites",JSON.stringify(favorites));renderFavorites();renderLibrary()}
function toggleFavorite(i){favorites=favorites.includes(i)?favorites.filter(x=>x!==i):[...favorites,i];saveFavorites();renderCurrent();toast(favorites.includes(i)?"Added to favorites":"Removed from favorites")}
function renderFavorites(){$$("[data-favorite]").forEach(b=>{const on=favorites.includes(Number(b.dataset.favorite));b.textContent=on?"♥":"♡";b.classList.toggle("active",on)})}
$$("[data-favorite]").forEach(b=>b.onclick=()=>toggleFavorite(Number(b.dataset.favorite)));$("#favoriteCurrent").onclick=()=>toggleFavorite(current);renderFavorites();
function saveQueue(){localStorage.setItem("swQueue",JSON.stringify(queue));renderQueue()}
function addQueue(i){queue.push(i);saveQueue();toast(`${tracks[i].title} added to queue`)}
function renderQueue(){const l=$("#queueList");$("#queueCount").textContent=queue.length;if(!queue.length){l.innerHTML='<p class="empty">Your queue is empty.</p>';return}l.innerHTML=queue.map((i,p)=>`<article class="queue-item"><div class="queue-item-art" style="background-image:url('${tracks[i].cover}')"></div><div><strong>${tracks[i].title}</strong><small>${tracks[i].artist}</small></div><button data-remove="${p}">×</button></article>`).join("");$$("[data-remove]").forEach(b=>b.onclick=()=>{queue.splice(Number(b.dataset.remove),1);saveQueue()})}
$$("[data-queue]").forEach(b=>b.onclick=()=>addQueue(Number(b.dataset.queue)));$("#openQueue").onclick=()=>$("#queueDrawer").classList.add("open");$("#closeQueue").onclick=()=>$("#queueDrawer").classList.remove("open");$("#clearQueue").onclick=()=>{queue=[];saveQueue();toast("Queue cleared")};renderQueue();
function route(){const raw=(location.hash||"#home").slice(1),[view,q=""]=raw.split("?");const v=["discover","library"].includes(view)?view:"home";$$(".view").forEach(e=>e.classList.toggle("active",e.dataset.view===v));$$(".desktop-nav .route-link").forEach(e=>e.classList.toggle("active",e.getAttribute("href")===`#${v}`));$("#mobileMenu").classList.remove("open");if(v==="library")renderLibrary();if(v==="discover"){const g=new URLSearchParams(q).get("genre");if(g)applyFilter(g)}window.scrollTo({top:0,behavior:"smooth"})}
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


// Wave 9 — Creator Library
function bindDynamicTrackButtons(root=document){
 root.querySelectorAll("[data-track]").forEach(b=>b.onclick=()=>loadTrack(Number(b.dataset.track)));
 root.querySelectorAll("[data-favorite]").forEach(b=>b.onclick=()=>toggleFavorite(Number(b.dataset.favorite)));
 root.querySelectorAll("[data-queue]").forEach(b=>b.onclick=()=>addQueue(Number(b.dataset.queue)));
 root.querySelectorAll("[data-open-track]").forEach(b=>b.onclick=()=>openModal(Number(b.dataset.openTrack)));
}
function cardForTrack(i){
 const t=tracks[i];
 return `<article class="library-track"><div class="library-track-art" style="background-image:url('${t.cover}')"><button data-track="${i}">▶</button></div><strong>${t.title}</strong><small>${t.artist}</small><div><button data-favorite="${i}">♥</button><button data-queue="${i}">＋</button></div></article>`;
}
function renderLibrary(){
 const favGrid=$("#favoriteGrid"), historyList=$("#historyList"), playlistBox=$("#playlistLibrary");
 if(!favGrid||!historyList||!playlistBox)return;
 $("#favoriteStat").textContent=favorites.length;
 $("#playlistStat").textContent=playlists.length;
 $("#historyStat").textContent=history.length;
 favGrid.innerHTML=favorites.length?favorites.map(cardForTrack).join(""):'<div class="library-empty"><span>♡</span><h3>No favorites yet</h3><p>Save tracks you want to use later.</p><a href="#discover">Browse music</a></div>';
 historyList.innerHTML=history.length?history.slice(0,8).map((i,p)=>`<article class="history-row"><span>${String(p+1).padStart(2,"0")}</span><div class="history-art" style="background-image:url('${tracks[i].cover}')"></div><div><strong>${tracks[i].title}</strong><small>${tracks[i].artist} • ${tracks[i].genre}</small></div><button data-track="${i}">▶</button></article>`).join(""):'<div class="library-empty compact"><p>Your recently played tracks will appear here.</p></div>';
 playlistBox.innerHTML=playlists.length?playlists.map((p,idx)=>`<article class="saved-playlist"><div class="playlist-collage">${p.tracks.slice(0,4).map(i=>`<i style="background-image:url('${tracks[i].cover}')"></i>`).join("")}</div><div><strong>${p.name}</strong><small>${p.tracks.length} tracks</small></div><button data-play-playlist="${idx}">▶ Play</button><button data-delete-playlist="${idx}">×</button></article>`).join(""):'<div class="library-empty"><span>＋</span><h3>Create your first playlist</h3><p>Group tracks for a video, stream, podcast, or campaign.</p></div>';
 bindDynamicTrackButtons(favGrid);bindDynamicTrackButtons(historyList);
 playlistBox.querySelectorAll("[data-play-playlist]").forEach(b=>b.onclick=()=>{const p=playlists[Number(b.dataset.playPlaylist)];if(!p?.tracks.length)return;queue=[...p.tracks.slice(1),...queue];saveQueue();loadTrack(p.tracks[0]);});
 playlistBox.querySelectorAll("[data-delete-playlist]").forEach(b=>b.onclick=()=>{playlists.splice(Number(b.dataset.deletePlaylist),1);localStorage.setItem("swPlaylists",JSON.stringify(playlists));renderLibrary();toast("Playlist deleted");});
}
function renderPlaylistPicker(){
 $("#playlistTrackPicker").innerHTML=tracks.map((t,i)=>`<label class="picker-track"><input type="checkbox" value="${i}"><i style="background-image:url('${t.cover}')"></i><span><strong>${t.title}</strong><small>${t.artist}</small></span></label>`).join("");
}
$("#createPlaylist")?.addEventListener("click",()=>{$("#playlistModal").classList.add("open");renderPlaylistPicker();});
$("#playlistClose")?.addEventListener("click",()=>$("#playlistModal").classList.remove("open"));
$("#savePlaylist")?.addEventListener("click",()=>{
 const name=$("#playlistName").value.trim();
 const selected=[...$("#playlistTrackPicker").querySelectorAll("input:checked")].map(x=>Number(x.value));
 if(!name){toast("Name your playlist");return}
 if(!selected.length){toast("Choose at least one track");return}
 playlists.push({name,tracks:selected,created:Date.now()});localStorage.setItem("swPlaylists",JSON.stringify(playlists));
 $("#playlistName").value="";$("#playlistModal").classList.remove("open");renderLibrary();toast("Playlist created");
});
$("#clearHistory")?.addEventListener("click",()=>{history=[];localStorage.setItem("swHistory","[]");renderLibrary();toast("History cleared")});
$("#editProfile")?.addEventListener("click",()=>{const name=prompt("Display name",localStorage.getItem("swProfileName")||"Creator");if(name){localStorage.setItem("swProfileName",name);$("#profileName").textContent=name;toast("Profile updated")}});
if($("#profileName"))$("#profileName").textContent=localStorage.getItem("swProfileName")||"Creator";
renderLibrary();bindDynamicTrackButtons();


// Wave 10 — Streaming Platform
let playCounts=JSON.parse(localStorage.getItem("swPlayCounts")||"{}");
let downloadCounts=JSON.parse(localStorage.getItem("swDownloadCounts")||"{}");
let likeCounts=JSON.parse(localStorage.getItem("swLikeCounts")||"{}");
let crossfadeSeconds=Number(localStorage.getItem("swCrossfade")||2);
let autoplayRecommendations=localStorage.getItem("swAutoplayRecommendations")!=="false";
let decodedWaveforms={};
let waveformRequest=0;

function statValue(store,i,base){return Number(store[i]||base||0)}
function totalPlays(){return Object.values(playCounts).reduce((a,b)=>a+Number(b),0)}
function updatePlatformStats(){
 const total=totalPlays();
 $("#artistPlays") && ($("#artistPlays").textContent=total.toLocaleString());
 $("#totalPlayStat") && ($("#totalPlayStat").textContent=total.toLocaleString());
}
function incrementPlay(i){
 playCounts[i]=statValue(playCounts,i)+1;
 localStorage.setItem("swPlayCounts",JSON.stringify(playCounts));
 updatePlatformStats();
}
function incrementDownload(i){
 downloadCounts[i]=statValue(downloadCounts,i)+1;
 localStorage.setItem("swDownloadCounts",JSON.stringify(downloadCounts));
}
function updateModalStats(i){
 $("#modalPlays").textContent=statValue(playCounts,i);
 $("#modalLikes").textContent=statValue(likeCounts,i,favorites.includes(i)?1:0);
 $("#modalDownloads").textContent=statValue(downloadCounts,i);
}
const originalOpenModalWave10=openModal;
openModal=function(i){originalOpenModalWave10(i);updateModalStats(i)}
const originalToggleFavoriteWave10=toggleFavorite;
toggleFavorite=function(i){
 const before=favorites.includes(i);
 originalToggleFavoriteWave10(i);
 likeCounts[i]=Math.max(0,statValue(likeCounts,i)+(before?-1:1));
 localStorage.setItem("swLikeCounts",JSON.stringify(likeCounts));
 if($("#trackModal").classList.contains("open")&&modalIndex===i)updateModalStats(i);
}
audio.addEventListener("play",()=>{
 if(!audio.dataset.countedFor||audio.dataset.countedFor!==String(current)){
   incrementPlay(current);audio.dataset.countedFor=String(current);
 }
});
audio.addEventListener("ended",()=>{audio.dataset.countedFor=""});

async function fetchWaveform(i){
 if(decodedWaveforms[i])return decodedWaveforms[i];
 try{
  const response=await fetch(tracks[i].src);
  const buffer=await response.arrayBuffer();
  const ctx=new (window.AudioContext||window.webkitAudioContext)();
  const decoded=await ctx.decodeAudioData(buffer.slice(0));
  const ch=decoded.getChannelData(0);
  const points=180;
  const block=Math.max(1,Math.floor(ch.length/points));
  const vals=[];
  for(let p=0;p<points;p++){
    let peak=0;
    const start=p*block,end=Math.min(ch.length,start+block);
    for(let j=start;j<end;j++)peak=Math.max(peak,Math.abs(ch[j]));
    vals.push(peak);
  }
  decodedWaveforms[i]=vals;
  ctx.close();
  return vals;
 }catch(e){
  return Array.from({length:180},(_,n)=>.15+.55*Math.abs(Math.sin(n*.31+i)));
 }
}
async function drawWaveform(i){
 const request=++waveformRequest;
 const canvas=$("#waveformCanvas");if(!canvas)return;
 const vals=await fetchWaveform(i);if(request!==waveformRequest)return;
 const dpr=window.devicePixelRatio||1;
 const rect=canvas.getBoundingClientRect();
 canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));
 const c=canvas.getContext("2d");c.clearRect(0,0,canvas.width,canvas.height);
 const mid=canvas.height/2,w=canvas.width/vals.length;
 vals.forEach((v,n)=>{
  const h=Math.max(2,v*canvas.height*.86);
  c.fillStyle=n/vals.length<((audio.currentTime||0)/(audio.duration||1))?"#66f1c7":"rgba(166,190,202,.42)";
  c.fillRect(n*w,mid-h/2,Math.max(1,w*.58),h);
 });
}
$("#waveformWrap")?.addEventListener("click",e=>{
 if(!audio.duration)return;
 const r=e.currentTarget.getBoundingClientRect();
 audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration;
});
audio.addEventListener("timeupdate",()=>{
 const ratio=(audio.currentTime||0)/(audio.duration||1);
 $("#waveformPlayhead").style.left=`${ratio*100}%`;
 drawWaveform(current);
});
const originalLoadTrackWave10=loadTrack;
loadTrack=async function(i,autoplay=true){
 const targetVol=Number(volume.value||.75);
 if(!audio.paused&&crossfadeSeconds>0){
   const steps=12,stepMs=(crossfadeSeconds*500)/steps;
   for(let s=steps;s>=1;s--){audio.volume=targetVol*(s/steps);await new Promise(r=>setTimeout(r,stepMs))}
 }
 originalLoadTrackWave10(i,false);
 audio.dataset.countedFor="";
 await drawWaveform(current);
 audio.volume=crossfadeSeconds>0?0:targetVol;
 if(autoplay){
   await audio.play().catch(()=>{});
   if(crossfadeSeconds>0){
    const steps=12,stepMs=(crossfadeSeconds*500)/steps;
    for(let s=1;s<=steps;s++){audio.volume=targetVol*(s/steps);await new Promise(r=>setTimeout(r,stepMs))}
   }
 }
};
window.addEventListener("resize",()=>drawWaveform(current));
drawWaveform(current);

const albums={coastal:[0,3,2],neon:[1,5,4]};
$$("[data-album]").forEach(b=>b.onclick=()=>{const list=albums[b.dataset.album];queue=[...list.slice(1),...queue];saveQueue();loadTrack(list[0]);toast("Album started")});
$("[data-artist-play]")?.addEventListener("click",()=>{const list=[0,3,4,2];queue=[...list.slice(1),...queue];saveQueue();loadTrack(list[0]);});

function similarityScore(a,b){
 let score=0;
 if(a.genre===b.genre)score+=3;
 if(a.mood===b.mood)score+=2;
 score+=a.tags.filter(x=>b.tags.includes(x)).length;
 score-=Math.abs(a.bpm-b.bpm)/40;
 return score;
}
function renderRecommendations(){
 const grid=$("#recommendationGrid");if(!grid)return;
 const picks=tracks.map((t,i)=>({t,i,s:i===current?-999:similarityScore(tracks[current],t)})).sort((a,b)=>b.s-a.s).slice(0,3);
 grid.innerHTML=picks.map(({t,i})=>`<article class="recommendation-card"><div class="recommendation-art" style="background-image:url('${t.cover}')"><button data-rec-play="${i}">▶</button></div><strong>${t.title}</strong><small>${t.artist} • ${t.genre}</small></article>`).join("");
 grid.querySelectorAll("[data-rec-play]").forEach(b=>b.onclick=()=>loadTrack(Number(b.dataset.recPlay)));
}
audio.addEventListener("loadedmetadata",renderRecommendations);
renderRecommendations();

$("#crossfadeSelect") && ($("#crossfadeSelect").value=String(crossfadeSeconds));
$("#crossfadeSelect")?.addEventListener("change",e=>{crossfadeSeconds=Number(e.target.value);localStorage.setItem("swCrossfade",crossfadeSeconds);toast(crossfadeSeconds?`Crossfade ${crossfadeSeconds}s`:"Crossfade off")});
$("#autoplayToggle") && ($("#autoplayToggle").checked=autoplayRecommendations);
$("#autoplayToggle")?.addEventListener("change",e=>{autoplayRecommendations=e.target.checked;localStorage.setItem("swAutoplayRecommendations",autoplayRecommendations)});
const originalChooseNextWave10=nextIndex;
nextIndex=function(){
 if(queue.length||repeat==="one"||shuffle)return originalChooseNextWave10();
 if(autoplayRecommendations){
  const pick=tracks.map((t,i)=>({i,s:i===current?-999:similarityScore(tracks[current],t)})).sort((a,b)=>b.s-a.s)[0];
  return pick.i;
 }
 return originalChooseNextWave10();
};

$$("[data-download]").forEach(b=>{
 const old=b.onclick;
 b.onclick=()=>{const src=b.dataset.download;const idx=tracks.findIndex(t=>t.src===src);if(idx>=0)incrementDownload(idx);old&&old()}
});
$("#modalDownload")?.addEventListener("click",()=>incrementDownload(modalIndex));

if("mediaSession" in navigator){
 function updateMediaSession(){
  const t=tracks[current];
  navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:"SafeWave Originals",artwork:[{src:t.cover,sizes:"1000x1000",type:"image/svg+xml"}]});
 }
 audio.addEventListener("loadedmetadata",updateMediaSession);
 navigator.mediaSession.setActionHandler("play",()=>audio.play());
 navigator.mediaSession.setActionHandler("pause",()=>audio.pause());
 navigator.mediaSession.setActionHandler("previoustrack",prev);
 navigator.mediaSession.setActionHandler("nexttrack",next);
 navigator.mediaSession.setActionHandler("seekto",d=>{if(d.seekTime!=null)audio.currentTime=d.seekTime});
 updateMediaSession();
}
updatePlatformStats();
\n// SafeWave 2.0 — Creator Edition\nlet downloadHistory=JSON.parse(localStorage.getItem("swDownloadHistory")||"[]");\nfunction recordDownload(i){if(i<0)return;downloadHistory=[{track:i,time:Date.now()},...downloadHistory.filter(x=>x.track!==i)].slice(0,20);localStorage.setItem("swDownloadHistory",JSON.stringify(downloadHistory));renderDownloadHistory()}\nfunction renderDownloadHistory(){const box=document.querySelector("#downloadHistoryList");if(!box)return;if(!downloadHistory.length){box.innerHTML='<div class="download-history-empty">Downloaded tracks will appear here.</div>';return}box.innerHTML=downloadHistory.map((entry,p)=>{const t=tracks[entry.track],date=new Date(entry.time).toLocaleDateString();return `<article class="history-row"><span>${String(p+1).padStart(2,"0")}</span><div class="history-art" style="background-image:url('${t.cover}')"></div><div><strong>${t.title}</strong><small>${t.artist} • Saved ${date}</small></div><button data-track="${entry.track}">▶</button></article>`}).join("");bindDynamicTrackButtons(box)}\ndocument.querySelector("#clearDownloads")?.addEventListener("click",()=>{downloadHistory=[];localStorage.setItem("swDownloadHistory","[]");renderDownloadHistory();toast("Download history cleared")});\ndocument.querySelectorAll("[data-download]").forEach(btn=>btn.addEventListener("click",()=>recordDownload(tracks.findIndex(t=>t.src===btn.dataset.download))));document.querySelector("#modalDownload")?.addEventListener("click",()=>recordDownload(modalIndex));\nconst quickMap={focus:{query:"calm focus lo-fi",track:0},energy:{query:"electronic energy",track:1},cinematic:{query:"cinematic epic",track:4}};document.querySelectorAll("[data-quick]").forEach(btn=>btn.addEventListener("click",()=>{const m=quickMap[btn.dataset.quick];location.hash="#discover";setTimeout(()=>{const s=document.querySelector("#trackSearch");if(s){s.value=m.query;s.dispatchEvent(new Event("input"))}loadTrack(m.track,true)},80)}));\nfunction sessionRecommendationOrder(){const liked=new Set(favorites),recent=new Set(history.slice(0,6));return tracks.map((t,i)=>{let score=i===current?-5:0;if(liked.has(i))score+=5;if(recent.has(i))score+=2;score+=similarityScore(tracks[current],t);return{i,score}}).sort((a,b)=>b.score-a.score).map(x=>x.i)}\ndocument.querySelector("#playForYou")?.addEventListener("click",()=>{const order=sessionRecommendationOrder();if(!order.length)return;queue=[...order.slice(1),...queue];saveQueue();loadTrack(order[0],true);toast("Your session mix started")});\nfunction updateBottomNav(){const view=(location.hash||"#home").slice(1).split("?")[0];document.querySelectorAll(".mobile-bottom-nav .route-link").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${view}`))}\nwindow.addEventListener("hashchange",updateBottomNav);updateBottomNav();renderDownloadHistory();\n

// SafeWave 3.0 — Milestone 1 Creator Studio
let studioDrafts=JSON.parse(localStorage.getItem("swStudioDrafts")||"[]");
let studioSettings=JSON.parse(localStorage.getItem("swStudioSettings")||"{}");

function studioTotals(){
 const plays=Object.values(typeof playCounts==="object"?playCounts:{}).reduce((a,b)=>a+Number(b),0);
 const downloads=Object.values(typeof downloadCounts==="object"?downloadCounts:{}).reduce((a,b)=>a+Number(b),0);
 return {plays,downloads};
}
function renderStudioOverview(){
 const totals=studioTotals();
 $("#draftCount")&&($("#draftCount").textContent=studioDrafts.length);
 $("#studioPlayCount")&&($("#studioPlayCount").textContent=totals.plays.toLocaleString());
 $("#studioDownloadCount")&&($("#studioDownloadCount").textContent=totals.downloads.toLocaleString());
 const releases=$("#studioReleaseList");
 if(releases)releases.innerHTML=tracks.slice().reverse().slice(0,4).map((t,i)=>`<article class="release-row"><i style="background-image:url('${t.cover}')"></i><div><strong>${t.title}</strong><small>${t.artist} • ${t.genre}</small></div><span>LIVE</span></article>`).join("");
}
function renderStudioMusic(){
 const table=$("#studioTrackTable");if(!table)return;
 table.innerHTML=tracks.map((t,i)=>`<article class="studio-table-row"><i style="background-image:url('${t.cover}')"></i><div><strong>${t.title}</strong><small>${t.artist}</small></div><span>${t.genre}</span><span>${t.bpm} BPM</span><span>${t.mood}</span><button data-track="${i}">▶ Preview</button></article>`).join("");
 bindDynamicTrackButtons(table);
}
function renderDrafts(){
 const box=$("#draftList");if(!box)return;
 box.innerHTML=studioDrafts.length?`<div class="studio-card-head"><h3>Saved drafts</h3><span>${studioDrafts.length}</span></div>`+studioDrafts.map((d,i)=>`<article class="draft-card"><div><strong>${d.title}</strong><small>${d.artist} • ${d.genre} • ${d.bpm||"—"} BPM</small></div><button data-delete-draft="${i}">Delete</button></article>`).join(""):"";
 box.querySelectorAll("[data-delete-draft]").forEach(b=>b.onclick=()=>{studioDrafts.splice(Number(b.dataset.deleteDraft),1);localStorage.setItem("swStudioDrafts",JSON.stringify(studioDrafts));renderDrafts();renderStudioOverview();toast("Draft deleted")});
}
function topIndex(store){
 let best=-1,value=-1;
 tracks.forEach((_,i)=>{const v=Number(store?.[i]||0);if(v>value){best=i;value=v}});
 return {index:best,value:Math.max(0,value)};
}
function renderAnalytics(){
 const totals=studioTotals();
 const chart=$("#analyticsChart");
 if(chart){
  const values=tracks.map((_,i)=>Number((typeof playCounts==="object"?playCounts:{})[i]||0));
  const max=Math.max(1,...values);
  chart.innerHTML=values.map((v,i)=>`<div class="chart-bar" style="height:${Math.max(8,v/max*88)}%"><span>${v}</span><small>${tracks[i].title.split(" ")[0]}</small></div>`).join("");
 }
 const top=topIndex(typeof playCounts==="object"?playCounts:{});
 const liked=topIndex(typeof likeCounts==="object"?likeCounts:{});
 const down=topIndex(typeof downloadCounts==="object"?downloadCounts:{});
 $("#topTrackName")&&($("#topTrackName").textContent=top.index>=0?tracks[top.index].title:"—");
 $("#topTrackPlays")&&($("#topTrackPlays").textContent=`${top.value} plays`);
 $("#mostLikedName")&&($("#mostLikedName").textContent=liked.index>=0?tracks[liked.index].title:"—");
 $("#mostLikedCount")&&($("#mostLikedCount").textContent=`${liked.value} likes`);
 $("#mostDownloadedName")&&($("#mostDownloadedName").textContent=down.index>=0?tracks[down.index].title:"—");
 $("#mostDownloadedCount")&&($("#mostDownloadedCount").textContent=`${down.value} downloads`);
}
function renderStudio(){
 renderStudioOverview();renderStudioMusic();renderDrafts();renderAnalytics();
 if($("#defaultArtist"))$("#defaultArtist").value=studioSettings.defaultArtist||"SafeWave Originals";
}
$$(".studio-tab").forEach(tab=>tab.addEventListener("click",()=>{
 $$(".studio-tab").forEach(t=>t.classList.toggle("active",t===tab));
 $$(".studio-panel").forEach(p=>p.classList.toggle("active",p.dataset.studioPanel===tab.dataset.studioTab));
 if(tab.dataset.studioTab==="analytics")renderAnalytics();
}));
$$("[data-open-release]").forEach(btn=>btn.addEventListener("click",()=>{
 const tab=$('.studio-tab[data-studio-tab="release"]');tab?.click();
 $("#releaseTitle")?.focus();
}));
$("#releaseForm")?.addEventListener("submit",e=>{
 e.preventDefault();
 const draft={
  title:$("#releaseTitle").value.trim(),
  artist:$("#releaseArtist").value.trim(),
  album:$("#releaseAlbum").value.trim(),
  genre:$("#releaseGenre").value,
  bpm:$("#releaseBpm").value,
  key:$("#releaseKey").value.trim(),
  tags:$("#releaseTags").value.trim(),
  description:$("#releaseDescription").value.trim(),
  created:Date.now()
 };
 studioDrafts.unshift(draft);localStorage.setItem("swStudioDrafts",JSON.stringify(studioDrafts));
 e.currentTarget.reset();renderDrafts();renderStudioOverview();toast("Release draft saved");
});
$("#saveStudioSettings")?.addEventListener("click",()=>{
 studioSettings.defaultArtist=$("#defaultArtist").value.trim()||"SafeWave Originals";
 localStorage.setItem("swStudioSettings",JSON.stringify(studioSettings));toast("Studio settings saved");
});
const previousRouteStudio=route;
route=function(){
 previousRouteStudio();
 const view=(location.hash||"#home").slice(1).split("?")[0];
 if(view==="studio")renderStudio();
};
window.removeEventListener("hashchange",previousRouteStudio);
window.addEventListener("hashchange",route);
route();
renderStudio();
