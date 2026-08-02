
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('section,.card,.album-card').forEach(el=>el.classList.add('reveal-on-scroll'));
 const io=new IntersectionObserver(entries=>{
   entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
 },{threshold:.12});
 document.querySelectorAll('.reveal-on-scroll').forEach(el=>io.observe(el));
});
