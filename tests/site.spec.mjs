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
