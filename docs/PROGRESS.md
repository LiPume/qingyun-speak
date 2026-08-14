# Progress

## M0
- [x] Vite React TypeScript
- [x] HashRouter 与响应式 App shell
- [x] Tailwind CSS 与定制 Design Tokens
- [x] Dashboard / Questions / Pronunciation / Settings / fallback routes
- [x] GitHub Pages workflow 与 README

## M1
- [x] Native Dataset Schema V1 与 runtime validation
- [x] Native V1 默认数据（142 道题 / 42 个发音词条）
- [x] 旧 98 题默认库刷新自动迁移
- [x] Legacy Cici Adapter（98 道 fixture）
- [x] bilingual question / answer / sentence parser
- [x] localStorage repository 与集中 keys
- [x] 默认加载、导入预览、导出、恢复默认
- [x] Adapter / Parser / Storage 单元测试

## M2
- [x] Dashboard 统计与 quick actions
- [x] 题库搜索、分类、标签、收藏、熟练度、随机
- [x] 题目 add / edit / delete
- [x] 单题 Thinking / Phrases / Answer / 中文速记 / Fallback / 收藏 / 熟练度

## M3
- [x] 统一 `useSpeech`
- [x] voiceschanged、English voice 优先、voice / rate 持久化
- [x] word / phrase / sentence 点击朗读
- [x] Play all 逐句串行、active sentence、高优先级切换
- [x] stop / pause / resume

## M4
- [x] 陌生题 progressive reveal
- [x] 受当前题库筛选约束的随机抽题
- [x] 90 / 60 / 45 start / pause / resume / reset / next round
- [x] Pronunciation Bank 分组、搜索、CRUD、熟练度与点击朗读
- [x] Final Web Interface Guidelines audit（已修复表单、弹层、嵌套交互、长列表与 motion 问题）
- [x] 1440px / 390px 截图检查

## M6.1｜Training Data
- [x] 独立 `PracticeRecord` / `TrainingHistory` 模型与 `qingyun.training.v1` repository
- [x] add / undo / count / first / last / today / unique / new-vs-review / unpracticed / streak selectors
- [x] 损坏 localStorage 安全回退；Dataset reset 与训练数据隔离

## M6.2｜Daily Plan
- [x] 独立 `DailyPlan` / `DailyPlanStore` 与 `qingyun.daily-plan.v1`
- [x] 动态 category 模块目标、编辑、删除、复制昨天、历史持久化
- [x] 本地自然日工具与模块/总计划完成度 selectors
- [x] 非 AI 推荐：核心未练 → 核心久未练 → 同模块其他题 → 扩展题

## M6.3｜Question Integration
- [x] 单题“完成练习”、8 秒撤销、累计/首次/最近与最近 10 次记录
- [x] 当前模块计划进度提示；练习次数不自动修改 mastery
- [x] 题库未练/已练/今天练过状态与组合筛选；筛选状态同步 URL
- [x] 模块入口默认按未练、久未练、今天练过排序

## M6.4｜Dashboard
- [x] 今日计划编辑、模块进度路线与自动推荐
- [x] 今日次数/不同题/新题/复习、核心题覆盖与模块覆盖
- [x] 最近 10 条练习、连续打卡、计划历史

## M6.5｜Calendar & Backup
- [x] 最近 30 个本地自然日概览与日期详情
- [x] 原 Dataset 导入导出保持兼容
- [x] 题库 + Training History + Daily Plans + Settings 完整导出/恢复
- [x] 独立清空练习历史 / 每日计划，均有二次确认

## M6.6｜QA
- [x] Vercel 最新 Web Interface Guidelines 审查与高优先级修复
- [x] 1440px / 390px Dashboard、Questions、Question Detail 截图复核
- [x] Chromium 与 WebKit 全链路 E2E

## Blockers
- None

## Last verification
- `npm test`: PASS — 11 files / 26 tests
- `npm run lint`: PASS — 0 errors / 0 warnings
- `npm run build`: PASS — TypeScript + Vite production build
- `npm run test:e2e`: PASS — Chromium 5/5（含每日计划 → 推荐 → 打卡/撤销 → 进度/筛选 → 完整恢复）
- `npx playwright test --browser=webkit`: PASS — WebKit 5/5（Safari 同源引擎）
- Browser console errors: 0
- Real Safari automation: macOS Accessibility / Screen Recording permission 未生效；已用 WebKit 全套回归替代，不影响产品功能
- Verified: 2026-08-14 17:00 CST
