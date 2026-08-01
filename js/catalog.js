// Aurora 4.0 Session 2
async function loadCatalog(){
  const files=["artists","albums","tracks","genres","collections"];
  const catalog={};
  for(const name of files){
    try{
      const res=await fetch(`data/${name}.json`);
      catalog[name]=await res.json();
    }catch(e){
      console.warn(`Failed to load ${name}.json`,e);
      catalog[name]=[];
    }
  }
  window.SafeWaveCatalog=catalog;
  return catalog;
}
window.loadCatalog=loadCatalog;
