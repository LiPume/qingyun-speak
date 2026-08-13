# 青云研语 Technical Design｜V1.0

> **Qingyun Speak**  
> 技术目标：构建一个稳定、可维护、无后端依赖的训练 Web App。

## 1. 技术栈

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router（优先 HashRouter）

选择原因：
- React：后续会继续扩展训练模块，组件化更易维护。
- TypeScript：用于约束题库 Schema、Legacy Adapter、TTS 与训练状态。
- Vite：轻量构建，适合 GitHub Pages。
- Tailwind CSS：快速建立一致设计系统，同时保留高度定制能力。

## 2. Speech

V1 使用浏览器原生：

```text
Web Speech API
└── SpeechSynthesis
    ├── SpeechSynthesisUtterance
    ├── getVoices()
    └── speak()
```

不依赖：
- 预录 mp3
- 后端
- TTS API
- API Key

修改任意文本后可以立即朗读。

## 3. Storage

V1 使用：

```text
localStorage
```

保存：
- dataset
- pronunciation bank
- settings
- training status

当前数据规模不引入 IndexedDB。

## 4. Deploy

```text
GitHub
↓
GitHub Actions
↓
Vite build
↓
dist/
↓
GitHub Pages
```

## 5. 推荐目录结构

```text
qingyun-speak/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   ├── PRD.md
│   ├── TECHNICAL_DESIGN.md
│   └── PROGRESS.md
├── public/
│   └── data/
│       └── default-dataset.json
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── router.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── question/
│   │   ├── speech/
│   │   └── training/
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── QuestionsPage.tsx
│   │   ├── QuestionDetailPage.tsx
│   │   ├── PronunciationPage.tsx
│   │   └── SettingsPage.tsx
│   ├── features/
│   │   ├── dataset/
│   │   ├── import-export/
│   │   ├── search/
│   │   ├── speech/
│   │   └── training/
│   ├── adapters/
│   │   └── ciciAdapter.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useSpeech.ts
│   │   └── useTrainingTimer.ts
│   ├── lib/
│   │   ├── ids.ts
│   │   ├── sentence.ts
│   │   └── text.ts
│   ├── models/
│   │   ├── dataset.ts
│   │   ├── question.ts
│   │   └── settings.ts
│   ├── storage/
│   │   └── storage.ts
│   └── styles/
│       └── globals.css
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 6. 核心数据模型

### InterviewQuestion

```ts
export interface InterviewQuestion {
  id: string;
  category: string;

  question: {
    en: string;
    zh: string;
  };

  thinking: string[];
  phrases: Phrase[];

  answer: {
    en: string[];
    zh: string[];
  };

  keywords: string[];
  fallbacks: FallbackExpression[];
  tags: string[];

  favorite: boolean;
  mastery: MasteryLevel;

  createdAt?: string;
  updatedAt?: string;
}
```

### Phrase

```ts
export interface Phrase {
  id: string;
  en: string;
  zh?: string;
}
```

### FallbackExpression

```ts
export interface FallbackExpression {
  term?: string;
  preferred?: string;
  fallback: string;
  zh?: string;
}
```

### Mastery

```ts
export type MasteryLevel =
  | 0  // 未学习
  | 1  // 看过
  | 2  // 借助框架能答
  | 3  // 可以稳定输出
  | 4; // 成熟表达
```

## 7. Dataset

```ts
export interface InterviewDataset {
  schemaVersion: 1;

  metadata: {
    name: string;
    updatedAt: string;
  };

  questions: InterviewQuestion[];
  pronunciation: PronunciationItem[];
}
```

## 8. Legacy Cici Adapter

旧 JSON 不直接参与 UI。

流程：

```text
Cici JSON
↓
detectSchema()
↓
ciciAdapter()
↓
InterviewDataset
↓
validate()
↓
Storage
```

强制要求：
- 兼容现有旧 JSON
- 不依赖旧 `audioFile`
- 导入失败必须有明确错误
- Adapter 必须有单元测试

## 9. Cici Question Parser

旧格式：

```text
What are your research interests? / 你的研究兴趣是什么
```

转换为：

```ts
{
  en: "What are your research interests?",
  zh: "你的研究兴趣是什么"
}
```

不要直接 `split("/")`。

优先识别 `" / "`，并设置 fallback，避免英文正文中的 `/` 被误拆。

## 10. Answer Parser

旧格式通常为：

```text
English paragraph

