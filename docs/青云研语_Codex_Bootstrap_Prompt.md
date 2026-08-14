# Codex Bootstrap Prompt｜青云研语 V1

你现在是 **青云研语（Qingyun Speak）** 的主程、前端工程师、测试工程师和轻量产品设计师。

当前目录就是项目根目录。

目标不是只搭一个 Demo，而是在一次连续工作中完成 **M0–M4**，做到一个可以本地正常使用、可以部署 GitHub Pages 的 V1 主体。

---

## 0. 先读项目文档

开始任何编码前，先完整阅读：

- `docs/PRD.md`
- `docs/TECHNICAL_DESIGN.md`

把它们视为项目 Source of Truth。

若冲突：

1. 产品行为以 `PRD.md` 为准；
2. 技术实现以 `TECHNICAL_DESIGN.md` 为准；
3. 仍然冲突时，选择更简单、更稳、更容易测试的实现；
4. 不要因为普通实现细节向我提问。

---

## 1. 必须使用已安装 Skills

开始前先检查当前可用 skills。

如果存在以下能力，请主动读取并使用：

### frontend-design

用于：
- 整体视觉方向
- Dashboard
- 题库目录
- 单题训练页
- 发音词库
- 响应式与微交互

视觉要求：

- 不做通用 AI 紫色渐变；
- 不做模板化 SaaS Dashboard；
- 不过度玻璃拟态；
- 不把所有元素做成胶囊；
- 做成一个每天愿意打开的个人学习工作台。

视觉关键词：

> 安静、清楚、专注、现代、有学习感、有一点“青云”的意象，但克制。

建议：
- 暖米白背景
- 深墨蓝 / 靛蓝主色
- 少量青玉色强调
- 清晰英文与中文排版
- 精致但克制的微交互

### web-design-guidelines

在 M4 完成后做完整 UI / UX / accessibility audit，并真正修复高价值问题。

如果 skill 名称略有不同，找到语义对应项。

---

## 2. 技术栈固定

不要自行换栈。

使用：

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router，优先 HashRouter
- Web Speech API / SpeechSynthesis
- localStorage
- Vitest
- React Testing Library
- Playwright（环境允许时加入）

V1：

- 不做后端
- 不接数据库
- 不接任何 AI API
- 不写任何 API Key
- 不使用预录音频作为核心 TTS

---

## 3. Autonomous Build Loop

不要“一次写很多代码然后结束”。

执行以下循环，直到 M0–M4 全部通过：

```text
LOOP
  1. Inspect
     - 查看当前 repo 状态
     - 查看未完成 milestone
     - 查看最近测试/构建错误

  2. Plan
     - 选择下一个最小但完整的功能切片
     - 明确会修改哪些文件
     - 不需要向用户输出长计划

  3. Implement
     - 写 production code
     - 同时补必要测试
     - 保持类型清晰和组件边界

  4. Verify
     - npm test
     - npm run build
     - 有对应测试时执行 targeted tests
     - UI 功能尽可能运行 smoke test

  5. Fix
     - 测试/构建失败则定位根因
     - 修复
     - 再测试
     - 不允许因为第一个错误就停止

  6. Review
     - 删除明显重复代码
     - 检查空状态、错误状态和边界条件
     - 检查是否偏离 PRD

  7. Record
     - 更新 docs/PROGRESS.md
     - 标记 DONE / IN PROGRESS / BLOCKED
     - 记录必要技术决策

  8. Continue
     - 如果 M0–M4 未完成，进入下一轮
END LOOP
```

---

## 4. 停止条件

普通 bug、类型错误、测试失败、CSS 问题都不是停止理由。

只有以下情况允许停止并向用户说明：

1. 必须提供外部 Secret / Token；
2. 当前环境完全无法下载依赖，且没有已有依赖可用；
3. GitHub Pages 的远程仓库权限必须由用户操作；
4. 需求存在真正不可消解的互斥；
5. 连续多轮后发现浏览器/平台硬限制，并已有最小复现证明。

除此之外：

> **继续做，不要问“要不要继续”。**

---

## 5. M0｜Skeleton & Foundation

完成：

- 初始化 Vite React TypeScript
- Tailwind CSS
- HashRouter
- App shell
- 合理的导航
- 基础 Design Tokens
- `/`
- `/#/questions`
- `/#/pronunciation`
- `/#/settings`
- fallback 页面
- GitHub Pages workflow
- README 基础说明

页面不能只是空白占位符，至少有合理 skeleton。

验收：

```bash
npm test
npm run build
```

通过。

---

## 6. M1｜Data Core

实现 Native Dataset Schema。

实现：

- models
- schemaVersion
- runtime validation
- Legacy Cici Adapter
- bilingual question parser
- answer parser
- sentence segmentation
- localStorage repository
- default dataset loader
- JSON import
- import preview
- JSON export
- reset to default

关键要求：

- 当前 Cici JSON 可以导入；
- 不依赖 `audioFile`；
- `/` 解析不能粗暴 `split("/")`；
- 导入异常必须给用户可理解错误；
- localStorage key 集中管理；
- Adapter 有单元测试；
- Parser 有单元测试；
- Storage 有测试。

如果项目目录中存在用户提供的 Cici JSON，可复制一份作为 test fixture；不要修改原文件。

---

## 7. M2｜Core UI

完成真正可用的题库。

