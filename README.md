# 青云研语 · Qingyun Speak

一个面向英语复试与研究生面试准备的本地优先口语训练工作台。

## 功能

- 98 道 Cici 旧题库自动适配，支持搜索、筛选、收藏、熟练度与完整 CRUD
- Thinking → Phrase Blocks → Spoken Answer 渐进揭示
- 浏览器原生 Web Speech API：单词、短语、句子、逐句连续播放
- 90 / 60 / 45 秒三轮输出训练
- 发音词库 CRUD 与熟练度
- Native / Cici JSON 导入预览、导出备份、恢复默认
- localStorage 持久化，无后端、无 API Key

## 本地运行

```bash
npm install
npm run dev
```

质量检查：

```bash
npm test
npm run test:e2e
npm run lint
npm run build
```

## GitHub Pages

项目使用 `HashRouter` 和相对 `base`。推送到 GitHub 的 `main` 分支后，在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**，工作流会测试、构建并部署 `dist/`。

## Safari 手工检查

1. 打开题目详情，点击问题、单词、任意句子，确认发音正常。
2. 点击 Play all，确认逐句播放且当前句高亮。
3. 播放中切到另一句，确认当前朗读取消并立即切换。
4. 测试 Pause / Resume / Stop 与 0.75×、0.9×、1.0×、1.1×。
5. 编辑英文文本并保存，确认新文本无需音频文件即可朗读。