中文段落
```

转换策略：
1. 识别中英文主要分界
2. 英文进入句子切分
3. 中文先作为 notes 保存
4. 不强制中英文逐句一一对齐

## 11. Sentence Segmentation

统一封装：

```ts
splitEnglishSentences(text: string): string[]
```

需要处理：
- `.`
- `?`
- `!`
- `Mr.`
- `Dr.`
- `e.g.`
- `i.e.`

优先 `Intl.Segmenter`，不可用时 fallback 到规则分句。

UI 组件禁止各自写一套 regex。

## 12. Speech Architecture

统一通过：

```ts
useSpeech()
```

UI 组件不要直接操作：

```ts
window.speechSynthesis
```

目标 API：

```ts
const {
  voices,
  selectedVoice,
  rate,
  status,
  speak,
  stop,
  pause,
  resume,
  setVoice,
  setRate
} = useSpeech();
```

## 13. Speech Status

```ts
type SpeechStatus =
  | "idle"
  | "speaking"
  | "paused";
```

## 14. Speak Contract

```ts
speak({
  text,
  id,
  lang: "en-US"
});
```

每次用户主动发起新播放：

```text
cancel current
↓
create SpeechSynthesisUtterance
↓
set lang / voice / rate
↓
speak
```

## 15. Voice Loading

使用：

```ts
speechSynthesis.getVoices()
```

同时监听：

```text
voiceschanged
```

优先级：

```text
用户保存的 voiceURI
↓
en-US voice
↓
English voice
↓
系统默认
```

不得硬编码 `Samantha` 等具体 voice 名。

## 16. TTS Settings

```ts
interface SpeechSettings {
  voiceURI?: string;
  rate: number;
}
```

默认：

```text
rate = 0.9
```

保存至 localStorage。

## 17. SpeakableText

支持：

```ts
interface SpeakableTextProps {
  text: string;
  mode: "word" | "sentence" | "phrase";
}
```

单词点击需要避免破坏整句易读性。

## 18. SentencePlayer

输入：

```ts
sentences: string[]
```

状态：

```ts
activeSentenceIndex
```

点击第 N 句：

```text
cancel current
↓
activeSentenceIndex = N
↓
play sentence N
```

## 19. Continuous Play

`Play All` 不把整段塞进一个 utterance。

使用：

```text
sentence 0
↓ onend
sentence 1
↓ onend
sentence 2
...
```

从而支持：
- 当前句高亮
- 跳句
- 单句重复
- 精确停止
- 从任意句继续

## 20. Question Detail Component Tree

```text
QuestionDetailPage
├── QuestionHeader
├── ThinkingPanel
├── PhrasePanel
├── AnswerPanel
│   └── SentencePlayer
├── ChineseNotesPanel
├── FallbackPanel
└── TrainingPanel
```

## 21. Progressive Reveal

```ts
interface RevealState {
  thinking: boolean;
  phrases: boolean;
  answer: boolean;
  chinese: boolean;
}
```

Random / 陌生题模式默认：

```text
thinking = false
phrases = false
answer = false
```

## 22. Training Timer

Hook：

```ts
useTrainingTimer()
```

支持：

```ts
type TrainingDuration = 90 | 60 | 45;
```

状态：

```ts
{
  duration,
  remaining,
  running
}
```

## 23. 90 → 60 → 45 Workflow

```ts
round = 1 | 2 | 3
```

对应：

```text
Round 1 → 90
Round 2 → 60
Round 3 → 45
```

每轮结束提供一句简短 guidance。

## 24. Search

生成统一 `normalizedSearchText`，包含：
- English Question
- Chinese Question
- English Answer
- Keywords
- Tags

V1 直接字符串搜索，不引入全文检索库。

## 25. Filtering

支持：
- category
- tag
- favorite
- mastery

多条件默认 AND。

## 26. Local Storage Keys

集中定义：

```ts
const STORAGE_KEYS = {
  dataset: "qingyun.dataset.v1",
  settings: "qingyun.settings.v1",
  training: "qingyun.training.v1"
};
```

禁止在组件中散落硬编码 key。

## 27. Storage Layer

UI 不直接调用 `localStorage.setItem()`。

统一使用：

```ts
loadDataset()
saveDataset()
loadSettings()
saveSettings()
resetDataset()
```

## 28. Import Pipeline

```text
Select JSON
↓
JSON.parse
↓
detect schema
↓
adapt if necessary
↓
validate
↓
preview
↓
user confirms
↓
save
```

失败必须显示具体错误。

## 29. Export

默认：

```text
qingyun-speak-backup-YYYY-MM-DD.json
```

导出 Native Dataset Schema V1。

## 30. Default Dataset

路径：

```text
/public/data/default-dataset.json
```

首次访问：

```text
if no local dataset:
    load default
