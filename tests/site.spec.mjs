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
  await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Створюй світи");
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
  await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Створюй світи");
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
 await expect(page.locator(".slide.active .gold-frame").first()).toHaveCSS("border-top-color","rgb(226, 186, 118)");
});
