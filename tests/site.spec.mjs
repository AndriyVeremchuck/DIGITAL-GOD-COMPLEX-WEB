import { test, expect } from "@playwright/test";
const base="http://127.0.0.1:8787/";
test("single-video homepage hides five strips and contains both video layers",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(base);
 const hero=page.locator(".hero.active");
 await expect(hero.locator(".cinema-video")).toHaveCount(2);
 await expect(hero.locator("#stripes")).toBeHidden();
 await expect(hero.locator(".hero-title-main")).toHaveText("Create worlds");
 expect(errors).toEqual([]);
});
test("Cosmic Nebula always autoplays muted on home",async({page})=>{
 await page.goto(base);
 const hero=page.locator(".hero.active");
 const video=hero.locator(".cinema-layer.is-active video");
 await expect(video).toHaveAttribute("src",/cosmic-nebula\.mp4/,{timeout:6000});
 await expect(hero.locator(".cinema-layer.is-active")).toHaveClass(/has-video/,{timeout:8000});
 await expect.poll(()=>video.evaluate(v=>({playing:!v.paused,muted:v.muted,loop:v.loop,autoplay:v.autoplay,ready:v.readyState})),{timeout:8000}).toMatchObject({playing:true,muted:true,loop:true,autoplay:true});
 await expect(hero.locator(".cinema-layer.is-active .cinema-image")).toHaveCSS("opacity","0");
});
test("video pauses outside home, resumes when returning",async({page})=>{
 await page.goto(base);
 const playing=page.locator(".hero .cinema-layer.is-active video");
 await expect.poll(()=>playing.evaluate(v=>!v.paused),{timeout:8000}).toBe(true);
 await page.locator("#next").click();
 await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","overview");
 await expect.poll(()=>playing.evaluate(v=>v.paused),{timeout:3000}).toBe(true);
 await page.locator("#prev").click();
 await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","home");
 await expect.poll(()=>playing.evaluate(v=>!v.paused),{timeout:8000}).toBe(true);
});
test("hero uses full height, no blank bottom",async({page})=>{
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
test("five slots are preserved in manifest for later reactivation",async({page})=>{
 await page.goto(base);
 const manifest=await page.evaluate(()=>fetch("assets/videos/manifest.json").then(r=>r.json()));
 expect(Object.values(manifest)).toEqual(Array(5).fill("cosmic-nebula.mp4"));
 await expect(page.locator(".hero.active #stripes .stripe")).toHaveCount(5);
});


test("video resumes after returning via top menu, repeatedly",async({page})=>{
 await page.goto(base);
 const video=page.locator(".hero .cinema-layer.is-active video");
 await expect.poll(()=>video.evaluate(v=>!v.paused&&v.readyState>=2),{timeout:9000}).toBe(true);
 const nav=page.locator("#topnav button");
 for(const idx of [2,3,1,6]){
  await nav.nth(idx).click();
  await expect(page.locator(".slide.active")).not.toHaveAttribute("data-chapter","home");
  await expect.poll(()=>video.evaluate(v=>v.paused),{timeout:3000}).toBe(true);
  await nav.nth(0).click();
  await expect(page.locator(".slide.active")).toHaveAttribute("data-chapter","home");
  await expect.poll(()=>video.evaluate(v=>!v.paused&&v.readyState>=2),{timeout:9000}).toBe(true);
 }
});
test("video returns after navigating away during initial media load",async({page})=>{
 await page.goto(base);
 const nav=page.locator("#topnav button");
 const video=page.locator(".hero .cinema-layer.is-active video");
 await nav.nth(2).click();
 await nav.nth(0).click();
 await expect.poll(()=>video.evaluate(v=>!v.paused&&v.readyState>=2),{timeout:9000}).toBe(true);
});
