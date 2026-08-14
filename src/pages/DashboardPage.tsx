import { ArrowRight, CheckCircle2, CircleDot, Flame, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { DailyPlanEditor } from "../components/training/DailyPlanEditor";
import { PracticeCalendar } from "../components/training/PracticeCalendar";
import { useDataset } from "../features/dataset/DatasetContext";
import { useTraining } from "../features/training/TrainingContext";
import {
  getDailyPlanProgress,
  getDailyPlanRecommendations,
  getDailyPracticeStats,
  getModulePracticeProgress,
  getPracticeStreak,
} from "../features/training/selectors";
import { formatLocalDateLabel, getLocalDateKey } from "../lib/localDate";

export function DashboardPage() {
  const { dataset, loading, error } = useDataset();
  const { history, dailyPlans, savePlan, removePlan, copyYesterdayPlan } = useTraining();
  if (loading) return <LoadingState />;
  if (!dataset || error) return <div className="empty-state">{error ?? "题库暂不可用。"}</div>;
  const today = getLocalDateKey();
  const todayPlan = dailyPlans.plans.find((plan) => plan.date === today);
  const progress = getDailyPlanProgress(todayPlan, dataset.questions, history);
  const recommendations = getDailyPlanRecommendations(todayPlan, dataset.questions, history);
  const todayStats = getDailyPracticeStats(history, today);
  const streak = getPracticeStreak(history);
  const categories = [...new Set(dataset.questions.map((question) => question.category))].map((category) => ({
    category,
    questionCount: dataset.questions.filter((question) => question.category === category).length,
    coreCount: dataset.questions.filter((question) => question.category === category && question.tags.includes("核心题库")).length,
  }));
  const moduleCoverage = categories.map(({ category }) => getModulePracticeProgress(category, dataset.questions, history));
  const coreQuestions = dataset.questions.filter((question) => question.tags.includes("核心题库"));
  const practicedIds = new Set(history.records.map((record) => record.questionId));
  const corePracticed = coreQuestions.filter((question) => practicedIds.has(question.id)).length;
  const questionById = new Map(dataset.questions.map((question) => [question.id, question]));
  const recentRecords = [...history.records].sort((a, b) => b.practicedAt.localeCompare(a.practicedAt)).slice(0, 10);
  const planHistory = dailyPlans.plans.slice(0, 10);
  const progressPercent = progress.targetCount ? Math.min(100, Math.round(progress.completedCount / progress.targetCount * 100)) : 0;

  return <div className="page page-dashboard">
    <PageHeader eyebrow={`TODAY · ${formatLocalDateLabel(today, { month: "long", day: "numeric", weekday: "long" })}`} title="今天，开口练哪几题？" description="按模块定一个够得着的目标。每完成一道正式练习，进度会自动往前走。" />
    <section className="today-plan-card" aria-labelledby="today-plan-title">
      <header><div><span className="eyebrow">DAILY ROUTE</span><h2 id="today-plan-title">今日计划</h2></div><div className="plan-total"><strong>{progress.completedCount}</strong><span>/ {progress.targetCount || 0} 题</span></div></header>
      <div className="plan-progress" aria-label={`今日计划完成 ${progress.completedCount} / ${progress.targetCount}`}><i style={{ width: `${progressPercent}%` }} /></div>
      {progress.modules.length > 0 && <div className="module-route">{progress.modules.map((module) => { const done = module.completedCount >= module.targetCount; return <div key={module.category} className={done ? "done" : ""}><span>{done ? <CheckCircle2 size={17} aria-hidden="true" /> : <CircleDot size={17} aria-hidden="true" />}</span><strong>{module.category}</strong><b>{module.completedCount} / {module.targetCount}</b></div>; })}</div>}
      <DailyPlanEditor categories={categories} plan={todayPlan} onSave={(targets) => savePlan(today, targets)} onClear={() => removePlan(today)} onCopyYesterday={() => copyYesterdayPlan(today)} />
    </section>

    <section id="today-recommendations" className="recommendation-panel section-block"><div className="section-heading"><div><span className="eyebrow">AUTO PLAN · NO AI</span><h2>今天建议练什么</h2></div><span>推荐不绑定，练同模块任何题都计入进度。</span></div>
      {!todayPlan ? <div className="inline-empty">先在上方设置模块目标题数，系统会优先安排未练核心题和久未复习题。</div> : progress.completedCount >= progress.targetCount ? <div className="inline-empty success">今日计划已完成。想多练一轮，也可以继续从题库自由选择。</div> : <div className="recommendation-groups">{[...recommendations].map(([category, items]) => items.length > 0 && <section key={category}><header><strong>{category}</strong><span>{progress.modules.find((module) => module.category === category)?.completedCount ?? 0} / {progress.modules.find((module) => module.category === category)?.targetCount ?? 0}</span></header>{items.map(({ question, reason }) => <Link key={question.id} to={`/question/${question.id}`} state={{ training: true }}><span><b>{question.id}</b><strong>{question.question.zh || question.question.en}</strong></span><em>{reason}</em><ArrowRight size={16} aria-hidden="true" /></Link>)}</section>)}</div>}
    </section>

    <section className="dashboard-split"><div className="today-stats"><div className="section-heading"><div><span className="eyebrow">TODAY</span><h2>今日练习统计</h2></div><span className="streak-badge"><Flame size={17} aria-hidden="true" /> 连续练习 {streak} 天</span></div><div className="practice-stat-grid">{[["今日练习次数", todayStats.totalRecords], ["今日不同题目", todayStats.uniqueQuestions], ["新题", todayStats.newQuestions], ["复习", todayStats.reviewQuestions]].map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div></div><div className="core-coverage"><span className="eyebrow">CORE COVERAGE</span><h2>核心题覆盖</h2><strong>{corePracticed} <small>/ {coreQuestions.length}</small></strong><div className="plan-progress"><i style={{ width: `${coreQuestions.length ? corePracticed / coreQuestions.length * 100 : 0}%` }} /></div><p>还剩 {coreQuestions.length - corePracticed} 题从未正式练习</p><Link to="/questions?tag=%E6%A0%B8%E5%BF%83%E9%A2%98%E5%BA%93&practice=unpracticed" className="text-link">去看未练核心题 <ArrowRight size={15} aria-hidden="true" /></Link></div></section>

    <section className="module-progress-panel section-block"><div className="section-heading"><div><span className="eyebrow">COVERAGE</span><h2>模块进度</h2></div><span>至少正式练过一次 / 模块总题数</span></div><div className="module-progress-list">{moduleCoverage.map((module) => <Link key={module.category} to={`/questions?category=${encodeURIComponent(module.category)}`}><span><strong>{module.category}</strong><small>{module.practicedCount === module.totalCount ? "已覆盖" : `还剩 ${module.totalCount - module.practicedCount} 题`}</small></span><b>{module.practicedCount} / {module.totalCount}</b><i><span style={{ width: `${module.totalCount ? module.practicedCount / module.totalCount * 100 : 0}%` }} /></i></Link>)}</div></section>

    <section className="dashboard-split lower"><div className="recent-practice"><div className="section-heading"><div><span className="eyebrow">RECENT</span><h2>最近练习</h2></div></div>{recentRecords.length ? <ul>{recentRecords.map((record) => { const question = questionById.get(record.questionId); const number = history.records.filter((item) => item.questionId === record.questionId && item.practicedAt <= record.practicedAt).length; return <li key={record.id}><time dateTime={record.practicedAt}>{new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(record.practicedAt))}</time>{question ? <Link to={`/question/${question.id}`}><b>{question.id}</b><span>{question.question.zh || question.question.en}</span></Link> : <span>{record.questionId}</span>}<em>第 {number} 次</em></li>; })}</ul> : <div className="inline-empty">完成第一道正式练习后，最近记录会出现在这里。</div>}</div><div className="plan-history"><div className="section-heading"><div><span className="eyebrow">PLAN HISTORY</span><h2>计划历史</h2></div></div>{planHistory.length ? <ul>{planHistory.map((plan) => { const itemProgress = getDailyPlanProgress(plan, dataset.questions, history); return <li key={plan.date}><span><strong>{formatLocalDateLabel(plan.date)}</strong><small>{plan.moduleTargets.length} 个模块</small></span><b>计划 {itemProgress.targetCount} 题</b><em>完成 {itemProgress.completedCount} 题</em></li>; })}</ul> : <div className="inline-empty">保存今日计划后，可在这里回看过去的完成情况。</div>}</div></section>

    <PracticeCalendar questions={dataset.questions} history={history} dailyPlans={dailyPlans} />
    <footer className="dashboard-footer"><RotateCcw size={14} aria-hidden="true" /> 打开题目、朗读或启动计时器都不会自动打卡；只有“完成练习”会写入记录。</footer>
  </div>;
}
