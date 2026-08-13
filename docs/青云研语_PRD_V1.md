# 青云研语 PRD｜V1.0

> **Qingyun Speak**  
> *Think first. Speak clearly.*

- 产品名称：**青云研语**
- 英文名：**Qingyun Speak**
- 推荐仓库名：`qingyun-speak`
- 产品形态：Web App / GitHub Pages
- 当前版本：V1

## 1. 项目背景

现有 Cici 口语抽背网页能做题库、标签、搜索、导入导出和部分真人音频，但真人音频与原始题目绑定。题目修改后，新文本无法自动获得匹配音频，因此不适合持续迭代个性化语料。

青云研语围绕真正的面试训练闭环设计：

**先形成逻辑 → 调用语言积木 → 听准发音 → 主动输出 → 复盘 → 再输出**

## 2. 首要目标

帮助用户在英语面试中：

> **展示清晰的逻辑思考，并保持表达链路不断。**

训练分三层：

### Level 1｜准备过的问题
- 45–75 秒稳定输出
- 4–6 个短句完成完整逻辑
- 表达成熟、自然、个性化
- 允许 2–3 个较漂亮的表达

### Level 2｜半准备问题
依靠：
- Thinking Framework
- Phrase Blocks
- Personal Stories

现场拼装，而不是回忆全文。

### Level 3｜完全陌生问题
- 不长时间停顿
- 先给一个明确观点
- 至少有基本结构
- 忘词能 paraphrase
- 不因局部未知导致整体停机

## 3. 产品原则

### P1｜Long answer, short sentences
答案可以完整，但单句尽量只表达一个意思。

### P2｜Think first, then speak
回答先调用思想框架，再调用英语表达。

### P3｜Phrase over script
主要记忆单位是 phrase、sentence pattern、functional block，而不是整篇答案。

### P4｜Fallback is a feature
系统必须帮助训练：定义它 / 说作用 / 举例 / 换简单词。

### P5｜Every input ends with output
听完要自己读；看完要关掉材料说；AI 纠错后要再答一次。

## 4. V1 核心训练闭环

选择题目  
→ 先看/回忆 Thinking  
→ 调用 Phrase Blocks  
→ 点击听发音  
→ 查看 Spoken Answer  
→ 隐藏答案  
→ 90 秒输出  
→ 60 秒压缩  
→ 45 秒重组

这条链路顺畅，即视为 V1 产品成立。

## 5. 页面结构

1. Dashboard 首页
2. Questions 题库
3. Question Detail 单题训练
4. Pronunciation Bank 发音词库
5. Settings / Data 数据管理

## 6. Dashboard

### 今日训练
- 高频题训练
- 随机抽题
- 发音训练
- 继续上次训练

### 基础统计
- 总题数
- 已掌握
- 练习中
- 薄弱题
- 收藏题

V1 只做轻量统计。

## 7. Questions｜题库

每张卡片显示：
- 英文题目
- 中文题目
- 分类
- 标签
- 熟练度
- 收藏状态

支持：
- 搜索题目
- 搜索答案关键词
- 分类过滤
- 标签过滤
- 收藏过滤
- 熟练度过滤
- 随机抽题
- 添加 / 编辑 / 删除

## 8. Question Detail｜单题训练

### 8.1 Question
显示英文题目和中文题目。英文题目可点击朗读。

### 8.2 Thinking
例如：
1. 一个总方向
2. 两个具体问题
3. 与自己的经历连接

目的：先明确“我要表达什么”。支持展开/收起；陌生题模式默认隐藏。

### 8.3 Phrase Blocks
例如：
- `What interests me most is...`
- `One important reason is that...`
- `This is closely related to my previous experience in...`
- `In the future, I hope to...`

每条支持：
- 点击朗读
- 中文释义
- 加入发音词库

### 8.4 Spoken Answer
完整参考答案按句子拆开显示。

每句支持：
- 点击朗读
- 单句重复
- 从本句开始连续播放
- 调整语速
- 当前句高亮

完整答案只是“示范如何拼装”，不是要求逐字背诵。

### 8.5 中文速记
支持展开/收起。中文不要求逐句对应，只帮助确认真正想表达的思想。

### 8.6 Fallback Expressions
例如：

**Term** `interpretability`  
**Fallback** `We want to understand why the model makes this decision.`

**Term** `robustness`  
**Fallback** `The model can still work well when the input changes.`

## 9. TTS 点击朗读

支持三种粒度：

### Word
点击英文单词，朗读该词。

### Phrase / Sentence
点击短语或句子，朗读完整内容。

### Play All
连续朗读整个答案。

### TTS 控制
- Voice
- Rate
- Play
- Pause
- Resume
- Stop
- Repeat

Voice 优先 `en-US`，不得写死具体 voice 名。

Rate：
- 0.75×
- 0.9×
- 1.0×
- 1.1×

默认 `0.9×`。

### 当前句高亮
连续播放时当前句必须高亮。点击其他句子时立即停止当前语音并播放新句。

## 10. Simulation｜90 → 60 → 45

### Round 1｜90s
允许卡，先完整讲出来。

### Round 2｜60s
删除废话，保留核心逻辑。

