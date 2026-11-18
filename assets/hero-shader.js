/* DGC — original procedural WebGL2 CGI, no external libraries. */
(()=>{
"use strict";
const vertex=`#version 300 es
precision highp float;
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const fragment=`#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uTime,uBlend;
uniform int uFrom,uTo;
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+2.1;a*=.5;}return v;}
float stars(vec2 uv,float t){vec2 p=uv*22.,cell=floor(p),f=fract(p)-.5;vec2 h=vec2(hash21(cell),hash21(cell+9.17))-.5;float d=length(f-h*.7);return pow(max(0.,1.-d*4.5),11.)*(.7+.3*sin(t*1.8+hash21(cell+17.4)*6.28));}
vec3 portal(vec2 p,float t){
 vec2 q=p-vec2(.21,.02);float r=length(q),a=atan(q.y,q.x),twist=a+2.65/(r+.37)+t*.24;
 float fil=pow(.5+.5*sin(twist*11.+r*22.-t*2.8),4.),arc=pow(.5+.5*sin(twist*6.-r*27.+t*1.1),6.);
 float ring=exp(-pow((r-.52)/.085,2.)),ring2=exp(-pow((r-.72)/.035,2.));
 float n=fbm(q*3.+vec2(t*.07,-t*.05));
 vec3 base=mix(vec3(.012,.018,.065),vec3(.08,.015,.23),n);
 vec3 plasma=mix(vec3(.07,.24,.95),vec3(.86,.25,1.),.5+.5*sin(twist*3.));
 return base+plasma*(fil*.67+arc*.23)*(1.-smoothstep(.65,1.4,r))+vec3(1.,.5,.12)*ring*1.4+vec3(.44,.85,1.)*ring2*.6+vec3(.07,.4,.9)*exp(-r*6.)*.55+vec3(.42,.66,1.)*stars(p,t);
}
vec3 nebula(vec2 p,float t){
 vec2 q=p*1.2+vec2(.09*t,-.04*t);
 float f=fbm(q*2.2+vec2(.03*t,0.)),f2=fbm(q*3.5+vec2(-t*.05,t*.02)+f*1.6);
 float cloud=smoothstep(.39,.78,f*.5+f2*.72);
 vec3 c=vec3(.004,.008,.035);
 c+=mix(vec3(.07,.16,.56),vec3(.75,.14,.52),f2)*cloud*1.8;
 c+=vec3(.09,.49,.84)*pow(max(f2-.4,0.),2.)*1.8;
 c+=vec3(1.,.82,.58)*pow(max(f2-.68,0.),3.)*6.;
 return c+vec3(.65,.79,1.)*stars(p,t)*1.3;
}
vec3 liquid(vec2 p,float t){
 float d=length(p-vec2(.1,0.));
 float wave=sin(12.*p.x+sin(5.*p.y+t)*1.9-t*1.6)+sin(11.*p.y+sin(6.*p.x-t*.65)*1.3+t*.8);
 float caustic=pow(max(0.,.5+.5*cos(wave*3.2+5.*d)),10.);
 float f=fbm(p*3.+vec2(.06*t,-.09*t));
 float ribbon=pow(.5+.5*sin(p.y*12.+sin(p.x*7.+t)*2.5+t),8.);
 vec3 c=mix(vec3(.006,.06,.11),vec3(0.,.28,.39),f)+vec3(.05,.5,.8)*(.5+.5*wave)*.28;
 return c+vec3(.5,.95,1.)*caustic*.9+vec3(1.,.68,.27)*ribbon*.55+vec3(.05,.3,.36)*exp(-d*d*3.);
}
vec3 geometry(vec2 p,float t){
 float a=t*.12;vec2 q=mat2(cos(a),-sin(a),sin(a),cos(a))*p;
 float depth=0.,lines=0.,n=1.;
 for(int i=0;i<4;i++){vec2 g=abs(fract(q*n+vec2(t*.025,-t*.019))-.5);lines+=exp(-pow(min(g.x,g.y)*n*8.,2.))/(n*.8);depth+=exp(-length(g)*n*.5)/n;n*=2.;}
 float rose=sin(atan(q.y,q.x)*12.+t*.15),ring=exp(-pow((length(q)-.58-.02*rose)/.014,2.));
 return vec3(.006,.016,.043)+vec3(.03,.18,.34)*depth*.11+vec3(.12,.65,.94)*lines*.42+vec3(1.,.68,.27)*ring*.95+vec3(.44,.24,.7)*exp(-length(q)*3.)*.35;
}
vec3 temple(vec2 p,float t){
 float y=p.y+.1,mist=fbm(p*2.4+vec2(t*.035,0.));
 vec3 c=mix(vec3(.008,.023,.064),vec3(.045,.085,.15),smoothstep(-.8,.9,y));
 float columns=0.;
 for(int i=0;i<7;i++){float x=(float(i)-3.)*.34;float pillar=1.-smoothstep(.055,.075,abs(p.x-x));float base=smoothstep(-.72,-.65,y)*(1.-smoothstep(.48,.52,y));columns+=pillar*base*(.7+.3*sin(y*36.+float(i)*1.1+t*.11));}
 c+=vec3(.28,.32,.36)*columns*.72;
 float rays=pow(max(0.,sin(atan(p.x-.3,p.y-1.4)*19.+t*.06)),14.);
 c+=vec3(.93,.69,.3)*rays*smoothstep(1.,-.7,y)*(.4+.6*mist)*.72;
 c+=vec3(.09,.38,.55)*mist*.45+exp(-abs(y+.22)*5.)*vec3(.22,.26,.21);
 return c+vec3(1.,.74,.38)*exp(-length(p-vec2(.3,.45))*6.)*.35;
}
vec3 scene(int i,vec2 p,float t){
 if(i==0)return portal(p,t);
 if(i==1)return nebula(p,t);
 if(i==2)return liquid(p,t);
 if(i==3)return geometry(p,t);
 return temple(p,t);
}
void main(){
 vec2 frag=gl_FragCoord.xy;
 vec2 p=(frag-.5*uResolution)/max(uResolution.y,1.);
 p+=vec2(sin(uTime*.09)*.025,cos(uTime*.07)*.017);
 vec3 c=mix(scene(uFrom,p,uTime),scene(uTo,p,uTime),smoothstep(0.,1.,clamp(uBlend,0.,1.)));
 c*=clamp(1.-.32*pow(length(p),1.45),.55,1.);
 c=pow(max(1.-exp(-c*1.15),vec3(0.)),vec3(.88));
 c+=(hash21(frag+uTime*31.)-.5)*.012;
 fragColor=vec4(clamp(c,0.,1.),1.);
}`;
function compile(gl,type,src){
 const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const reason=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(reason);}return s;
}
let active=null;
function mount(canvas){
 if(active)active.destroy();
 let gl;
 try{gl=canvas.getContext("webgl2",{alpha:false,antialias:false,depth:false,preserveDrawingBuffer:false,powerPreference:"default"});}catch(_){}
 if(!gl)return null;
 let vs,fs,program;
 try{
  vs=compile(gl,gl.VERTEX_SHADER,vertex);fs=compile(gl,gl.FRAGMENT_SHADER,fragment);
  program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 }catch(e){console.warn("DGC CGI fallback:",e);return null;}
 const location={
 resolution:gl.getUniformLocation(program,"uResolution"),
 time:gl.getUniformLocation(program,"uTime"),
 blend:gl.getUniformLocation(program,"uBlend"),
 from:gl.getUniformLocation(program,"uFrom"),
 to:gl.getUniformLocation(program,"uTo")
 };
 const vao=gl.createVertexArray();
 let from=0,to=0,start=0,raf=0,dead=false,paused=false,visible=true;
 const epoch=performance.now(),duration=1600;
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;},{threshold:0});
 observer.observe(canvas);
 function frame(now){
  if(dead)return;
  raf=requestAnimationFrame(frame);
  if(document.hidden||paused||!visible)return;
  const scale=Math.min(devicePixelRatio||1,1.25,1600/Math.max(1,canvas.clientWidth));
  const w=Math.max(1,Math.round(canvas.clientWidth*scale)),h=Math.max(1,Math.round(canvas.clientHeight*scale));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.useProgram(program);gl.bindVertexArray(vao);
  const factor=reduced.matches?1:Math.min(1,(now-start)/duration);
  if(factor>=1)from=to;
  gl.uniform2f(location.resolution,w,h);
  gl.uniform1f(location.time,reduced.matches?0:(now-epoch)/1000);
  gl.uniform1f(location.blend,factor);
  gl.uniform1i(location.from,from);
  gl.uniform1i(location.to,to);
  gl.drawArrays(gl.TRIANGLES,0,3);
 }
 function lost(e){e.preventDefault();paused=true;canvas.classList.remove("shader-ready");}
 canvas.addEventListener("webglcontextlost",lost);
 start=performance.now()-duration;
 raf=requestAnimationFrame(frame);
 canvas.classList.add("shader-ready");
 function setEffect(index){
  const i=Math.min(4,Math.max(0,Math.floor(index)));
  if(i===to)return;
  from=to;to=i;start=performance.now();
 }
 function destroy(){
  dead=true;cancelAnimationFrame(raf);observer.disconnect();
  canvas.removeEventListener("webglcontextlost",lost);
  canvas.classList.remove("shader-ready");
  gl.deleteVertexArray(vao);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
  if(active===api)active=null;
 }
 const api={setEffect,destroy,get mode(){return to}};
 active=api;return api;
}
window.DGCEffects={mount};
})();