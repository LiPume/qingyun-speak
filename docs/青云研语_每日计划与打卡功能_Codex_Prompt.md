# 青云研语｜每日计划与打卡功能 Codex Prompt

你现在要为 **青云研语（Qingyun Speak）** 增加一套完整但不过度复杂的 **每日计划 + 模块化进度 + 练习打卡 + 历史统计** 功能。

这不是单纯“加一个打卡按钮”，而是要解决四个实际问题：

1. 我今天到底应该背哪些题；
2. 哪些题我已经正式开口练过，哪些还没练；
3. 每道题练过几次、什么时候练的；
4. 我能否按模块推进，而不是面对一百多道题没有节奏。

开始前先阅读当前项目：

- `docs/PRD.md`
- `docs/TECHNICAL_DESIGN.md`
- `docs/PROGRESS.md`
- `src/models/dataset.ts`
- `src/storage/storage.ts`
- `src/features/dataset/DatasetContext.tsx`
- Dashboard / 今日研习页面
- QuestionsPage
- QuestionDetailPage
- 当前所有与筛选、mastery、localStorage 相关代码与测试

如果存在 `frontend-design` 或语义相近的 UI skill，请使用。
如果存在 `web-design-guidelines` 或语义相近的审查 skill，完成后执行审查并修复高优先级问题。

---

## 1. 产品原则

这套功能围绕：

> **按模块制定计划 → 今天完成若干题 → 每题手动打卡 → 累积形成覆盖进度 → 再安排复习**

注意区分三个概念：

### mastery
我主观认为自己掌握到了什么程度。

### practice history
我实际上正式练过几次、什么时候练过。

### daily plan
我今天计划推进哪些模块、练多少题。

三者必须独立，不能混成一个字段。

---

## 2. 训练模块

优先基于当前题库已有的 `category` 和 `tags` 动态组织。

核心模块建议至少支持：

- 自我情况
- 报考动机
- 未来规划
- 本科学习
- 压力面试
- 知识拓展
- 项目与论文
- 城市专项
- 补充高频题
- 扩展题库

不要把这些名字写死到业务逻辑里。

如果题目含有 `核心题库` 标签，则在计划系统中优先突出。

---

## 3. Daily Plan 数据模型

新增独立计划数据，不要直接塞进 InterviewDataset。

建议：

```ts
export interface DailyPlanModuleTarget {
  category: string;
  targetCount: number;
}

export interface DailyPlan {
  date: string; // 用户本地 YYYY-MM-DD
  moduleTargets: DailyPlanModuleTarget[];
  totalTarget?: number;
  createdAt: string;
  updatedAt: string;
}
```

允许同一天设置：

```text
自我情况      3题
报考动机      2题
项目与论文    3题
```

总目标：

```text
8题
```

V1 的计划重点是：

> 按模块设数量目标。

不要求事先点名具体 Q01/Q02。

系统根据实际打卡记录自动计算各模块今天完成多少。

---

## 4. 每日计划设置

Dashboard / 今日研习页顶部增加：

### 今日计划

用户可以快速设置：

```text
自我情况      [-] 3 [+]
报考动机      [-] 2 [+]
项目与论文    [-] 3 [+]
```

并显示：

```text
今日计划：8题
已完成：5题
```

支持：

- 添加模块
- 删除模块
- 修改目标题数
- 保存今日计划
- 清空今日计划
- 复制昨天计划

所有操作保持轻量，不做复杂日程系统。

---

## 5. 自动安排今日计划

增加：

> 自动安排今日计划

不使用 AI，不调用外部 API。

使用简单规则：

1. 当前计划模块中从未练过的核心题；
2. 已练过但最近较久没练的核心题；
3. 同模块其他题；
4. 扩展题最后。

例如今天设置：

```text
项目与论文 3题
```

推荐区可以显示：

```text
Q35 · 新题 · 从未练过
Q37 · 新题 · 从未练过
Q40 · 复习 · 4天未练
```

推荐不是强制绑定。

用户去题库练任何属于该模块的题，都计入计划完成度。

---

## 6. Practice History 数据模型

使用当前已经预留的：

```text
qingyun.training.v1
```

建立：

```ts
export interface PracticeRecord {
  id: string;
  questionId: string;
  practicedAt: string;
}

export interface TrainingHistory {
  schemaVersion: 1;
  records: PracticeRecord[];
}
```

V1 不额外存 count。

累计次数直接从 records 派生。

---

## 7. Practice Storage

实现统一 repository / storage：

```ts
loadTrainingHistory()
saveTrainingHistory()
addPracticeRecord(questionId)
removePracticeRecord(recordId)
```

