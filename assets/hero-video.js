/* DGC video showcase: genuine silent video when files exist, animated photo fallback otherwise.
   No video URLs are fabricated. Add approved videos and update manifest.json. */
(()=>{
"use strict";
const prefersReduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const VIDEO_DIR="assets/videos/";
async function loadManifest(){
 try{
  const r=await fetch(VIDEO_DIR+"manifest.json",{cache:"no-store"});
  if(!r.ok)return {};
  const json=await r.json();return json&&typeof json==="object"?json:{};
 }catch{return {};}
}
function mount(root,scenes){
 const layers=[...root.querySelectorAll(".cinema-layer")];
 if(layers.length!==2)throw Error("Expected exactly two CGI carousel layers");
 let index=0,front=0,pending=null,busy=false,disposed=false,job=0;
 let manifest={},timer=null;
 const fallbackSrc=n=>"assets/"+scenes[n].image;
 const videoSrc=n=>{
  const file=manifest[scenes[n].key];
  // Manifest values are filenames only. Avoid absolute or remote URL injection.
  return typeof file==="string"&&/^[a-z0-9][a-z0-9._-]*\.(mp4|webm)$/i.test(file)?VIDEO_DIR+file:"";
 };
 function stopVideo(layer){
  const v=layer.querySelector("video");
  v.pause();v.removeAttribute("src");v.load();
 }
 function configure(layer,n){
  const v=layer.querySelector("video"),img=layer.querySelector("img");
  img.src=fallbackSrc(n);
  img.alt="";
  v.poster=fallbackSrc(n);
  const source=videoSrc(n);
  layer.dataset.scene=String(n);
  layer.classList.remove("has-video");
  stopVideo(layer);
  if(!source)return Promise.resolve(false);
  return new Promise(resolve=>{
   let settled=false;
   const done=ok=>{
    if(settled)return;settled=true;
    v.removeEventListener("canplay",onReady);v.removeEventListener("error",onError);
    clearTimeout(timeout);
    if(ok){layer.classList.add("has-video");v.play().catch(()=>{layer.classList.remove("has-video")});}
    resolve(ok);
   };
   const onReady=()=>done(true),onError=()=>done(false);
   const timeout=setTimeout(()=>done(false),3800);
   v.addEventListener("canplay",onReady,{once:true});
   v.addEventListener("error",onError,{once:true});
   v.src=source;
   v.load();
  });
 }
 function setActive(n){
  layers.forEach((layer,i)=>{
   const selected=i===front;
   layer.classList.toggle("is-active",selected);
   layer.style.zIndex=selected?"2":"1";
   if(!selected)layer.querySelector("video").pause();
  });
  root.dataset.activeScene=String(n);
 }
 async function select(n){
  if(disposed||!Number.isInteger(n)||n<0||n>=scenes.length)return;
  if(busy){pending=n;return;}
  if(n===index)return;
  busy=true;
  const token=++job,newFront=1-front;
  const incoming=layers[newFront],outgoing=layers[front];
  await configure(incoming,n);
  if(disposed||token!==job)return;
  // Both scene layers stay in the DOM, avoiding black frames between videos.
  incoming.style.zIndex="3";
  incoming.classList.add("is-active");
  outgoing.classList.add("is-active");
  root.dataset.transitioning="true";
  const ms=prefersReduced()?0:1300;
  incoming.style.transition="opacity "+ms+"ms cubic-bezier(.2,.75,.15,1)";
  outgoing.style.transition="opacity "+ms+"ms cubic-bezier(.2,.75,.15,1)";
  incoming.style.opacity="0";
  incoming.getBoundingClientRect();
  requestAnimationFrame(()=>{
   incoming.style.opacity="1";
   outgoing.style.opacity="0";
  });
  await new Promise(resolve=>setTimeout(resolve,ms+55));
  if(disposed||token!==job)return;
  front=newFront;index=n;
  outgoing.classList.remove("is-active");
  stopVideo(outgoing);
  incoming.style.zIndex="2";outgoing.style.zIndex="1";
  root.dataset.transitioning="false";
  setActive(index);busy=false;
  const next=pending;pending=null;
  if(next!==null&&next!==index)select(next);
 }
 const pause=()=>{
  for(const layer of layers)layer.querySelector("video").pause();
 };
 const resume=()=>{
  if(disposed||document.hidden||prefersReduced())return;
  const layer=layers[front],v=layer.querySelector("video");
  if(layer.classList.contains("has-video"))v.play().catch(()=>{layer.classList.remove("has-video")});
 };
 const visibility=()=>document.hidden?pause():resume();
 document.addEventListener("visibilitychange",visibility);
 // Initialize the first image instantly, then load the optional video manifest.
 const current=layers[0];
 current.querySelector("img").src=fallbackSrc(0);
 current.dataset.scene="0";
 current.classList.add("is-active");
 current.style.opacity="1";current.style.zIndex="2";
 root.dataset.activeScene="0";
 loadManifest().then(async values=>{
  if(disposed)return;
  manifest=values;
  if(videoSrc(index))await configure(layers[front],index);
 });
 const api={
  select,
  pause,
  resume,
  get index(){return index;},
  destroy(){
   disposed=true;job++;clearTimeout(timer);
   document.removeEventListener("visibilitychange",visibility);
   layers.forEach(layer=>stopVideo(layer));
  }
 };
 return api;
}
window.DGCVideoCarousel={mount};
})();