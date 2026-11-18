(()=>{
"use strict";
const root=document.getElementById("heroStripes");
if(!root)return;
const sources=[
"assets/05-portal-metropolis.jpg",
"assets/07-celestial-guardian.jpg",
"assets/08-orbital-fractal.jpg",
"assets/12-elemental-simulation.jpg",
"assets/01-celestial-city.jpg",
"assets/14-sunken-civilization.jpg",
"assets/10-menger-architecture.jpg",
"assets/11-chronocrystal-garden.jpg",
"assets/06-bioluminescent-cavern.jpg",
"assets/13-digital-characters.jpg",
"assets/09-floating-kingdom.jpg",
"assets/02-crystal-sanctuary.jpg",
"assets/04-fractal-cosmos.jpg",
"assets/03-angelic-android.jpg"
];
const titles=[
["Архітектура порталів","Portal architecture"],
["Охоронець храму","Temple guardian"],
["Орбітальна сингулярність","Orbital singularity"],
["Буря стихій","Elemental storm"],
["Небесна столиця","Celestial city"],
["Затонула цивілізація","Sunken civilization"],
["Математична архітектура","Mathematical architecture"],
["Хронокристалічний сад","Chronocrystal garden"],
["Біолюмінесцентний світ","Bioluminescent world"],
["Цифрові персонажі","Digital characters"],
["Ширяюче королівство","Floating kingdom"],
["Кришталевий храм","Crystal sanctuary"],
["Фрактальний космос","Fractal cosmos"],
["Механічний ангел","Mechanical angel"]
];
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const controls=[...root.querySelectorAll(".hero-stripe")];
const slots=[0,1,2,3,4];
const busy=new Set();
let selected=2,clock=null,cycle=0,stopped=false;
function currentLocale(){return document.documentElement.lang==="en"?1:0}
function setCaption(el,idx){const title=titles[idx][currentLocale()];const instruction=currentLocale()?"Click to change background":"Натисни, щоб змінити фон";el.setAttribute("aria-label",(Number(el.dataset.slot)+1)+"/5: "+title+". "+instruction);el.title=title;}
function refreshCaptions(){controls.forEach((el,i)=>setCaption(el,slots[i]));const cap=document.getElementById("stripesCaption");if(cap)cap.textContent=currentLocale()?"CHOOSE A WORLD · CLICK A PANEL":"ОБЕРИ СВІТ · НАТИСНИ НА СМУГУ";}
function nextSource(slot){const occupied=new Set(slots.filter((_,i)=>i!==slot));for(let step=1;step<=sources.length;step++){const id=(slots[slot]+step)%sources.length;if(!occupied.has(id))return id;}return(slots[slot]+1)%sources.length;}
function preload(src){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src=src;})}
async function switchPanel(slot){
 const el=controls[slot];if(!el||busy.has(slot))return;
 const target=nextSource(slot);
 busy.add(slot);
 const ok=await preload(sources[target]);if(!ok){busy.delete(slot);return;}
 const current=el.querySelector(".stripe-picture img.is-visible");
 const hidden=el.querySelector(".stripe-picture img.is-hidden");
 if(!current||!hidden){busy.delete(slot);return;}
 hidden.src=sources[target];
 hidden.alt="";
 // Force stacking order and crossfade without temporarily revealing blank images.
 hidden.style.zIndex="2";current.style.zIndex="1";
 hidden.classList.remove("is-hidden");hidden.classList.add("is-visible");
 current.classList.remove("is-visible");current.classList.add("is-hidden");
 el.classList.add("is-changing");
 slots[slot]=target;setCaption(el,target);
 const finish=()=>{current.style.zIndex="";hidden.style.zIndex="";el.classList.remove("is-changing");busy.delete(slot)};
 if(reduced.matches)finish();else setTimeout(finish,1600);
}
function select(i){
 selected=i;
 controls.forEach((el,j)=>el.classList.toggle("is-selected",i===j));
}
controls.forEach((el,i)=>{
 const imgs=el.querySelectorAll(".stripe-picture img");
 imgs[0].src=sources[i];imgs[0].className="is-visible";imgs[1].className="is-hidden";
 setCaption(el,i);
 el.addEventListener("pointerenter",()=>{select(i);stopped=true});
 el.addEventListener("pointerleave",()=>{stopped=false});
 el.addEventListener("focus",()=>{select(i);stopped=true});
 el.addEventListener("blur",()=>{stopped=false});
 el.addEventListener("click",()=>{select(i);switchPanel(i)});
});
function tick(){
 if(!stopped&&!document.hidden&&!reduced.matches && window.scrollY<window.innerHeight*.9){
   const slot=cycle++%controls.length;
   switchPanel(slot);
   select(slot);
 }
}
function start(){if(clock)clearInterval(clock);clock=null;if(!reduced.matches)clock=setInterval(tick,5400)}
reduced.addEventListener?.("change",start);
new MutationObserver(refreshCaptions).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
select(2);refreshCaptions();start();
})();
