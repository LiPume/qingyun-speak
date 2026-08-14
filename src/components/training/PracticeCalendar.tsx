import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { addLocalDays, formatLocalDateLabel, getLocalDateKey, parseLocalDateKey } from "../../lib/localDate";
import type { InterviewQuestion } from "../../models/dataset";
import type { DailyPlanStore, TrainingHistory } from "../../models/training";
import { getDailyPlanProgress, getDailyPracticeCounts, getRecordsForDate } from "../../features/training/selectors";

export function PracticeCalendar({ questions, history, dailyPlans }: { questions: InterviewQuestion[]; history: TrainingHistory; dailyPlans: DailyPlanStore }) {
  const today = getLocalDateKey();
  const dates = useMemo(() => Array.from({ length: 30 }, (_, index) => addLocalDays(today, index - 29)), [today]);
  const [selectedDate, setSelectedDate] = useState(today);
  const counts = useMemo(() => new Map(getDailyPracticeCounts(history).map((item) => [item.date, item])), [history]);
  const selectedRecords = getRecordsForDate(history, selectedDate).sort((a, b) => b.practicedAt.localeCompare(a.practicedAt));
  const selectedPlan = dailyPlans.plans.find((plan) => plan.date === selectedDate);
  const progress = getDailyPlanProgress(selectedPlan, questions, history);
  const questionById = new Map(questions.map((question) => [question.id, question]));
  return <section className="history-panel section-block"><div className="section-heading"><div><span className="eyebrow">LAST 30 DAYS</span><h2>练习足迹</h2></div><span className="streak-note"><CalendarDays size={16} aria-hidden="true" /> 每格是一个本地自然日</span></div>
    <div className="calendar-strip" role="group" aria-label="最近 30 天练习概览">{dates.map((date) => { const day = parseLocalDateKey(date); const count = counts.get(date)?.uniqueQuestions ?? 0; return <button key={date} className={`${count ? "has-practice" : ""} ${selectedDate === date ? "selected" : ""}`} aria-label={`${formatLocalDateLabel(date)}，${count ? `练习 ${count} 道不同题目` : "没有练习"}`} aria-pressed={selectedDate === date} onClick={() => setSelectedDate(date)}><span>{new Intl.DateTimeFormat("zh-CN", { weekday: "narrow" }).format(day)}</span><strong>{day.getDate()}</strong>{count > 0 && <i>{count}</i>}</button>; })}</div>
    <div className="day-detail"><header><div><strong>{formatLocalDateLabel(selectedDate, { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</strong><span>{selectedRecords.length} 次练习 · {counts.get(selectedDate)?.uniqueQuestions ?? 0} 道不同题目</span></div>{selectedPlan ? <span>计划完成 {progress.completedCount} / {progress.targetCount}</span> : <span>当天未设计划</span>}</header>{selectedPlan && <div className="day-plan-modules">{progress.modules.map((module) => <span key={module.category}>{module.category} {module.completedCount}/{module.targetCount}</span>)}</div>}{selectedRecords.length ? <ul>{selectedRecords.map((record) => <li key={record.id}><time dateTime={record.practicedAt}>{new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(record.practicedAt))}</time><span>{questionById.get(record.questionId)?.question.zh ?? record.questionId}</span></li>)}</ul> : <p className="muted">这一天还没有正式练习记录。</p>}</div>
  </section>;
}
