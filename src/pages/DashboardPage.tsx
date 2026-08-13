import { ArrowRight, BookOpenText, CloudSun, Shuffle, Speech } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { useDataset } from "../features/dataset/DatasetContext";

export function DashboardPage() {
  const { dataset, loading, error } = useDataset();
  const navigate = useNavigate();
  if (loading) return <LoadingState />;
  if (!dataset || error) return <div className="empty-state">{error ?? "题库暂不可用。"}</div>;
  const stats = [
    ["全部题目", dataset.questions.length], ["已收藏", dataset.questions.filter((q) => q.favorite).length],
    ["稳定输出", dataset.questions.filter((q) => q.mastery >= 3).length], ["练习中", dataset.questions.filter((q) => q.mastery > 0 && q.mastery < 3).length],
  ];
  const focus = dataset.questions.find((q) => q.favorite) ?? dataset.questions[0];
  return <div className="page page-dashboard">
    <PageHeader eyebrow="TODAY · 今日研习" title="把思路，练成从容的表达。" description="不背整篇答案。先想清楚，再用短句把观点稳稳说出来。" />
    <section className="hero-workbench">
      <div className="hero-copy"><span className="date-mark"><CloudSun size={18} /> 今日训练</span><h2>{focus?.question.en}</h2><p>{focus?.question.zh}</p>
        {focus && <Link className="button primary" to={`/question/${focus.id}`} state={{ training: true }}>开始一轮训练 <ArrowRight size={17} /></Link>}</div>
      <div className="training-path" aria-label="训练路径：思考、短语、回答、限时输出">
        {[["01", "Thinking"], ["02", "Phrases"], ["03", "Answer"], ["90·60·45", "Speak"]].map(([step, label]) => <div key={label}><b>{step}</b><span>{label}</span></div>)}
      </div>
    </section>
    <section className="stat-grid" aria-label="题库统计">{stats.map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">QUICK START</span><h2>现在练什么？</h2></div></div>
      <div className="action-grid">
        <Link to="/questions"><BookOpenText /><div><strong>浏览题库</strong><span>搜索、筛选与整理 98 道问题</span></div><ArrowRight /></Link>
        <button onClick={() => { const q = dataset.questions[Math.floor(Math.random() * dataset.questions.length)]; if (q) navigate(`/question/${q.id}`, { state: { training: true } }); }}><Shuffle /><div><strong>随机抽题</strong><span>只看题目，逐层揭示思路</span></div><ArrowRight /></button>
        <Link to="/pronunciation"><Speech /><div><strong>发音热身</strong><span>从个人与科研高频词开始</span></div><ArrowRight /></Link>
      </div>
    </section>
  </div>;
}
