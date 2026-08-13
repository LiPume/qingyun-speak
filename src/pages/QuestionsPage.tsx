import { Plus, Search, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { QuestionCard } from "../components/question/QuestionCard";
import { createEmptyQuestion, QuestionEditor } from "../components/question/QuestionEditor";
import { SpeechControls } from "../components/speech/SpeechControls";
import { useDataset } from "../features/dataset/DatasetContext";
import { filterQuestions, type QuestionFilters } from "../features/search/filterQuestions";
import { useSpeech } from "../hooks/useSpeech";
import type { MasteryLevel } from "../models/dataset";

const initialFilters: QuestionFilters = { search: "", category: "", tag: "", favoriteOnly: false, mastery: "all" };
export function QuestionsPage() {
  const { dataset, loading, saveQuestion } = useDataset();
  const [filters, setFilters] = useState(initialFilters);
  const [adding, setAdding] = useState(false);
  const speech = useSpeech();
  const navigate = useNavigate();
  const categories = useMemo(() => [...new Set(dataset?.questions.map((q) => q.category) ?? [])].sort(), [dataset]);
  const tags = useMemo(() => [...new Set(dataset?.questions.flatMap((q) => q.tags) ?? [])].sort(), [dataset]);
  const filtered = useMemo(() => filterQuestions(dataset?.questions ?? [], filters), [dataset, filters]);
  if (loading || !dataset) return <LoadingState />;
  const random = () => { const q = filtered[Math.floor(Math.random() * filtered.length)]; if (q) navigate(`/question/${q.id}`, { state: { training: true } }); };
  return <div className="page">
    <PageHeader eyebrow="QUESTION LIBRARY" title="题库" description={`在 ${dataset.questions.length} 道题里，找到今天值得认真说一遍的问题。`} actions={<><button className="button secondary" onClick={random} disabled={!filtered.length}><Shuffle size={17} /> 随机</button><button className="button primary" onClick={() => setAdding(true)}><Plus size={17} /> 添加题目</button></>} />
    <section className="filter-panel" aria-label="题库筛选"><label className="search-field"><Search size={18} /><span className="sr-only">搜索</span><input name="question-search" autoComplete="off" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="搜索问题、答案、关键词…" /></label><label><span className="sr-only">分类</span><select name="category-filter" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">全部分类</option>{categories.map((x) => <option key={x}>{x}</option>)}</select></label><label><span className="sr-only">标签</span><select name="tag-filter" value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })}><option value="">全部标签</option>{tags.map((x) => <option key={x}>{x}</option>)}</select></label><label><span className="sr-only">熟练度</span><select name="mastery-filter" value={filters.mastery} onChange={(e) => setFilters({ ...filters, mastery: e.target.value === "all" ? "all" : Number(e.target.value) as MasteryLevel })}><option value="all">全部熟练度</option>{[0,1,2,3,4].map((x) => <option key={x} value={x}>{x} / 4</option>)}</select></label><label className="check-field"><input name="favorite-filter" type="checkbox" checked={filters.favoriteOnly} onChange={(e) => setFilters({ ...filters, favoriteOnly: e.target.checked })} /> 只看收藏</label></section>
    <div className="results-bar"><span>{filtered.length} 道题</span><SpeechControls speech={speech} /></div>
    {filtered.length ? <section className="question-grid">{filtered.map((q) => <QuestionCard key={q.id} question={q} speech={speech} onFavorite={() => saveQuestion({ ...q, favorite: !q.favorite, updatedAt: new Date().toISOString() })} />)}</section> : <div className="empty-state"><strong>没有匹配的题目</strong><span>调整筛选条件，或添加一道新题。</span><button className="text-link" onClick={() => setFilters(initialFilters)}>清除筛选</button></div>}
    {adding && <QuestionEditor initial={createEmptyQuestion()} onCancel={() => setAdding(false)} onSave={(question) => { saveQuestion(question); setAdding(false); }} />}
  </div>;
}
