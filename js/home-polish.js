// Aurora 4.4 Home Polish
document.addEventListener('DOMContentLoaded',()=>{
 const hero=document.querySelector('.hero');
 if(hero&&!hero.querySelector('.aurora-badge')){
   const b=document.createElement('div');
   b.className='aurora-badge';
   b.innerHTML='<span>✨ Featured Release</span>';
   hero.prepend(b);
 }
});