要求：

- localStorage 损坏时安全 fallback
- 与 Dataset 数据分离
- Reset Dataset 默认不能清空 Training History
- 清空练习历史必须单独操作并二次确认

---

## 8. Daily Plan Storage

新增独立 key，例如：

```ts
dailyPlan: "qingyun.daily-plan.v1"
```

建议：

```ts
interface DailyPlanStore {
  schemaVersion: 1;
  plans: DailyPlan[];
}
```

至少保留最近 60 天。

不要只保存“今天一份”，否则无法回看过去计划完成情况。

---

## 9. 统一日期处理

所有：

- 今天
- 昨天
- 连续打卡
- 每日完成度

必须按用户本地自然日计算。

不要直接用：

```ts
isoString.slice(0, 10)
```

把 UTC 日期当本地日期。

统一封装：

```ts
getLocalDateKey(date)
```

输出 `YYYY-MM-DD`。

---

## 10. Training Selectors

集中实现：

```ts
getPracticeCount(questionId)
getFirstPracticedAt(questionId)
getLastPracticedAt(questionId)
hasPracticedToday(questionId)

getTodayPracticeRecords()
getTodayUniqueQuestionIds()
getUnpracticedQuestionIds()

getDailyPracticeCounts()
getPracticeStreak()

getModulePracticeProgress(category)
getDailyPlanProgress(plan)
getPlanModuleProgress(date, category)
```

不要各页面重复计算。

---

## 11. Question Detail｜完成练习

单题训练页面增加主操作：

> ✓ 完成练习

建议放在 Output Practice / 90-60-45 区域。

点击后：

1. 新增一条 PracticeRecord；
2. 自动更新今日计划完成度；
3. 显示：

```text
✓ 已记录
本题累计练习 4 次
今日项目与论文：2 / 3
```

4. 提供短时间撤销。

以下行为不能自动算练习：

- 打开题目
- 点击 TTS
- 点击 Play All
- 启动 timer
- 看 Thinking
- 看 Answer

必须由用户主动点击“完成练习”才记录。

---

## 12. 单题练习状态

Question Detail 显示：

```text
累计练习 4 次
首次：2026-08-10
最近：今天 15:42
```

如果未练：

```text
尚未完成过正式练习
```

增加可展开：

> 练习记录

默认显示最近 10 次。

---

## 13. Questions Page｜练习覆盖

每道题显示：

### 未练
`○ 未练`

### 已练
`✓ 已练 3 次`

### 今天已经练过
`✓ 今天练过 · 累计 3 次`

增加筛选：

- 全部
- 未练
- 已练
- 今天练过

并和现有 category / tag / favorite / mastery 组合使用。

---

## 14. Dashboard｜今日研习

把首页真正做成每天打开的训练工作台。

### 14.1 今日计划

例如：

```text
今日目标 8题
██████████████░░░░  5 / 8
```

下面按模块：

```text
自我情况      3 / 3 ✓
报考动机      1 / 2
项目与论文    1 / 3
```

### 14.2 今天建议练什么

根据 Daily Plan + Practice History 推荐：

```text
自我情况
Q03 · 未练
Q05 · 未练

项目与论文
Q37 · 未练
Q40 · 4天未练
```

点击直接进入单题页。

### 14.3 今日练习统计

显示：

```text
今日练习次数：7
今日不同题目：5
今日新题：3
今日复习：2
```

新题：今天第一次产生 PracticeRecord 的题。  
复习：今天练习前已经有历史 PracticeRecord 的题。

### 14.4 核心题覆盖

例如：

```text
核心题覆盖
28 / 47
还剩 19 题从未正式练习
```

这块需要醒目。

### 14.5 模块覆盖

按 category：

```text
自我情况      9 / 11
报考动机      3 / 3
未来规划      2 / 5
本科学习      5 / 9
项目与论文    4 / 8
```

统计“至少练过一次的题 / 模块总题数”。

### 14.6 最近练习

最近 8–10 条：

```text
15:42  Q37  请简要介绍你的论文       第4次
15:26  Q17  你的研究兴趣是什么       第3次
14:58  Q03  为什么读研               第1次
```

点击进入对应题目。

### 14.7 连续打卡

显示：

```text
连续练习 5 天
```

规则：

- 有至少一条 PracticeRecord 的自然日算完成；
- 今天还没练时，不要因为当天为空就错误把昨天仍在延续的 streak 显示成 0；
- 中间自然日完全没练时，从最近连续区间重新计算。

---

## 15. 日历 / 月度概览

做一个轻量月历或最近 30 天概览。

每天显示：