else:
    load local
```

## 31. Reset

Settings 页面提供：

`Reset to Default Dataset`

必须二次确认。

## 32. Routing

推荐 `HashRouter`：

```text
/#/
/#/questions
/#/question/Q17
/#/pronunciation
/#/settings
```

这样减少 GitHub Pages SPA refresh / 404 配置复杂度。

## 33. Responsive Priority

### P1
Mac Desktop Safari

### P2
Desktop Chrome

### P3
Mobile Safari / Chrome

手机端题目页改为单列。

## 34. 视觉设计方向

产品名：**青云研语**

定位：

> 安静、清楚、有学习感、有一点“青云直上”的吉利寓意，但不要做成传统培训网站。

建议：
- 暖米白背景
- 深墨蓝 / 靛蓝主色
- 少量青玉色强调
- 白色内容卡片
- 清楚的信息层级
- 少量微交互
- 不使用廉价大渐变
- 不使用满屏玻璃拟态
- 不堆大量圆角胶囊
- 不做通用紫色 AI 科技风

目标体验：

> **一个每天愿意打开的个人学习工作台。**

## 35. Accessibility

至少做到：
- icon-only button 有 `aria-label`
- focus state 可见
- keyboard 可访问主要操作
- 文本对比度合理
- `prefers-reduced-motion`
- 不仅依赖颜色表达状态

## 36. Error Handling

TTS 不支持：

> Speech synthesis is not available in this browser.

无 English voice：
- fallback 系统默认
- 显示 warning
- 不阻塞应用

## 37. Testing

### Unit
重点：
- `ciciAdapter`
- `parseBilingualQuestion`
- `splitEnglishSentences`
- `storage`
- `filterQuestions`
- timer

### Component
- QuestionCard
- RevealPanel
- SentencePlayer 基础状态
- TrainingTimer

### E2E / Smoke

```text
load
→ import legacy JSON
→ search
→ open question
→ edit
→ reload
→ export
```

TTS 自动化测试可 mock；真实 Safari 发音需要手工 smoke test。

## 38. 测试工具

- Vitest
- React Testing Library
- Playwright

最低要求：

```bash
npm test
npm run build
```

均通过。

## 39. Git Workflow

个人项目：

```text
main
feature/*
```

## 40. GitHub Pages CI

```text
checkout
↓
setup-node
↓
npm ci
↓
npm test
↓
npm run build
↓
upload-pages-artifact
↓
deploy-pages
```

## 41. Security

V1：

```text
NO API KEY
NO SECRET
NO TOKEN
```

未来接 AI API 时必须增加 server / serverless proxy。

## 42. Milestones

### M0｜Skeleton & Deploy
- Vite
- React
- TypeScript
- Tailwind
- Router
- 页面骨架
- GitHub Pages workflow
- build 通过

### M1｜Data Core
- Native Schema
- Legacy Cici Adapter
- Validation
- Default Dataset
- LocalStorage
- Import / Export
- Unit tests

### M2｜Core UI
- Dashboard
- Question list
- Search
- Filters
- Question detail
- Edit / Add / Delete
- Favorite / Mastery

### M3｜Speech
- Voice list
- rate
- sentence speak
- phrase speak
- word speak
- Play All
- active sentence highlight
- pause / resume / stop

### M4｜Training
- Progressive Reveal
- Random Question
- 90 / 60 / 45 timer
- Pronunciation Bank
- Fallback display

### M5｜Polish & QA
- Responsive
- Accessibility
- Empty states
- Error handling
- UX audit
- Playwright smoke tests
- README
- Pages production verification

## 43. Definition of Done

本地必须满足：

```bash
npm install
npm run dev
npm test
npm run build
```

并在真实浏览器完成：

```text
导入旧 Cici JSON
→ 打开问题
→ 点击新修改的英文
→ 正常朗读
→ 修改答案
→ 新答案立即朗读
→ 刷新
→ 修改仍存在
→ 导出 backup
```

才算 V1 完成。
