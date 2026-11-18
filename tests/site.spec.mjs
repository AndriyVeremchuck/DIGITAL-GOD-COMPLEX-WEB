import { test, expect } from "@playwright/test";
const base="http://127.0.0.1:8787/";

test("five cinematic cards with two video layers are mounted",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(base);
 await expect(page.locator(".hero.active .cinematic-carousel")).toHaveCount(1);
 await expect(page.locator(".hero.active .cinema-layer")).toHaveCount(2);
 await expect(page.locator(".hero.active .cinema-video")).toHaveCount(2);
 await expect(page.locator(".hero.active .shader-selectors .stripe")).toHaveCount(5);
 await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
 expect(errors).toEqual([]);
});
test("five buttons all reference one video in test manifest",async({page})=>{
 await page.goto(base);
 const result=await page.evaluate(()=>fetch("assets/videos/manifest.json").then(r=>r.json()));
 expect(Object.values(result)).toEqual(Array(5).fill("cosmic-nebula.mp4"));
});
test("video mode selection is click only, hover and focus do not switch",async({page})=>{
 await page.goto(base);
 const cards=page.locator(".hero.active .shader-selectors .stripe");
 await cards.nth(3).hover({force:true});
 await cards.nth(3).focus();
 await expect(cards.nth(0)).toHaveAttribute("aria-pressed","true");
 await cards.nth(3).click();
 await expect(cards.nth(3)).toHaveAttribute("aria-pressed","true");
 await expect(cards.nth(0)).toHaveAttribute("aria-pressed","false");
 await expect(page.locator(".hero.active .cinematic-carousel")).toHaveAttribute("data-active-scene","3",{timeout:7000});
});
test("video playback when file exists, otherwise maintain high-quality poster fallback",async({page})=>{
 await page.goto(base);
 const exists=await page.request.get("http://127.0.0.1:8787/assets/videos/cosmic-nebula.mp4");
 const root=page.locator(".hero.active .cinematic-carousel");
 if(exists.ok()){
  await expect(root.locator(".cinema-layer.has-video")).toHaveCount(1,{timeout:7500});
  const ready=await root.locator(".cinema-layer.has-video video").evaluate(v=>({muted:v.muted,loop:v.loop,ready:v.readyState}));
  expect(ready.muted).toBe(true);expect(ready.loop).toBe(true);expect(ready.ready).toBeGreaterThan(1);
 }else{
  await expect(root.locator(".cinema-layer.is-active .cinema-image")).toHaveAttribute("src",/portal-metropolis/);
 }
});
test("hero and video layers occupy one viewport with no empty lower half",async({page})=>{
 await page.setViewportSize({width:1728,height:864});await page.goto(base);
 const m=await page.locator(".hero.active").evaluate(hero=>{
  const rect=hero.getBoundingClientRect(),back=hero.querySelector(".cinematic-carousel").getBoundingClientRect();
  return {top:rect.top,bottom:rect.bottom,backTop:back.top,backBottom:back.bottom,head:document.querySelector(".topbar").getBoundingClientRect().bottom,foot:document.querySelector(".controlbar").getBoundingClientRect().top};
 });
 expect(Math.abs(m.top-m.head)).toBeLessThan(2);
 expect(Math.abs(m.bottom-m.foot)).toBeLessThan(2);
 expect(Math.abs(m.backTop-m.top)).toBeLessThan(2);
 expect(Math.abs(m.backBottom-m.bottom)).toBeLessThan(2);
});
test("navigation, localization and other gold framed cards remain",async({page})=>{
 await page.goto(base);
 await page.locator("#next").click();
 await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","overview");
 await expect(page.locator(".slide.active .gold-frame")).toHaveCount(6);
 await page.locator("#prev").click();
 await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","home");
 await page.locator('[data-lang="en"]').click();
 await expect(page.locator(".hero.active .hero-title-main")).toHaveText("Create worlds");
 await page.locator('[data-lang="uk"]').click();
 await expect(page.locator(".hero.active .shader-selectors .stripe")).toHaveCount(5);
});
