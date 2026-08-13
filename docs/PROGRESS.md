# Progress

## M0
- [x] Vite React TypeScript
- [x] HashRouter 与响应式 App shell
- [x] Tailwind CSS 与定制 Design Tokens
- [x] Dashboard / Questions / Pronunciation / Settings / fallback routes
- [x] GitHub Pages workflow 与 README

## M1
- [x] Native Dataset Schema V1 与 runtime validation
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

## Blockers
- None

## Last verification
- `npm test`: PASS — 6 files / 10 tests
- `npm run lint`: PASS — 0 errors / 0 warnings
- `npm run build`: PASS — TypeScript + Vite production build
- `npm run test:e2e`: PASS — 3 tests（完整数据链路 + 1440px + 390px）
- Browser console errors: 0
- Verified: 2026-08-13