### Round 3｜45s
不照搬上一遍，重新组织。

V1 支持：
- 开始
- 暂停
- 继续
- 重置
- 倒计时
- Round 切换提示

录音与 AI 点评留到后续。

## 11. Random / 陌生题模式

随机抽取题目，可限定：
- 全部
- 分类
- 标签
- 收藏
- 薄弱题

初始只显示 Question，然后逐层：
1. Show Thinking
2. Show Phrases
3. Show Answer

## 12. Pronunciation Bank｜发音词库

三类：

### A｜个人必会
- Hangzhou Dianzi University
- Operating Systems
- Compiler Principles
- autonomous driving
- multi-agent systems
- channel attention
- tool calling

### B｜科研高频
- methodology
- evaluation
- baseline
- framework
- hypothesis
- limitation
- empirical

### C｜论文生词
用户随时添加。

每条包括：
- English
- Chinese
- Category
- Note
- 熟练度

点击英文即可朗读。

## 13. 数据导入导出

### Import JSON
导入前：
- 检测 schema
- 展示预览
- 明确提示将覆盖当前数据
- 建议先导出备份

### Export JSON
默认文件名：
`qingyun-speak-backup-YYYY-MM-DD.json`

## 14. 兼容旧 Cici JSON

V1 强制要求兼容现有 Cici JSON。

旧结构示例：

```json
{
  "id": "1785238332773",
  "question": "What do you enjoy most about doing research? / 科研中你最享受的是什么",
  "answer": "English...\n\n中文...",
  "tags": ["P01 专业选择与学术动机"],
  "audioFile": "P01_01"
}
```

导入流程：

`Legacy Cici JSON → Adapter → Qingyun Native Dataset`

旧 `audioFile` 可以保留为 legacy metadata，但 V1 TTS 不依赖它。

## 15. 新标准数据模型

```json
{
  "id": "Q17",
  "category": "未来规划",
  "question": {
    "en": "What are your research interests?",
    "zh": "你的研究兴趣是什么？"
  },
  "thinking": [
    "一个总方向",
    "两个具体问题",
    "与过去经历连接"
  ],
  "phrases": [
    {
      "en": "What interests me most is...",
      "zh": "我最感兴趣的是……"
    }
  ],
  "answer": {
    "en": [
      "My current interest is reliable intelligent systems.",
      "I am especially interested in AI agents."
    ],
    "zh": [
      "我目前比较关注可靠智能系统。",
      "我尤其关注 AI Agent。"
    ]
  },
  "keywords": [],
  "fallbacks": [],
  "tags": [],
  "mastery": 0,
  "favorite": false
}
```

## 16. 数据持久化

V1 不做账号系统。

使用：
- localStorage
- 仓库内 default JSON 作为初始数据

首次访问：
- 无本地数据 → 读取默认数据
- 有本地数据 → 使用本地数据

系统长期提醒：**定期导出备份。**

## 17. 编辑器

分别编辑：
- English Question
- Chinese Question
- Category
- Thinking
- Phrases
- English Answer
- Chinese Notes
- Keywords
- Fallbacks
- Tags
- Mastery
- Favorite

不能把全部内容塞进一个 textarea。

## 18. V1 明确不做

- 登录
- 云数据库
- 多用户
- OpenAI API
- GPT 自动点评
- 服务器端 TTS
- 云端录音
- 社交功能
- 复杂间隔重复算法

## 19. V1.1 候选

- 浏览器录音
- 训练次数统计
- 随机抽题历史
- Phrase 抽背
- Paraphrase 抽背
- 熟练度统计
- 今日训练计划
- 论文朗读训练页

## 20. V2 候选

### AI Interview
- 模拟教授追问
- 评价逻辑结构
- 评价冗余
- 记录卡词
- 提供更简单表达

### Speech Analysis
- Speech-to-Text
- filler words
- 长停顿检测
- speaking rate
- 多轮复述对比

### Paper Trainer
- 粘贴论文段落
- 自动分句
- 点击句子朗读
- 点击单词朗读
- 标记生词
- 自己翻译
- AI 纠错
- 关闭 AI 再翻一次

## 21. V1 验收标准

- [ ] GitHub Pages 可访问
- [ ] Mac Safari 正常
- [ ] Desktop Chrome 正常
- [ ] 可直接导入现有 Cici JSON
- [ ] 题库列表正常
- [ ] 搜索正常
- [ ] 分类/标签过滤正常
- [ ] 点击英文题目可朗读
- [ ] 点击英文句子可朗读
- [ ] 点击英文单词可朗读
- [ ] 可选择英文 voice
- [ ] 可切换语速
- [ ] 可 Stop 当前朗读
- [ ] Thinking 可隐藏/展开
- [ ] Phrases 可隐藏/展开
- [ ] Answer 可隐藏/展开
- [ ] Random Question 可用
- [ ] 90/60/45 倒计时正常
- [ ] 修改题目后新文字立即可朗读
- [ ] 导入/导出 JSON 正常
- [ ] 刷新后本地数据仍存在
- [ ] 不依赖服务器
- [ ] 前端不存在 API Key 或 Secret
