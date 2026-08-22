import { expect, test } from "@playwright/test";
import path from "node:path";

const nativeFixture = path.resolve("fixtures/青云研语_QingyunSpeak_Native_V1.json");
const legacyFixture = path.resolve("fixtures/cici-original.json");

test("load → import → search → open → edit → reload → export", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "今天，开口练哪几题？" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "核心题覆盖" })).toBeVisible();

  await page.getByRole("link", { name: "数据与设置" }).click();
  await page.locator('input[name="dataset-file"]').setInputFiles(nativeFixture);
  await expect(page.getByRole("heading", { name: /准备导入/ })).toBeVisible();
  await page.getByRole("button", { name: "确认覆盖并导入" }).click();
  await expect(page.getByText("已导入 142 道题，训练数据未改动。")).toBeVisible();

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
  await expect.poll(() => page.evaluate(() => {
    const stored = localStorage.getItem("qingyun.dataset.v1");
    return stored ? JSON.parse(stored).questions.length : 0;
  })).toBe(170);

  await page.getByRole("link", { name: "数据与设置" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^qingyun-speak-backup-\d{4}-\d{2}-\d{2}\.json$/);
  expect(consoleErrors).toEqual([]);
});

test("legacy default migrates to Native V1 after refresh", async ({ page }) => {
  await page.goto("/#/settings");
  await page.locator('input[name="dataset-file"]').setInputFiles(legacyFixture);
  await page.getByRole("button", { name: "确认覆盖并导入" }).click();
  await expect(page.getByText("98 道题 · 6 个发音词条")).toBeVisible();
  await page.reload();
  await expect(page.getByText("170 道题 · 42 个发音词条")).toBeVisible();
});

test("daily module plan → check-in → undo → progress → practice filter → full restore", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByLabel("添加计划模块").selectOption("自我情况类");
  await page.getByRole("button", { name: "添加模块" }).click();
  await page.getByRole("button", { name: "增加自我情况类目标题数" }).click();
  await page.getByRole("button", { name: "增加自我情况类目标题数" }).click();
  await page.getByRole("button", { name: "保存今日计划" }).click();
  await expect(page.locator(".module-route")).toContainText("0 / 3");
  await page.locator(".recommendation-groups a").first().click();

  await page.getByRole("button", { name: "完成练习" }).click();
  await expect(page.getByText("本题累计练习 1 次")).toBeVisible();
  await expect(page.getByText("今日自我情况类：1 / 3")).toBeVisible();
  await page.getByRole("button", { name: "撤销" }).click();
  await expect(page.getByText("本题累计练习 0 次")).toBeVisible();
  await page.getByRole("button", { name: "完成练习" }).click();

  await page.getByRole("link", { name: "今日研习" }).click();
  await expect(page.locator(".module-route")).toContainText("1 / 3");
  await expect(page.locator(".practice-stat-grid")).toContainText("今日练习次数");
  await expect(page.locator(".practice-stat-grid")).toContainText("1");

  await page.getByRole("link", { name: "题库", exact: true }).click();
  await page.locator('select[name="practice-filter"]').selectOption("today");
  await expect(page.getByText("1 道题", { exact: true })).toBeVisible();
  await expect(page.getByText(/今天练过 · 累计 1 次/)).toBeVisible();

  await page.getByRole("link", { name: "数据与设置" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出完整备份" }).click();
  const download = await downloadPromise;
  const backupPath = testInfo.outputPath("full-backup.json");
  await download.saveAs(backupPath);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "清空练习历史" }).click();
  await expect(page.locator(".settings-section-heading")).toContainText("0 条练习记录");

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('input[name="full-backup-file"]').setInputFiles(backupPath);
  await expect(page.getByText(/完整备份已恢复：1 条练习记录/)).toBeVisible();
  await expect(page.locator(".settings-section-heading")).toContainText("1 条练习记录");
});

for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
  test(`${viewport.name} responsive render`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "今天，开口练哪几题？" })).toBeVisible();
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
