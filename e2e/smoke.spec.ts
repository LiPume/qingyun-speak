import { expect, test } from "@playwright/test";
import path from "node:path";

const nativeFixture = path.resolve("fixtures/青云研语_QingyunSpeak_Native_V1.json");
const legacyFixture = path.resolve("fixtures/cici-original.json");

test("load → import → search → open → edit → reload → export", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把思路，练成从容的表达。" })).toBeVisible();
  await expect(page.getByText("142", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "数据与设置" }).click();
  await page.locator('input[type="file"]').setInputFiles(nativeFixture);
  await expect(page.getByRole("heading", { name: /准备导入/ })).toBeVisible();
  await page.getByRole("button", { name: "确认覆盖并导入" }).click();
  await expect(page.getByText("已导入 142 道题。")).toBeVisible();

  await page.getByRole("link", { name: "题库", exact: true }).click();
  await page.getByPlaceholder("搜索问题、答案、关键词…").fill("AI agents");
  await expect(page.getByRole("link", { name: "进入训练 →" }).first()).toBeVisible();
  await page.getByRole("link", { name: "进入训练 →" }).first().click();
  const originalHeading = await page.locator("h1").first().innerText();
  await page.getByRole("button", { name: "编辑题目" }).click();
  await page.locator('input[name="question-en"]').fill(`${originalHeading} TEST`);
  await page.getByRole("button", { name: "保存题目" }).click();
  await page.reload();
  await expect(page.locator("h1").first()).toContainText("TEST");

  await page.getByRole("link", { name: "数据与设置" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^qingyun-speak-backup-\d{4}-\d{2}-\d{2}\.json$/);
  expect(consoleErrors).toEqual([]);
});

test("legacy default migrates to Native V1 after refresh", async ({ page }) => {
  await page.goto("/#/settings");
  await page.locator('input[type="file"]').setInputFiles(legacyFixture);
  await page.getByRole("button", { name: "确认覆盖并导入" }).click();
  await expect(page.getByText("98 道题 · 6 个发音词条")).toBeVisible();
  await page.reload();
  await expect(page.getByText("142 道题 · 42 个发音词条")).toBeVisible();
});

for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
  test(`${viewport.name} responsive render`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "把思路，练成从容的表达。" })).toBeVisible();
    await page.waitForTimeout(450);
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-dashboard.png`), fullPage: true });
    const navigation = viewport.name === "mobile"
      ? page.getByRole("navigation", { name: "移动端主导航" })
      : page.getByRole("navigation", { name: "主导航", exact: true });
    await navigation.getByRole("link", { name: "题库", exact: true }).click();
    await expect(page.getByRole("heading", { name: "题库" })).toBeVisible();
    await page.waitForTimeout(450);
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-questions.png`), fullPage: true });
    await page.getByRole("link", { name: "进入训练 →" }).first().click();
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(450);
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-detail.png`), fullPage: true });
    expect(errors).toEqual([]);
  });
}
