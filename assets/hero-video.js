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
 let index=0,front=0,pending=null,busy=false,disposed=false,job=0,wantPlayback=true;
 let manifest={portal:"cosmic-nebula.mp4",nebula:"cosmic-nebula.mp4",crystal:"cosmic-nebula.mp4",geometry:"cosmic-nebula.mp4",temple:"cosmic-nebula.mp4"},timer=null;
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
  img.onerror=function(){if(this.src.endsWith(".webp")&&scenes[n].fallback)this.src="assets/"+scenes[n].fallback;};
  img.alt="";
  v.poster=fallbackSrc(n);
  const source=videoSrc(n);
  layer.dataset.scene=String(n);
  layer.classList.remove("has-video","video-fallback");
  stopVideo(layer);
  if(!source){layer.classList.add("video-fallback");return Promise.resolve(false);}
  return new Promise(resolve=>{
   let settled=false;
   const done=ok=>{
    if(settled)return;settled=true;
    v.removeEventListener("canplay",onReady);v.removeEventListener("error",onError);
    clearTimeout(timeout);
    if(ok){
     layer.classList.add("has-video");
     if(wantPlayback&&!document.hidden&&layer===layers[front])startVideo(v);
    }else{layer.classList.add("video-fallback");}
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
 function startVideo(v){
  if(disposed||!wantPlayback||document.hidden)return;
  v.muted=true;v.defaultMuted=true;v.autoplay=true;v.loop=true;v.playsInline=true;
  const promise=v.play();
  if(promise&&typeof promise.catch==="function")promise.catch(error=>{
   if(disposed||!wantPlayback)return;
   if(v.readyState<2)v.addEventListener("canplay",()=>startVideo(v),{once:true});
   else console.warn("DGC video playback could not resume:",error);
  });
 }
 const pause=()=>{
  wantPlayback=false;
  layers.forEach(layer=>layer.querySelector("video").pause());
 };
 const resume=()=>{
  if(disposed)return;
  wantPlayback=true;
  const layer=layers[front],v=layer.querySelector("video");
  if(!v.getAttribute("src")&&videoSrc(index))configure(layer,index);
  else if(layer.classList.contains("has-video")||v.readyState>=2)startVideo(v);
  else v.addEventListener("canplay",()=>startVideo(v),{once:true});
 };
 const visibility=()=>{
  if(document.hidden)layers.forEach(layer=>layer.querySelector("video").pause());
  else if(wantPlayback)startVideo(layers[front].querySelector("video"));
 };
 document.addEventListener("visibilitychange",visibility);
 // Initialize the first image instantly, then load the optional video manifest.
 const current=layers[0];
 const initialImg=current.querySelector("img");
 initialImg.src=fallbackSrc(0);
 initialImg.onerror=function(){if(this.src.endsWith(".webp")&&scenes[0].fallback)this.src="assets/"+scenes[0].fallback;};
 current.dataset.scene="0";
 current.classList.add("is-active");
 current.style.opacity="1";current.style.zIndex="2";
 root.dataset.activeScene="0";
 // Start the known public MP4 immediately. No poster is displayed during startup.
 configure(layers[front],0);
 loadManifest().then(values=>{
  if(disposed)return;
  if(values&&Object.keys(values).length)manifest={...manifest,...values};
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