### Dashboard

至少显示：

- 题目总数
- 收藏数
- 熟练题数
- Quick actions

### Questions

支持：

- 题目卡片
- 英中双语
- 搜索
- category filter
- tag filter
- favorite filter
- mastery filter
- random
- add
- edit
- delete

### Question Detail

必须有：

- Question
- Thinking
- Phrase Blocks
- Spoken Answer
- Chinese Notes
- Fallback Expressions
- Favorite
- Mastery
- Edit

所有数据操作同步 localStorage。

---

## 8. M3｜Speech

实现统一 `useSpeech` 或等价 service/hook。

必须支持：

- `speechSynthesis.getVoices()`
- `voiceschanged`
- voice 选择
- 优先 en-US
- rate: 0.75 / 0.9 / 1.0 / 1.1
- speak
- stop
- pause
- resume

### Sentence

点击任一句 → 播放该句。

### Phrase

点击 phrase → 播放该 phrase。

### Word

用户在英文内容中点击单词 → 播放单词。

设计单词点击时不要破坏整句易读性。

### Play All

不要把整段塞成一个 utterance。

逐句串行：

```text
sentence[i]
  onend -> sentence[i + 1]
```

当前句必须高亮。

用户点击其他句时：

- cancel current
- 切 active sentence
- 立即播放新句

修改文字后无需生成任何音频，新文本必须立即能读。

---

## 9. M4｜Training

### Progressive Reveal

陌生题模式：

- 初始只显示 question
- Show Thinking
- Show Phrases
- Show Answer

### Random Question

支持限定：

- category
- tag
- favorite
- mastery

### 90 / 60 / 45

同一题三轮：

- 90s
- 60s
- 45s

支持：

- start
- pause
- resume
- reset
- next round

每轮结束有简短 guidance。

### Pronunciation Bank

分组：

- Personal
- Research
- Paper

支持：

- add
- edit
- delete
- click to speak
- search
- mastery

---

## 10. UI 质量要求

青云研语不是后台管理系统。

主观体验：

> 打开后应该像“安静的个人学习桌”，而不是企业 CRM。

避免：

- 满屏表格
- Bootstrap 风
- SaaS 模板导航
- 紫粉渐变
- 没有信息层级的圆角卡片海洋
- 过多 emoji
- 一屏几十个按钮

鼓励：

- 好的中文字体 fallback
- 清晰英文排版
- 强信息层次
- 训练状态具有仪式感
- TTS active sentence 高亮舒服
- 空状态精致
- 适度 transition
- 对 Safari 友好

---

## 11. Responsive

重点测试：

1. Mac Safari desktop viewport
2. Chrome desktop
3. mobile ~390px

不能只为 1440px 写死。

---

## 12. Accessibility

至少：

- button 有可读 label
- icon-only button 有 aria-label
- focus state 可见
- keyboard 可以访问主要操作
- 对比度合理
- `prefers-reduced-motion`
- 不只用颜色表达状态

---

## 13. Quality Gates

每个 milestone 结束必须：

```bash
npm test
npm run build
```

如果存在 lint：

```bash
npm run lint
```

最终至少：

- TypeScript 无错误
- tests pass
- build pass
- 无明显 console error

如果 Playwright 可用，增加 smoke test：

```text
load
→ import
→ search
→ open
→ edit
→ reload
→ export
```

TTS 自动化部分允许 mock SpeechSynthesis，但最终提供手工 Safari smoke checklist。

---

## 14. Final Design Audit Loop

M4 功能完成后：

1. 调用 `web-design-guidelines` skill；
2. 对 `src/**/*.{tsx,ts,css}` 做 UI/UX/accessibility review；
3. 修复高优先级问题；
4. 再次 `npm test && npm run build`；
5. 检查 1440px 与 390px 布局；
6. 如果能使用浏览器自动化，截图检查关键页面；
7. 发现明显视觉问题继续修；
8. 不要只输出 audit 报告而不修复。

---

## 15. Progress File

持续维护：

`docs/PROGRESS.md`

格式：

```md
# Progress

## M0
- [x] Vite
- [x] Router
- [x] Tailwind
- [x] GitHub Pages

## M1
- [x] Schema
- [ ] Cici adapter

## Blockers
- None

## Last verification
- npm test: PASS
- npm run build: PASS
```

---

## 16. 不允许做的事

- 不要为了快把所有代码塞进 `App.tsx`
- 不要 `any` 满天飞
- 不要复制粘贴同一 storage logic
- 不要在多个组件直接操作 `window.speechSynthesis`
- 不要在多个组件自己实现句子分割
- 不要把 API Key 放前端
- 不要擅自改成 Next.js
- 不要擅自加后端
- 不要把旧 JSON 音频映射继续当核心
- 不要只完成 UI mock 就声称 milestone 完成
- 不要遇到测试失败就停止

---

## 17. 最终输出

只有 M0–M4 完成或遇到真正 External Blocker 时再结束。

最终回复只报告：

1. 已完成 milestones；
2. 关键功能；
3. 测试/构建状态；
4. 仍存在的 blocker；
5. 本地运行命令；
6. GitHub Pages 部署还需要用户做什么（如果确实需要）。

现在开始。

先读 `docs/PRD.md` 与 `docs/TECHNICAL_DESIGN.md`，然后进入 Autonomous Build Loop。
