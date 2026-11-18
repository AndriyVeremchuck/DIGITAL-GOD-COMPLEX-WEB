import { test, expect } from "@playwright/test";
test("landing renders and every diagonal control changes the full background", async ({page}) => {
  const errors=[];
  page.on("pageerror", e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:8787/",{waitUntil:"domcontentloaded"});
  const stripes=page.locator(".hero.active .stripe");
  await expect(stripes).toHaveCount(5);
  const hero=page.locator(".hero.active");
  await expect(hero.locator(".hero-backdrop .is-current")).toHaveAttribute("src",/portal-metropolis/);
  await stripes.nth(1).click();
  await expect(hero.locator(".hero-backdrop .is-current")).toHaveAttribute("src",/orbital-fractal/,{timeout:6000});
  await expect(stripes.nth(1)).toHaveAttribute("aria-pressed","true");
  await stripes.nth(2).click();
  await expect(hero.locator(".hero-backdrop .is-current")).toHaveAttribute("src",/celestial-guardian/,{timeout:6000});
  await expect(errors).toEqual([]);
});
test("desktop first slide is one viewport, navigation works",async({page})=>{
  await page.setViewportSize({width:1728,height:864});
  await page.goto("http://127.0.0.1:8787/");
  await expect(page.locator(".hero.active .hero-title-main")).toBeVisible();
  await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
  await page.locator("#next").click();
  await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","overview");
  await page.locator("#prev").click();
  await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","home");
});
test("language switch works",async({page})=>{
  await page.goto("http://127.0.0.1:8787/");
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
  await page.locator('[data-lang="uk"]').click();
  await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
});

test("hero fills the entire slide without a blank lower half",async({page})=>{
 await page.setViewportSize({width:1728,height:864});
 await page.goto("http://127.0.0.1:8787/");
 const metrics=await page.locator(".hero.active").evaluate(hero=>{
  const slide=hero.getBoundingClientRect();
  const bg=hero.querySelector(".hero-backdrop").getBoundingClientRect();
  const navigation=document.querySelector(".topbar").getBoundingClientRect();
  const footer=document.querySelector(".controlbar").getBoundingClientRect();
  return {slideTop:slide.top,slideBottom:slide.bottom,bgTop:bg.top,bgBottom:bg.bottom,headerBottom:navigation.bottom,footerTop:footer.top};
 });
 expect(Math.abs(metrics.slideTop-metrics.headerBottom)).toBeLessThanOrEqual(2);
 expect(Math.abs(metrics.slideBottom-metrics.footerTop)).toBeLessThanOrEqual(2);
 expect(Math.abs(metrics.bgTop-metrics.slideTop)).toBeLessThanOrEqual(2);
 expect(Math.abs(metrics.bgBottom-metrics.slideBottom)).toBeLessThanOrEqual(2);
});
test("click produces actual horizontal drum motion before image replacement",async({page})=>{
 await page.emulateMedia({reducedMotion:"no-preference"});
 await page.setViewportSize({width:1728,height:864});
 await page.goto("http://127.0.0.1:8787/");
 const stripe=page.locator(".hero.active .stripe").nth(1);
 await stripe.click();
 await expect.poll(()=>page.locator(".hero.active .backdrop-image.is-current").evaluate(el=>el.getAnimations().length),{timeout:3500}).toBeGreaterThan(0);
 const shifts=await page.locator(".hero.active").evaluate(hero=>{
  const frames=[...hero.querySelectorAll(".backdrop-image")];
  return frames.map(img=>({src:img.getAttribute("src"),animations:img.getAnimations().map(a=>({state:a.playState,currentTime:a.currentTime,duration:a.effect?.getTiming().duration}))}));
 });
 expect(shifts.every(x=>x.animations.some(a=>a.state==="running"&&a.duration>=1000))).toBeTruthy();
 await expect(page.locator(".hero.active .backdrop-image.is-current")).toHaveAttribute("src",/orbital-fractal/,{timeout:5000});
});


test("five fixed CGI thumbnails, correct selection, golden borders",async({page})=>{
 await page.goto("http://127.0.0.1:8787/");
 const buttons=page.locator(".hero.active .stripe");
 const bg=page.locator(".hero.active .backdrop-image.is-current");
 await expect(buttons).toHaveCount(5);
 const originals=await buttons.locator("img").evaluateAll(nodes=>nodes.map(n=>n.getAttribute("src")));
 await buttons.nth(2).click();
 await expect(bg).toHaveAttribute("src",/celestial-guardian/,{timeout:6500});
 await expect(buttons.nth(2)).toHaveAttribute("aria-pressed","true");
 await expect(buttons.nth(0)).toHaveAttribute("aria-pressed","false");
 await expect(buttons.nth(2)).toHaveClass(/chosen/);
 await buttons.nth(0).click();
 await expect(bg).toHaveAttribute("src",/portal-metropolis/,{timeout:6500});
 await buttons.nth(0).click();
 await expect(bg).toHaveAttribute("src",/portal-metropolis/,{timeout:6500});
 await expect(buttons.locator("img").evaluateAll(nodes=>nodes.map(n=>n.getAttribute("src")))).resolves.toEqual(originals);
 await page.locator("#next").click();
 await expect(page.locator(".slide.active .gold-frame")).toHaveCount(6);
 await expect(page.locator(".slide.active .gold-frame").first()).toHaveCSS("border-top-style","solid");
});


test("selected stripe is twice as wide and its art slowly zooms in",async({page})=>{
 await page.emulateMedia({reducedMotion:"no-preference"});
 await page.setViewportSize({width:1728,height:864});
 await page.goto("http://127.0.0.1:8787/");
 const stripes=page.locator(".hero.active .stripe");
 await expect(stripes).toHaveCount(5);
 await expect.poll(async()=>{const first=await stripes.nth(0).boundingBox(),second=await stripes.nth(1).boundingBox();return first.width/second.width;},{timeout:4000}).toBeGreaterThan(1.75);
 const img=stripes.nth(0).locator(".stripe-image");
 const animation=await img.evaluate(el=>el.getAnimations().map(a=>({duration:a.effect?.getTiming().duration,playState:a.playState})));
 expect(animation.some(a=>a.duration>=8000&&a.playState==="running")).toBeTruthy();
 await stripes.nth(2).click();
 await expect(stripes.nth(2)).toHaveAttribute("aria-pressed","true");
 await expect.poll(async()=>{
  const active=await stripes.nth(2).boundingBox(),other=await stripes.nth(0).boundingBox();
  return active.width/other.width;
 },{timeout:3000}).toBeGreaterThan(1.75);
 expect(await stripes.nth(2).locator(".stripe-random-glint").count()).toBe(1);
});

test("hovering a new CGI strip selects it and moves the full background",async({page})=>{
 await page.emulateMedia({reducedMotion:"no-preference"});
 await page.goto("http://127.0.0.1:8787/");
 const stripes=page.locator(".hero.active .stripe");
 const bg=page.locator(".hero.active .backdrop-image.is-current");
 await stripes.nth(3).hover({force:true});
 await expect(bg).toHaveAttribute("src",/elemental-simulation/,{timeout:6000});
 await expect(stripes.nth(3)).toHaveAttribute("aria-pressed","true");
 await expect(stripes.nth(3).locator("img")).toHaveAttribute("src",/elemental-simulation/);
 await stripes.nth(1).hover({force:true});
 await expect(bg).toHaveAttribute("src",/orbital-fractal/,{timeout:6000});
 await expect(stripes.nth(1)).toHaveAttribute("aria-pressed","true");
});
test("hero has no opaque frame covering the CGI image",async({page})=>{
 await page.goto("http://127.0.0.1:8787/");
 const card=page.locator(".hero.active .hero-story");
 await expect(card).toHaveCSS("border-top-style","none");
 await expect(card).toHaveCSS("backdrop-filter","none");
 await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
 await expect(page.locator(".hero.active .hero-intro")).toContainText("unified digital studio");
 await expect(page.locator(".hero.active .hero-extra")).toHaveCount(0);
});


test("switching strips animates both outgoing and incoming widths",async({page})=>{
 await page.emulateMedia({reducedMotion:"no-preference"});
 await page.setViewportSize({width:1728,height:864});
 await page.goto("http://127.0.0.1:8787/");
 const old=page.locator(".hero.active .stripe").nth(0);
 const next=page.locator(".hero.active .stripe").nth(2);
 await expect.poll(async()=>{
  const a=await old.boundingBox(),b=await next.boundingBox();
  return a.width/b.width;
 },{timeout:4000}).toBeGreaterThan(1.75);
 await next.hover({force:true});
 await expect(next).toHaveClass(/chosen/);
 await expect(old).not.toHaveClass(/chosen/);
 const animations=await page.locator(".hero.active").evaluate(hero=>[0,2].map(i=>{
  const el=hero.querySelectorAll(".stripe")[i];
  return el.getAnimations().filter(a=>a.playState==="running").map(a=>a.effect?.getTiming().duration);
 }));
 expect(animations[0].some(d=>d>=1500)).toBeTruthy();
 expect(animations[1].some(d=>d>=1500)).toBeTruthy();
 await expect.poll(async()=>{
  const a=await old.boundingBox(),b=await next.boundingBox();
  return b.width/a.width;
 },{timeout:4000}).toBeGreaterThan(1.75);
});
test("no black extruded typography on the hero title",async({page})=>{
 await page.goto("http://127.0.0.1:8787/");
 const title=page.locator(".hero.active .hero-title-main");
 await expect(title).toHaveText("Create worlds");
 await expect(title).toHaveCSS("-webkit-text-stroke-width","0px");
 const font=await title.evaluate(el=>getComputedStyle(el).fontFamily);
 expect(font).toContain("Oxanium");
});

test("five-strip rack is 20 percent narrower and smoothly transfers width",async({page})=>{
 await page.setViewportSize({width:1728,height:864});
 await page.emulateMedia({reducedMotion:"no-preference"});
 await page.goto("http://127.0.0.1:8787/");
 const rack=page.locator(".hero.active .hero-stripes");
 const rackBox=await rack.boundingBox();
 expect(rackBox.width).toBeGreaterThanOrEqual(250);
 expect(rackBox.width).toBeLessThanOrEqual(275);
 const buttons=page.locator(".hero.active .stripe");
 await expect.poll(async()=>{
   const a=await buttons.nth(0).boundingBox(),b=await buttons.nth(1).boundingBox();
   return a.width/b.width;
 },{timeout:5000}).toBeGreaterThan(1.75);
 await buttons.nth(3).hover({force:true});
 const states=await buttons.evaluateAll(els=>[0,3].map(i=>{
   const el=els[i];
   return {duration:getComputedStyle(el).transitionDuration,animations:el.getAnimations().filter(a=>a.playState==="running").map(a=>a.effect?.getTiming().duration)};
 }));
 expect(states[0].animations.some(v=>v>=2000)).toBeTruthy();
 expect(states[1].animations.some(v=>v>=2000)).toBeTruthy();
 await expect.poll(async()=>{
  const a=await buttons.nth(0).boundingBox(),b=await buttons.nth(3).boundingBox();
  return b.width/a.width;
 },{timeout:5000}).toBeGreaterThan(1.75);
});
