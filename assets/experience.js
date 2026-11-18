(() => {
"use strict";
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero=document.getElementById("top"),header=document.querySelector(".header");
const heroPic=document.querySelector(".hero-image-layer img");
const progress=document.querySelector(".reading-progress");
const navItems=Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
const scrollTarget=document.getElementById("portalNext");
const heroDust=document.querySelector(".hero-dust");
const chapters=["studio","gallery","algorithms","ai","journey","status"];
const uiText={
uk:{portalNext:"ВІДКРИЙ НАСТУПНИЙ РОЗДІЛ",journeyEye:"КАРТА РОЗВИТКУ / ENGINEERING ROADMAP",journeyTitle:'Від першого контракту <span class="text-accent">до власного всесвіту.</span>',journeyLead:"Обери етап на інтерактивній шкалі та побачиш, що досліджується зараз, що заплановано, а що ще заблоковано. Без вигаданих відсотків і маркетингових обіцянок.",legendCurrent:"Поточний етап",legendFuture:"Майбутній етап",legendBlocked:"Очікує попередніх етапів",roadmapNote:"Джерело: задокументована дорожня карта DGC. Статус — якісний; відсотки завершення не заявляються. Прототипи не є готовим застосунком.",infoTitle1:"Єдина творча модель",infoBody1:"Спільні сцени, ресурси, матеріали та шкала часу мають поєднати 3D-моделювання, 2D-графіку, анімацію й відео в одному проєкті.",infoTitle2:"Відтворюваність",infoBody2:"Версіоновані формати, зрозуміла історія команд, детерміноване відтворення й контроль походження творчих ресурсів.",infoTitle3:"Нативна продуктивність",infoBody3:"Цільовий стек C++23, Qt 6, Vulkan/GLSL та окремі workers — після інструментальних перевірок, а не заради модних назв.",infoTitle4:"Симуляції та графіка",infoBody4:"Частинки, об’ємні середовища, матеріали, процедурна геометрія, оптика та наукова візуалізація — заплановані напрями.",infoTitle5:"Людина керує ШІ",infoBody5:"Агентні інструменти задумано як контрольовані команди з перевіркою дозволів, можливістю перегляду та відкату.",infoTitle6:"Від ідеї до фільму",infoBody6:"Мета — композиція, анімація, звук, монтаж, рендеринг і експорт, а не лише окремі красиві демонстрації.",navJourney:"Розвиток"},
en:{portalNext:"EXPLORE THE NEXT CHAPTER",journeyEye:"PROJECT DEVELOPMENT / ENGINEERING ROADMAP",journeyTitle:'From the first contract <span class="text-accent">to a creative universe.</span>',journeyLead:"Choose a milestone on the interactive timeline to explore what is being researched, what is planned, and what remains blocked. No invented completion percentages.",legendCurrent:"Current phase",legendFuture:"Future phase",legendBlocked:"Depends on earlier phases",roadmapNote:"Source: documented DGC roadmap. Milestone statuses are qualitative; no fabricated percentages or claims that prototypes are a finished product.",infoTitle1:"One creative model",infoBody1:"Shared scenes, assets, materials and a timeline are intended to connect 3D modeling, 2D graphics, animation and video in one project.",infoTitle2:"Reproducible creativity",infoBody2:"Versioned formats, auditable command history, deterministic replay and clear asset provenance.",infoTitle3:"Native performance",infoBody3:"C++23, Qt 6, Vulkan/GLSL and separate workers are targeted technologies, subject to validation rather than hype.",infoTitle4:"Simulation & graphics",infoBody4:"Particles, volumetrics, materials, procedural geometry, optics and scientific visualization are future research directions.",infoTitle5:"The artist controls AI",infoBody5:"Agent tooling is envisioned as permission-checked, inspectable and reversible commands.",infoTitle6:"From idea to film",infoBody6:"The ambition is composition, animation, audio, editing, rendering and export — not isolated pretty demos.",navJourney:"Roadmap"}};
const phases=[
{short:["Архітектура","Architecture"],name:["P0 · Дослідження та архітектура","P0 · Research and architecture"],status:["ПОТОЧНИЙ ЕТАП","CURRENT PHASE"],desc:["PHASE 0 зараз триває: вимоги, межі модулів, ADR, перевірки, прототипні контракти та технологічні дослідження. Це не завершений продукт.","Phase 0 is active: requirements, module boundaries, ADRs, quality gates, prototype contracts and technology research. This is not a shipped product."],tasks:[["Підготовлені архітектурні документи та рішення","Architecture documents and decisions documented"],["Частина контрактів і перевірок задокументована","Some contracts and checks documented"],["Прийняття всієї архітектури ще попереду","Full architecture acceptance still pending"]],type:"current"},
{short:["Ядро","Core slice"],name:["P1 · Мінімальний працюючий зріз","P1 · First working vertical slice"],status:["ЗАБЛОКОВАНО ДО ПРИЙНЯТТЯ P0","BLOCKED UNTIL P0 ACCEPTANCE"],desc:["Перший інтеграційний зріз плануємо будувати лише після погодження PHASE 0: Qt-вікно, Vulkan viewport, імпорт ресурсу, збереження сцени й експорт кадру.","Planned only after Phase 0 acceptance: a Qt window, Vulkan viewport, asset import, scene save/load and single-frame export."],tasks:[["Підтвердити інструментальний стек","Validate the chosen toolchain"],["Перевірити Qt + Vulkan разом","Verify Qt and Vulkan integration"],["Відтворити експорт одного кадру","Reproduce single-frame export"]],type:"blocked"},
{short:["Редактор","Authoring"],name:["P2 · Інструменти автора","P2 · Authoring tools"],status:["ЗАПЛАНОВАНО","PLANNED"],desc:["Ієрархія сцени, інспектор, лабораторія шейдерів, матеріали, шкала часу й камери.","Scene hierarchy, inspector, shader laboratory, materials, timeline and cameras."],tasks:[["Граф сцени й інспектор","Scene graph and inspector"],["Матеріали та шейдери","Materials and shaders"],["Анімаційна шкала часу","Animation timeline"]],type:"future"},
{short:["Графіка","Visuals"],name:["P3 · Обчислювальна графіка","P3 · Visual computing"],status:["ЗАПЛАНОВАНО","PLANNED"],desc:["Частинки, фрактали, об’ємні ефекти, оптика та зовнішні фізичні чи наукові workers.","Particles, fractals, volumetrics, optics and external scientific/physics workers."],tasks:[["Фрактальна й процедурна геометрія","Fractal and procedural geometry"],["Об’ємні середовища й частинки","Volumetric effects and particles"],["Обмежені зовнішні симуляції","Bounded external simulations"]],type:"future"},
{short:["Продакшен","Production"],name:["P4 · Виробництво контенту","P4 · Content production"],status:["ЗАПЛАНОВАНО","PLANNED"],desc:["Синхронізація звуку, композитинг, офлайн-рендеринг, кодування та експорт відео.","Audio synchronization, compositing, offline rendering, encoding and video export."],tasks:[["Монтажна шкала й аудіо","Timeline and audio"],["Композитинг та колір","Compositing and color"],["Рендеринг і експорт","Rendering and export"]],type:"future"},
{short:["Екосистема","Ecosystem"],name:["P5 · Інтеграції та автоматизація","P5 · Integrations and automation"],status:["ЗАПЛАНОВАНО","PLANNED"],desc:["Плагіни, AI-генерація ресурсів, повторювані дії, пакування та оптимізація.","Plugins, AI asset generation, automation, packaging and optimization."],tasks:[["Безпечні інструменти агентів","Governed agent tools"],["Плагіни та інтеграції","Plugins and integrations"],["Пакування й оптимізація","Packaging and optimization"]],type:"future"},
{short:["Genesis","Genesis"],name:["P6 · Genesis Protocol","P6 · Genesis Protocol"],status:["ДОВГОСТРОКОВА МЕТА","LONG-TERM GOAL"],desc:["Спочатку інтегрований 30-секундний доказ можливостей; пізніше — приблизно 90-секундна кінематографічна послідовність.","First a 30-second integrated proof, followed by an approximately 90-second cinematic sequence."],tasks:[["Зібрати інтегрований демонстраційний зріз","Build the integrated demonstration"],["Перевірити відтворюваність і якість","Validate repeatability and quality"],["Підготувати кінематографічну сцену","Produce the cinematic sequence"]],type:"future"}
];
const nav=document.getElementById("mainNav");const target=document.getElementById("status");
if(nav){const a=document.createElement("a");a.href="#journey";a.id="navJourney";a.textContent="Розвиток";nav.insertBefore(a,nav.querySelector('a[href="#status"]'));}
const track=document.getElementById("roadmapTrack"),detail=document.getElementById("phaseDetail");
let selected=0,locale="uk",lastScroll=window.scrollY,raf=0;
function renderPhase(){
 if(!track)return;
 const idx=locale==="uk"?0:1;
 track.replaceChildren();
 phases.forEach((phase,n)=>{
   const b=document.createElement("button");b.type="button";b.className="phase-node is-"+phase.type;b.setAttribute("aria-pressed",String(n===selected));
   b.setAttribute("aria-label",phase.name[idx]);
   const circle=document.createElement("span");circle.className="phase-circle";circle.textContent="P"+n;
   const label=document.createElement("span");label.className="phase-name";label.textContent=phase.short[idx];
   b.append(circle,label);b.addEventListener("click",()=>{selected=n;renderPhase()});
   track.append(b);
 });
 const p=phases[selected];document.getElementById("phaseStatus").textContent=p.status[idx];
 document.getElementById("phaseTitle").textContent=p.name[idx];
 document.getElementById("phaseDescription").textContent=p.desc[idx];
 const list=document.getElementById("phaseTasks");list.replaceChildren();
 p.tasks.forEach(t=>{const li=document.createElement("li");li.textContent=t[idx];list.append(li)});
}
function refreshLocale(){
 locale=document.documentElement.lang==="en"?"en":"uk";
 const dict=uiText[locale];
 Object.keys(dict).forEach(k=>{
   const element=document.querySelector('[data-i="'+k+'"]');
   if(element)element.textContent=dict[k];
 });
 for(const k of ["journeyTitle"]){const element=document.querySelector('[data-html="'+k+'"]');if(element)element.innerHTML=dict[k]}
 const navLink=document.getElementById("navJourney");if(navLink)navLink.textContent=dict.navJourney;
 renderPhase();
}
new MutationObserver(refreshLocale).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});refreshLocale();
const sections=["top","studio","gallery","algorithms","ai","journey","status"];
function tick(){
 raf=0;
 const y=window.scrollY;
 if(progress){const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform="scaleX("+(max?Math.min(1,y/max):0)+")";}
 header?.classList.toggle("is-scrolled",y>35);
 let active="top";const pivot=window.innerHeight*.37+70;
 for(const id of sections){const node=document.getElementById(id);if(node && node.getBoundingClientRect().top<pivot)active=id}
 document.querySelectorAll(".nav-links a").forEach(a=>{const yes=a.getAttribute("href")==="#"+active;a.classList.toggle("is-active",yes);if(yes)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current")});
 if(!reduce() && heroPic){const visible=Math.max(0,1-y/Math.max(1,hero.offsetHeight));if(visible>0){heroPic.style.transform="translate3d(0,"+(Math.min(110,y*.16))+"px,0) scale(1.05)";hero.style.setProperty("--hero-opacity",visible.toFixed(2));}}
}
window.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(tick)},{passive:true});tick();
if(heroDust && !reduce()){for(let i=0;i<22;i++){const mote=document.createElement("i");mote.style.left=(4+(i*41)%92)+"%";mote.style.top=(18+(i*37)%75)+"%";mote.style.setProperty("--dur",(11+(i%7)*3)+"s");mote.style.setProperty("--delay",(-i*.95)+"s");heroDust.append(mote)}}
if(scrollTarget){scrollTarget.addEventListener("click",e=>{e.preventDefault();document.getElementById("studio")?.scrollIntoView({behavior:reduce()?"instant":"smooth",block:"start"})})}
document.querySelectorAll('a[href^="#"]').forEach(a=>{if(a===scrollTarget)return;a.addEventListener("click",e=>{const id=a.getAttribute("href").slice(1);const target=document.getElementById(id);if(!target)return;e.preventDefault();target.scrollIntoView({behavior:reduce()?"instant":"smooth",block:"start"})})});
if("IntersectionObserver"in window){
const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target)}}},{threshold:.10,rootMargin:"0px 0px -35px 0px"});
document.querySelectorAll(".more-info-grid .reveal,.chapter-index.reveal,.roadmap-panel.reveal").forEach(el=>revealObserver.observe(el));
}
})();