- 是否练过
- 当天练了多少道不同题

点击日期后显示：

- 当天计划
- 完成度
- 练了哪些题
- 总次数

不要做复杂数据分析后台。

---

## 16. 计划历史

用户可以查看：

```text
8月14日
计划 8题
完成 7题

8月13日
计划 6题
完成 6题
```

V1 主要用于回看。

---

## 17. 模块进度

Dashboard 或 Questions Page 增加：

> 模块进度

点击：

```text
项目与论文 4 / 8
```

直接筛选到这个模块。

模块内部默认可以优先：

1. 未练
2. 最近最久未练
3. 今天练过
4. 练习次数较多

---

## 18. mastery 与 practice 不自动联动

不要自动修改 mastery。

例如：

```text
练了 10 次
```

不等于：

```text
mastery = 4
```

最多视觉提示：

> 已练 6 次，当前熟练度仍为 1

让用户自己调整 mastery。

---

## 19. Export / Backup

当前 Dataset Export 不要被破坏。

增加完整备份：

```json
{
  "schemaVersion": 1,
  "app": "Qingyun Speak",
  "exportedAt": "...",
  "dataset": {},
  "trainingHistory": {},
  "dailyPlans": {},
  "settings": {}
}
```

并支持完整恢复。

如果完整恢复本轮工作量过大，至少做到导出练习记录和每日计划。

---

## 20. Settings

增加 Training Data：

- 导出完整训练数据
- 清空练习历史
- 清空每日计划

清空练习历史 / 每日计划必须二次确认。

---

## 21. UI 文案

统一使用：

- 今日计划
- 完成练习
- 今天练过
- 累计练习
- 首次练习
- 最近练习
- 练习记录
- 未练
- 核心题覆盖
- 模块进度
- 新题
- 复习

避免混用“背过 / 学过 / 掌握”，因为语义不同。

---

## 22. Tests

至少覆盖：

### Training History
- add record
- undo
- count
- first / last
- today
- unique questions
- new vs review
- unpracticed
- streak
- damaged localStorage fallback

### Daily Plan
- save daily plan
- edit plan
- copy yesterday plan
- module target
- total progress
- module progress
- local date handling
- old plan persistence

### UI / Filter
- 未练筛选
- 今天练过筛选
- 模块筛选
- Dashboard 计划统计

---

## 23. 数据迁移

现有用户可能已经有：

- dataset localStorage
- mastery
- favorite

新增功能绝不能清掉这些数据。

TrainingHistory 和 DailyPlan 从空数据开始即可。

---

## 24. 视觉要求

不要做成企业 OKR 系统 / BI Dashboard / Habit Tracker App。

仍然是：

> **青云研语个人学习桌。**

Dashboard 最重要的信息只有：

1. 今天计划练什么；
2. 今天完成多少；
3. 哪些核心题还没开口；
4. 最近练了什么；
5. 连续练了多久。

统计服务训练，不是为了展示图表。

---

## 25. 推荐开发顺序

### M6.1｜Training Data
- PracticeRecord
- TrainingHistory storage
- selectors
- tests

### M6.2｜Daily Plan
- DailyPlan model
- storage
- module targets
- selectors
- tests

### M6.3｜Question Integration
- 完成练习
- undo
- 单题历史
- Questions 状态与筛选

### M6.4｜Dashboard
- 今日计划
- 模块目标
- 推荐题
- 今日统计
- 核心覆盖
- 模块覆盖
- 最近记录
- streak

### M6.5｜Calendar & Backup
- 月度概览
- 计划历史
- 完整导出/恢复

### M6.6｜QA
- responsive
- accessibility
- Safari
- tests
- lint
- build

---

## 26. Autonomous Build Loop

持续执行：

```text
Inspect
→ Plan
→ Implement
→ Test
→ Build
→ Fix
→ Review
→ Update PROGRESS.md
→ Continue
```

普通 TypeScript 错误、测试失败、CSS 问题都不是停止理由。

不要中途问“要不要继续”。

---

## 27. Final Quality Gate

完成后执行：

```bash
npm test
npm run lint
npm run build
```

如果已有 E2E：

```bash
npm run test:e2e
```

全部 PASS。

至少手工检查：

- 1440px Desktop
- 390px Mobile
- Safari 下 localStorage / date / 打卡正常

---

## 28. 最终汇报

完成后只汇报：

1. 新增哪些功能；
2. Daily Plan 数据结构；
3. Training History 数据结构；
4. Dashboard 现在能看到什么；
5. Questions / Question Detail 改了什么；
6. 测试结果；
7. 有没有 blocker。

现在开始。
