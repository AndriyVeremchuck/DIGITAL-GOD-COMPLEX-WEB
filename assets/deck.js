(()=>{"use strict";
const byId=id=>document.getElementById(id);
const $=(q,root=document)=>root.querySelector(q);
const $$=(q,root=document)=>[...root.querySelectorAll(q)];
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const scenes=[
["01-celestial-city.jpg","Небесна столиця","Celestial City","Масштабна архітектура поміж хмар, водоспадів і високих мостів.","An expansive city among clouds, waterfalls and sky bridges."],
["02-crystal-sanctuary.jpg","Кришталеве святилище","Crystal Sanctuary","Камінь, складна геометрія кристалів і світлові об'єми.","Stone, intricate crystals and volumetric illumination."],
["03-angelic-android.jpg","Механічний янгол","Mechanical Angel","Кінематографічний персонаж із металевими крилами та складними матеріалами.","Cinematic character with mechanical wings and layered materials."],
["04-fractal-cosmos.jpg","Фрактальний космос","Fractal Cosmos","Рекурсивні структури, розсіювання світла й незвичний масштаб.","Recursive structures, atmospheric lighting and extraordinary scale."],
["05-portal-metropolis.jpg","Архітектура порталів","Portal Metropolis","Гігантський портал над фантастичним містом.","A colossal gateway towers above a fantastic city."],
["06-bioluminescent-cavern.jpg","Біолюмінесцентний світ","Bioluminescent World","Світні рослини, органічні арки, глибока атмосфера.","Luminous plants, organic arches and deep atmosphere."],
["07-celestial-guardian.jpg","Охоронець храму","Temple Guardian","Скульптурний образ, багатошарові матеріали, крила й світло.","Sculptural character, layered materials, wings and light."],
["08-orbital-fractal.jpg","Орбітальна сингулярність","Orbital Singularity","Сфери, енергетичні кільця, космічна перспектива.","Spheres, luminous rings and cosmic perspective."],
["09-floating-kingdom.jpg","Ширяюче королівство","Floating Kingdom","Сцена з висотними палацами, туманом і водоспадами.","Palaces above the clouds, mist and waterfalls."],
["10-menger-architecture.jpg","Математична архітектура","Mathematical Architecture","Структури, побудовані на геометричному повторенні й рекурсії.","Structures inspired by geometric repetition and recursion."],
["11-chronocrystal-garden.jpg","Хронокристалічний сад","Chronocrystal Garden","Кристали, годинникові мотиви та світлові потоки.","Crystals, clockwork motifs and luminous streams."],
["12-elemental-simulation.jpg","Буря стихій","Elemental Storm","Вода, вогонь, бризки й атмосфера грозового неба.","Water, fire, splashes and a stormy sky."],
["13-digital-characters.jpg","Цифрові персонажі","Digital Characters","Міміка, деталізовані матеріали та роботизовані елементи.","Expressions, detailed materials and robotic features."],
["14-sunken-civilization.jpg","Затонула цивілізація","Sunken Civilization","Підводні руїни, поглинання світла й стародавня скульптура.","Underwater ruins, light absorption and ancient sculpture."]
].map((s,i)=>({img:"assets/"+s[0],title:[s[1],s[2]],desc:[s[3],s[4]],no:i+1}));
const algorithms=[
["01-ray-path-tracing.jpg","Трасування променів + BVH","Ray / Path Tracing + BVH","Промені, віддзеркалення, освітлення та прискорення перетинів.","Light paths, reflections, illumination and accelerated intersections."],
["02-marching-cubes.jpg","Marching Cubes","Marching Cubes","Значення в об'ємі перетворюються на трикутну поверхню.","Scalar volume data becomes a triangle surface."],
["03-geometry-nodes-steps.jpg","Процедурне моделювання","Geometry Nodes","Параметри й вузли формують складні сцени без ручного повторення.","Nodes and parameters build complex scenes without manual repetition."],
["04-rigging-compositing-steps.jpg","Ріггінг і композитинг","Rigging & Compositing","Скелет, анімація та зведення кадру з окремих шарів.","Skeleton, animation and multi-layer image compositing."],
["05-pbr-materials-steps.jpg","PBR-матеріали","PBR Materials","Металічність, шорсткість, нормалі й реакція на світло.","Metallic response, roughness, normals and lighting."],
["06-fluids-steps.jpg","Симуляція рідин","Fluid Simulation","Потоки, краплі, піна та динаміка рідини.","Flows, droplets, foam and fluid dynamics."],
["07-volumetrics-steps.jpg","Об'ємне світло","Volumetric Lighting","Розсіювання і поглинання світла в тумані та хмарах.","Light scattering and absorption in fog and clouds."],
["08-fractals-steps.jpg","Фрактальна геометрія","Fractal Geometry","Рекурсивні правила створюють складні форми на різних масштабах.","Recursive rules generate complex shapes across scales."],
["09-sdf-raymarching-steps.jpg","SDF та Ray Marching","SDF & Ray Marching","Поле відстаней дозволяє процедурно знаходити поверхні.","Distance fields enable procedural surface searches."],
["10-destruction-physics-steps.jpg","Фізика руйнувань","Destruction Physics","Зіткнення, уламки, тверді тіла й частинки.","Collisions, debris, rigid bodies and particles."]
].map((s,i)=>({img:"assets/"+s[0],title:[s[1],s[2]],desc:[s[3],s[4]],no:i+1}));
const studios=[
["ui-01-dashboard.jpg","Креативний центр","Creative Hub","Єдиний проєкт, бібліотека ресурсів, дії та сценарії.","One project, asset library, actions and workflows."],
["ui-02-3d-workspace.jpg","3D-майстерня","3D Workspace","Моделі, сцени, матеріали, шейдери та джерела світла.","Models, scenes, materials, shaders and lighting."],
["ui-03-graphics.jpg","2D-графіка","2D Graphics","Живопис, шари, маски, композитинг і векторні елементи.","Painting, layers, masks, compositing and vector elements."],
["ui-04-editing.jpg","Монтаж і motion","Video & Motion","Часова шкала, звук, кольорокорекція та відео.","Timeline, audio, color grading and video editing."]
].map((s,i)=>({img:"assets/"+s[0],title:[s[1],s[2]],desc:[s[3],s[4]],no:i+1}));
const phases=[
{title:["P0 · Архітектура","P0 · Architecture"],status:["ПОТОЧНИЙ ЕТАП","CURRENT PHASE"],detail:["Дослідження, ADR, вимоги, контракти, безпека та технічні перевірки.","Research, ADRs, requirements, contracts, security and technical validation."],tasks:[["Документація та перевірки — у роботі","Documentation and validation in progress"],["Прийняття всієї архітектури — попереду","Full architecture acceptance pending"]]},
{title:["P1 · Вертикальний зріз","P1 · Vertical slice"],status:["ЗАБЛОКОВАНО ДО ПРИЙНЯТТЯ P0","BLOCKED UNTIL P0 ACCEPTED"],detail:["Qt-вікно, Vulkan viewport, імпорт ресурсу, збереження сцени й експорт кадру.","Qt window, Vulkan viewport, asset import, scene storage and frame export."],tasks:[["Інтеграційний прототип","Integration prototype"],["Відтворювані тести та експорт","Reproducible tests and export"]]},
{title:["P2 · Редактор","P2 · Authoring"],status:["ЗАПЛАНОВАНО","PLANNED"],detail:["Ієрархія сцени, інспектор, шейдери, матеріали, таймлайн і камера.","Scene hierarchy, inspector, shaders, materials, timeline and cameras."],tasks:[["Редагування структури сцени","Scene structure editing"],["Матеріали та анімація","Materials and animation"]]},
{title:["P3 · Обчислювальна графіка","P3 · Visual computing"],status:["ЗАПЛАНОВАНО","PLANNED"],detail:["Частинки, фрактали, об'ємні ефекти, оптика та фізичні workers.","Particles, fractals, volumetrics, optics and physics workers."],tasks:[["Процедурні сцени","Procedural scenes"],["Оптика й симуляція","Optics and simulation"]]},
{title:["P4 · Продакшен","P4 · Production"],status:["ЗАПЛАНОВАНО","PLANNED"],detail:["Звук, монтаж, композитинг, офлайн-рендеринг та експорт відео.","Audio, editing, compositing, offline rendering and video export."],tasks:[["Композиція кадру","Frame composition"],["Експорт із контролем якості","Quality-controlled export"]]},
{title:["P5 · Екосистема","P5 · Ecosystem"],status:["ЗАПЛАНОВАНО","PLANNED"],detail:["Плагіни, AI-ресурси, автоматизація, оптимізація й пакування.","Plugins, AI assets, automation, optimization and packaging."],tasks:[["Безпечна автоматизація","Secure automation"],["Плагіни та збірки","Plugins and builds"]]},
{title:["P6 · Genesis Protocol","P6 · Genesis Protocol"],status:["ДОВГОСТРОКОВА МЕТА","LONG-TERM GOAL"],detail:["Інтегрований 30-секундний доказ можливостей, далі — близько 90 секунд кінематографічної сцени.","A 30-second integrated proof, followed by roughly 90 seconds of cinematic content."],tasks:[["Об'єднання модулів","Module integration"],["Кінематографічний демонстраційний проєкт","Cinematic demonstration project"]]}
];
const i18n={
uk:{nav:["Головна","Студія","Галерея","Технології","AI","План","Проєкт"],back:"← Назад",next:"Далі →",finish:"На початок ↻",position:"СЛАЙД",eyebrow:"ЦИФРОВА СТУДІЯ МАЙБУТНЬОГО",heroTitle:"Створюй світи <em>без меж.</em>",heroDesc:"3D · 2D · CGI · анімація · VFX · монтаж · штучний інтелект. Єдиний простір для великих ідей.",heroCTA:"Відкрити презентацію ↗",heroNote:"Концепція DIGITAL GOD COMPLEX. CGI-зображення — художні приклади, не кадри з готового застосунку.",stripeHint:"Натисни на косу смугу — зміни світ",overviewTitle:"Одна студія. <em>Тисячі можливостей.</em>",overviewDesc:"Не десяток розрізнених програм, а спільна творча система. Це запланована архітектура майбутнього продукту.",features:[["3D / ПРОЦЕДУРИ","Моделі, сцени, матеріали, геометричні вузли, фрактали, скульптинг."],["2D / VFX","Малювання, шари, маски, композитинг та ефекти."],["ВІДЕО / ЗВУК","Таймлайн, анімація, монтаж, кольорокорекція, експорт."],["ШТУЧНИЙ ІНТЕЛЕКТ","Керовані команди редактора, автоматизація й допомога художнику."],["ОБЧИСЛЕННЯ","Трасування променів, об'ємне світло, фізика й процедурні об'єкти."],["ІНЖЕНЕРІЯ","Перевірені контракти, безпека, відтворюваність і тестування."]],studioTitle:"Майбутні <em>інструменти студії.</em>",studioDesc:"Чотири концепти інтерфейсу, спроєктовані як частини єдиного робочого середовища.",galleryTitle:"Галерея <em>створених світів.</em>",galleryDesc:"14 кінематографічних ідей. Натисни на картку для перегляду на весь екран.",algTitle:"Від мистецтва <em>до математики.</em>",algDesc:"10 технологій комп'ютерної графіки. У кожній картці — наочні етапи та візуальна ідея.",aiTitle:"Майбутній ШІ — <em>партнер художника.</em>",aiDesc:"Агент пропонуватиме дії, пояснюватиме інструменти та допомагатиме будувати складні творчі процеси.",aiFeatures:["Команди лише з дозволами й перевіркою","Контрольована історія змін і можливість скасування","Локальні моделі та необов'язкові хмарні інтеграції","Людина відповідає за остаточні рішення"],roadTitle:"План розвитку <em>P0–P6.</em>",roadDesc:"Обирай етап на часовій шкалі. Відсотків немає — тільки документовані залежності й реальні статуси.",statusTitle:"Велика ідея. <em>Точна інженерія.</em>",statusDesc:"DIGITAL GOD COMPLEX перебуває на PHASE 0. Це архітектура, дослідження й контрольовані прототипи, а не випущена творча система.",statusNote:"Увага: усі CGI-сцени та UI-макети — AI-концепти. Не є скриншотами працюючого рушія або підтвердженням завершеної реалізації.",statusFacts:["C++23 / Qt 6 / Vulkan — цільові технології","Linux-first перевірка","Безпека та якість із першої фази","Двомовна документація: УКР / EN"],openOriginal:"Натисни знову або Esc, щоб закрити"},
en:{nav:["Home","Studio","Gallery","Technology","AI","Roadmap","Project"],back:"← Previous",next:"Next →",finish:"Restart ↻",position:"SLIDE",eyebrow:"A CREATIVE STUDIO OF TOMORROW",heroTitle:"Create worlds <em>without limits.</em>",heroDesc:"3D · 2D · CGI · animation · VFX · editing · artificial intelligence. One space for bold ideas.",heroCTA:"Explore the presentation ↗",heroNote:"DIGITAL GOD COMPLEX is a concept. CGI imagery is artwork, not renders from a working application.",stripeHint:"Click a diagonal panel to change its world",overviewTitle:"One studio. <em>Thousands of possibilities.</em>",overviewDesc:"Not a dozen disconnected apps, but one creative system. This is the intended architecture of a future product.",features:[["3D / PROCEDURAL","Models, scenes, materials, nodes, fractals and sculpting."],["2D / VFX","Painting, layers, masks, compositing and visual effects."],["VIDEO / AUDIO","Timeline, animation, editing, grading and export."],["ARTIFICIAL INTELLIGENCE","Authorized editor commands, automation and artistic assistance."],["VISUAL COMPUTING","Ray tracing, volumetrics, physics and procedural objects."],["ENGINEERING","Validated contracts, security, reproducibility and tests."]],studioTitle:"The future <em>creative workspace.</em>",studioDesc:"Four interface concepts designed as one integrated environment.",galleryTitle:"Gallery of <em>imagined worlds.</em>",galleryDesc:"14 cinematic ideas. Click any image to view it full-screen.",algTitle:"From art <em>to mathematics.</em>",algDesc:"Ten computer-graphics technologies, each illustrated with visual stages and concepts.",aiTitle:"Future AI — <em>the artist's partner.</em>",aiDesc:"An agent could explain tools, propose actions and automate complex creative workflows.",aiFeatures:["Commands governed by permissions and validation","Auditable changes and undo support","Local models and optional cloud integrations","The human stays in control"],roadTitle:"Roadmap <em>P0–P6.</em>",roadDesc:"Select a stage on the timeline. No invented percentages — only documented dependencies and qualitative status.",statusTitle:"Ambitious vision. <em>Disciplined engineering.</em>",statusDesc:"DIGITAL GOD COMPLEX is at PHASE 0: architecture, research and controlled prototypes — not a shipped creative suite.",statusNote:"All CGI art and interface images are AI-generated concepts, not evidence of a working DGC renderer or completed product.",statusFacts:["C++23 / Qt 6 / Vulkan — targeted technologies","Linux-first validation","Security and quality from phase one","Bilingual documentation: UKR / EN"],openOriginal:"Click again or press Esc to close"}
};
let lang="uk",slides=[],current=0,animating=false,chosenPhase=0,groupSize=2,autocycle=0,cycleTimer=null,lastGlow=null,glowTimer=null;
const deck=byId("slides"),topnav=byId("topnav"),counter=byId("counter"),prev=byId("prev"),next=byId("next");
function t(){return i18n[lang]}function ix(){return lang==="uk"?0:1}
function elem(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function append(parent,...nodes){parent.append(...nodes);return parent}
function segment(key,page=0){return {key,page}}
function chunks(arr,step){let c=[];for(let i=0;i<arr.length;i+=step)c.push(arr.slice(i,i+step));return c}
function makeSlide(key,page,build,hero=false){
 const outer=elem("section","slide"+(hero?" hero":""));
 outer.id=key+(page?"-"+page:"");outer.dataset.chapter=key;outer.dataset.page=String(page);outer.setAttribute("aria-label",t().nav[{"home":0,"overview":1,"studio":1,"gallery":2,"algorithms":3,"ai":4,"roadmap":5,"status":6}[key]]);
 const wrap=elem("div","slide-wrap"),inner=elem("div","slide-body");wrap.append(inner);outer.append(wrap);build(inner,outer);deck.append(outer);slides.push({key,page,node:outer,inner});return outer;
}
function heading(parent,kicker,title,desc){append(parent,elem("div","slide-identity",kicker));const h=elem("h2","slide-title");h.innerHTML=title;append(parent,h);if(desc)append(parent,elem("p","slide-desc",desc))}
function makeCard(s,number){const b=elem("button","visual-card");b.type="button";b.setAttribute("aria-label",s.title[ix()]);const media=elem("div","media"),img=elem("img");img.src=s.img;img.alt=s.title[ix()];img.loading="lazy";img.decoding="async";const num=elem("span","number",String(number).padStart(2,"0"));media.append(img,num);const data=elem("div","data");data.append(elem("h3","",s.title[ix()]),elem("p","",s.desc[ix()]));b.append(media,data);b.addEventListener("click",()=>openViewer(s.img,s.title[ix()]));return b}
function drawCards(kind,items,page,total){
 makeSlide(kind,page,(parent)=>{
  const isStudio=kind==="studio",isAlgorithms=kind==="algorithms";heading(parent,(kind==="gallery"?"ART GALLERY":kind==="studio"?"CREATIVE WORKSPACE":"ART × PHYSICS")+" · "+String(page+1).padStart(2,"0")+" / "+String(total).padStart(2,"0"),
    isStudio?t().studioTitle:isAlgorithms?t().algTitle:t().galleryTitle,
    isStudio?t().studioDesc:isAlgorithms?t().algDesc:t().galleryDesc);
  const grid=elem("div","visual-grid two"+(isAlgorithms?" tech-grid":""));items.forEach(s=>grid.append(makeCard(s,s.no)));parent.append(grid);
 });
}
function intro(){
 makeSlide("home",0,(parent,outer)=>{
  const stripes=elem("div","hero-stripes");stripes.id="stripes";stripes.setAttribute("role","group");stripes.setAttribute("aria-label",t().stripeHint);outer.insertBefore(stripes,outer.firstChild);
  const hint=elem("div","stripe-tip",t().stripeHint);outer.append(hint);
  append(parent,elem("div","slide-identity",t().eyebrow));
  const h=elem("h1");h.innerHTML=t().heroTitle;parent.append(h,elem("p","",t().heroDesc));
  const actions=elem("div","hero-actions"),cta=elem("button","action primary",t().heroCTA);cta.addEventListener("click",()=>go(1));actions.append(cta);parent.append(actions,elem("p","hero-warning",t().heroNote));
  buildStripes(stripes);
 });
}
const stripeSrc=["05-portal-metropolis.jpg","08-orbital-fractal.jpg","07-celestial-guardian.jpg","12-elemental-simulation.jpg","01-celestial-city.jpg","14-sunken-civilization.jpg","10-menger-architecture.jpg","11-chronocrystal-garden.jpg","03-angelic-android.jpg","06-bioluminescent-cavern.jpg","13-digital-characters.jpg","04-fractal-cosmos.jpg"];
function buildStripes(root){
 for(let i=0;i<5;i++){const button=elem("button","stripe");button.type="button";button.dataset.slot=String(i);button.dataset.src=String(i);button.setAttribute("aria-label",t().stripeHint+" "+(i+1));const a=elem("img","stripe-image current"),b=elem("img","stripe-image next");a.src="assets/"+stripeSrc[i];a.alt="";b.alt="";button.append(a,b);button.addEventListener("pointerenter",()=>{root.querySelectorAll(".stripe").forEach(x=>x.classList.remove("chosen"));button.classList.add("chosen")});button.addEventListener("click",()=>rotateStripe(button));root.append(button)}
}
function rotateStripe(button){
 if(button.dataset.busy==="1")return;
 let nextIndex=(Number(button.dataset.src)+5+autocycle%4)%stripeSrc.length;
 if(nextIndex===Number(button.dataset.src))nextIndex=(nextIndex+1)%stripeSrc.length;
 button.dataset.busy="1";const image=new Image();const path="assets/"+stripeSrc[nextIndex];image.onload=()=>{
 const old=$(".current",button),up=$(".next",button);
 up.src=path;up.style.opacity="1";
 const done=()=>{old.src=path;up.style.opacity="0";button.dataset.src=String(nextIndex);button.dataset.busy="0";old.style.opacity="1"};
 if(reduce())done();else setTimeout(done,1350);
 };image.onerror=()=>{button.dataset.busy="0"};image.src=path;
}
function overview(){
 makeSlide("overview",0,parent=>{
 heading(parent,"A CREATIVE UNIVERSE",t().overviewTitle,t().overviewDesc);
 const grid=elem("div","feature-grid");
 for(let i=0;i<6;i++){const f=elem("article","panel feature");f.append(elem("span","glyph",["◈","✦","◉","◇","∞","✧"][i]),elem("h3","",t().features[i][0]),elem("p","",t().features[i][1]));grid.append(f)}
 parent.append(grid);
 });
}
function ai(){
 makeSlide("ai",0,parent=>{
 heading(parent,"AI × ARTIST",t().aiTitle,t().aiDesc);
 const layout=elem("div","ai-layout"),art=elem("div","panel ai-art"),img=elem("img");img.src="assets/13-digital-characters.jpg";img.alt="AI concept";art.append(img);
 const copy=elem("div","panel ai-copy");t().aiFeatures.forEach((s,i)=>{const p=elem("p");p.textContent=["◈ ","◇ ","✧ ","✦ "][i]+s;copy.append(p)});
 layout.append(art,copy);parent.append(layout,elem("div","notice",t().statusNote));
 });
}
function roadmap(){
 makeSlide("roadmap",0,parent=>{
 heading(parent,"ENGINEERING ROADMAP",t().roadTitle,t().roadDesc);
 const timeline=elem("div","timeline");timeline.id="phaseTimeline";for(let i=0;i<7;i++){const b=elem("button",i===chosenPhase?"current":"", "P"+i);b.type="button";b.setAttribute("aria-pressed",String(i===chosenPhase));b.addEventListener("click",()=>{chosenPhase=i;renderPhase()});timeline.append(b)}
 const details=elem("div","panel phase-details");details.id="phaseDetails";parent.append(timeline,details,elem("div","notice",t().statusNote));renderPhase();
 });
}
function renderPhase(){
 const details=byId("phaseDetails");if(!details)return;
 const ph=phases[chosenPhase];details.replaceChildren(elem("div","phase-status",ph.status[ix()]),elem("h3","",ph.title[ix()]),elem("p","",ph.detail[ix()]));
 const ul=elem("ul");ph.tasks.forEach(x=>ul.append(elem("li","",x[ix()])));details.append(ul);
 $$("#phaseTimeline button").forEach((b,i)=>{b.classList.toggle("current",i===chosenPhase);b.setAttribute("aria-pressed",String(i===chosenPhase))});
}
function status(){
 makeSlide("status",0,parent=>{
 heading(parent,"PHASE 0 · CURRENT STATUS",t().statusTitle,t().statusDesc);
 const facts=elem("div","feature-grid");t().statusFacts.forEach((s,i)=>{let a=elem("article","panel feature");a.append(elem("span","glyph",["01","02","03","04"][i]),elem("h3","",["TECH","PLATFORM","QUALITY","LANGUAGE"][i]),elem("p","",s));facts.append(a)});
 parent.append(facts,elem("div","notice",t().statusNote));
 });
}
function preferredGroup(){const vh=window.innerHeight;return window.innerWidth<800||vh<640?1:2}
function renderSlides(preserve){
 const old=slides[current]||null;const key=preserve?.key||old?.key||"home",page=preserve?.page??old?.page??0;
 groupSize=preferredGroup();deck.replaceChildren();slides=[];
 intro();overview();chunks(studios,groupSize).forEach((s,i,a)=>drawCards("studio",s,i,a.length));
 chunks(scenes,groupSize).forEach((s,i,a)=>drawCards("gallery",s,i,a.length));
 chunks(algorithms,groupSize).forEach((s,i,a)=>drawCards("algorithms",s,i,a.length));
 ai();roadmap();status();
 let newIdx=slides.findIndex(x=>x.key===key&&x.page===page);
 if(newIdx<0)newIdx=slides.findIndex(x=>x.key===key);
 current=Math.max(0,newIdx);
 slides[current].node.classList.add("active");slides.forEach((s,i)=>s.node.setAttribute("aria-hidden",String(i!==current)));
 renderPhase();
 updateUI();
}
function go(i){
 if(i<0||i>=slides.length||i===current||animating||byId("viewer").classList.contains("open"))return;
 animating=true;const from=slides[current],to=slides[i];
 from.node.classList.remove("active");from.node.classList.toggle("exit-up",i>current);from.node.setAttribute("aria-hidden","true");
 to.node.classList.remove("exit-up");to.node.classList.add("active");to.node.setAttribute("aria-hidden","false");to.inner.scrollTop=0;
 current=i;updateUI();history.replaceState(null,"","#"+to.key+(to.page?"-"+(to.page+1):""));
 setTimeout(()=>{from.node.classList.remove("exit-up");animating=false},reduce()?25:820);
}
function goChapter(key){const i=slides.findIndex(x=>x.key===key);if(i>=0)go(i)}
function updateUI(){
 const labels=t().nav,keys=["home","studio","gallery","algorithms","ai","roadmap","status"];
 $$("#topnav button").forEach((b,i)=>{b.textContent=labels[i];b.classList.toggle("active",i===keys.indexOf(slides[current].key)||(slides[current].key==="overview"&&i===1));b.setAttribute("aria-current",b.classList.contains("active")?"page":"false")});
 $$(".language button").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
 prev.textContent=t().back;next.textContent=current===slides.length-1?t().finish:t().next;
 prev.disabled=current===0;counter.querySelector("strong").textContent=t().position+" "+String(current+1).padStart(2,"0")+" / "+String(slides.length).padStart(2,"0");
 byId("progress").style.width=(100*(current+1)/slides.length).toFixed(2)+"%";
}
function openViewer(src,title){const viewer=byId("viewer");byId("viewerImage").src=src;byId("viewerCaption").textContent=title;viewer.classList.add("open");viewer.setAttribute("aria-hidden","false");byId("viewerClose").focus()}
function closeViewer(){const viewer=byId("viewer");viewer.classList.remove("open");viewer.setAttribute("aria-hidden","true");byId("viewerImage").src=""}
function glow(){
 if(reduce()||document.hidden)return;
 const nodes=$$(".slide.active .visual-card,.slide.active .feature,.slide.active .stat,.slide.active .phase-details");
 if(!nodes.length)return;
 const choices=nodes.filter(n=>n!==lastGlow);const target=choices[Math.floor(Math.random()*choices.length)]||nodes[0];lastGlow=target;
 let span=$(".edge-glint",target);if(!span){span=elem("span","edge-glint");target.append(span)}
 span.style.setProperty("--angle",Math.floor(Math.random()*360)+"deg");span.classList.remove("on");void span.offsetWidth;span.classList.add("on");
}
const prevButton=byId("prev"),nextButton=byId("next");prevButton.addEventListener("click",()=>go(current-1));nextButton.addEventListener("click",()=>go(current===slides.length-1?0:current+1));
const keys=["home","studio","gallery","algorithms","ai","roadmap","status"];
$$(".topnav button").forEach((b,i)=>b.addEventListener("click",()=>goChapter(keys[i])));
$$(".language button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;document.documentElement.lang=lang;const s=slides[current];renderSlides(s);try{localStorage.setItem("dgc.lang",lang)}catch(e){}}));
byId("viewerClose").addEventListener("click",closeViewer);byId("viewerImage").addEventListener("click",closeViewer);byId("viewer").addEventListener("click",e=>{if(e.target===byId("viewer"))closeViewer()});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"){closeViewer();return}
 if(e.target instanceof HTMLElement&&["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;
 if(["ArrowRight","ArrowDown","PageDown"].includes(e.key)){e.preventDefault();go(current+1)}
 if(["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){e.preventDefault();go(current-1)}
 if(e.key==="Home"){e.preventDefault();go(0)}
 if(e.key==="End"){e.preventDefault();go(slides.length-1)}
});
let wheelLock=0;
deck.addEventListener("wheel",e=>{
 if(byId("viewer").classList.contains("open"))return;
 const inner=slides[current]?.inner;
 if(inner&&inner.scrollHeight>inner.clientHeight+4){
 const atTop=inner.scrollTop<=2,atEnd=inner.scrollTop+inner.clientHeight>=inner.scrollHeight-2;
 if((e.deltaY>0&&!atEnd)||(e.deltaY<0&&!atTop))return;
 }
 e.preventDefault();const now=performance.now();if(now-wheelLock<1000||Math.abs(e.deltaY)<12)return;
 wheelLock=now;go(current+(e.deltaY>0?1:-1));
},{passive:false});
let yStart=null,xStart=null;
deck.addEventListener("touchstart",e=>{if(e.touches.length!==1)return;yStart=e.touches[0].clientY;xStart=e.touches[0].clientX},{passive:true});
deck.addEventListener("touchend",e=>{if(yStart===null||!e.changedTouches.length)return;const dy=e.changedTouches[0].clientY-yStart,dx=e.changedTouches[0].clientX-xStart;yStart=null;xStart=null;
 if(Math.abs(dy)<65||Math.abs(dx)>Math.abs(dy)*.75)return;
 const inner=slides[current].inner;if(inner.scrollHeight>inner.clientHeight+4){if(dy<0&&inner.scrollTop+inner.clientHeight<inner.scrollHeight-3)return;if(dy>0&&inner.scrollTop>3)return}
 go(current+(dy<0?1:-1));
},{passive:true});
let resizeTimeout;
window.addEventListener("resize",()=>{clearTimeout(resizeTimeout);resizeTimeout=setTimeout(()=>{if(preferredGroup()!==groupSize){const s=slides[current];renderSlides(s)}},250)});
try{if(localStorage.getItem("dgc.lang")==="en")lang="en"}catch(e){}
document.documentElement.lang=lang;
renderSlides();
const hash=location.hash.slice(1);if(hash){const i=slides.findIndex(s=>s.node.id===hash||s.key===hash);if(i>=0){slides[current].node.classList.remove("active");current=i;slides[current].node.classList.add("active");updateUI()}}
cycleTimer=setInterval(()=>{if(slides[current]?.key!=="home"||document.hidden||reduce())return;const bs=$$(".hero.active .stripe");if(bs.length){rotateStripe(bs[autocycle%5]);autocycle++}},5500);
glowTimer=setInterval(glow,3600);
})();