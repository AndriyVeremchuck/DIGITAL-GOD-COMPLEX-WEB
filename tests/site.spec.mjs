import { test, expect } from "@playwright/test";
const base="http://127.0.0.1:8787/";
test("hero has a canvas and exactly five fixed shader mode selectors",async({page})=>{
 const errors=[];page.on("pageerror",err=>errors.push(err.message));
 await page.goto(base);
 await expect(page.locator(".hero.active .hero-shader")).toHaveCount(1);
 await expect(page.locator(".hero.active .shader-selectors .stripe")).toHaveCount(5);
 await expect(page.locator(".hero.active .shader-selectors img")).toHaveCount(0);
 await expect(page.locator(".hero.active .hero-backdrop .shader-fallback")).toHaveCount(1);
 await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
 expect(errors).toEqual([]);
});
test("CGI modes change ONLY on click, not hover or focus",async({page})=>{
 await page.goto(base);
 const buttons=page.locator(".hero.active .shader-selectors .stripe");
 await expect(buttons.nth(0)).toHaveAttribute("aria-pressed","true");
 await buttons.nth(2).hover({force:true});
 await expect(buttons.nth(0)).toHaveAttribute("aria-pressed","true");
 await expect(buttons.nth(2)).toHaveAttribute("aria-pressed","false");
 await buttons.nth(2).focus();
 await expect(buttons.nth(0)).toHaveAttribute("aria-pressed","true");
 await buttons.nth(2).click();
 await expect(buttons.nth(2)).toHaveAttribute("aria-pressed","true");
 await expect(buttons.nth(0)).toHaveAttribute("aria-pressed","false");
 await buttons.nth(4).click();
 await expect(buttons.nth(4)).toHaveAttribute("aria-pressed","true");
});
test("WebGL2 renders five modes when available and gracefully falls back otherwise",async({page})=>{
 const errors=[];page.on("pageerror",err=>errors.push(err.message));
 await page.goto(base);
 const result=await page.locator(".hero.active .hero-shader").evaluate(canvas=>{
  const hasRenderer=typeof window.DGCEffects?.mount==="function";
  const available=!!canvas.getContext("webgl2");
  return {hasRenderer,available,ready:canvas.classList.contains("shader-ready"),width:canvas.width,height:canvas.height};
 });
 expect(result.hasRenderer).toBe(true);
 if(result.available){
  expect(result.ready).toBe(true);
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
 }else{
  await expect(page.locator(".hero.active .shader-fallback")).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test("navigation and language switching work across rebuilt hero slides",async({page})=>{
 await page.goto(base);
 await page.locator("#next").click();
 await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","overview");
 await page.locator("#prev").click();
 await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","home");
 await page.locator('[data-lang="en"]').click();
 await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
 await expect(page.locator(".hero.active .shader-selectors .stripe")).toHaveCount(5);
 await page.locator('[data-lang="uk"]').click();
 await expect(page.locator(".hero.active .shader-selectors .stripe")).toHaveCount(5);
});
test("desktop hero fits between header and footer",async({page})=>{
 await page.setViewportSize({width:1728,height:864});await page.goto(base);
 const b=await page.locator(".hero.active").evaluate(hero=>{
  const rect=hero.getBoundingClientRect(),canvas=hero.querySelector(".hero-shader").getBoundingClientRect();
  return {top:rect.top,bottom:rect.bottom,canvasTop:canvas.top,canvasBottom:canvas.bottom,topbar:document.querySelector(".topbar").getBoundingClientRect().bottom,footer:document.querySelector(".controlbar").getBoundingClientRect().top};
 });
 expect(Math.abs(b.top-b.topbar)).toBeLessThan(2);
 expect(Math.abs(b.bottom-b.footer)).toBeLessThan(2);
 expect(Math.abs(b.canvasTop-b.top)).toBeLessThan(2);
 expect(Math.abs(b.canvasBottom-b.bottom)).toBeLessThan(2);
});
test("gold accents and reduced motion remain accessible",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto(base);
 const buttons=page.locator(".hero.active .shader-selectors .stripe");
 await buttons.nth(1).click();
 await expect(buttons.nth(1)).toHaveAttribute("aria-pressed","true");
 await page.locator("#next").click();
 await expect(page.locator(".slide.active .gold-frame")).toHaveCount(6);
});
test("desktop navigation stays centered without overlap",async({page})=>{
 await page.setViewportSize({width:1728,height:864});
 await page.goto(base);
 const m=await page.locator("#topnav").evaluate(nav=>{
  const rect=nav.getBoundingClientRect();
  const children=[...nav.querySelectorAll("button")].map(x=>x.getBoundingClientRect());
  return {width:rect.width,center:rect.left+rect.width/2,viewport:innerWidth,overlap:children.some((x,i)=>i>0&&x.left<children[i-1].right-1)};
 });
 expect(Math.abs(m.center-m.viewport/2)).toBeLessThan(4);
 expect(m.width).toBeLessThanOrEqual(390);
 expect(m.overlap).toBe(false);
});
