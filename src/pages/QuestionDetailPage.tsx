import { ArrowLeft, ChevronDown, ChevronUp, Heart, Pencil, Plus, Trash2, Volume2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { QuestionEditor } from "../components/question/QuestionEditor";
import { SentencePlayer } from "../components/speech/SentencePlayer";
import { useSpeech } from "../hooks/useSpeech";
import { SpeechControls } from "../components/speech/SpeechControls";
import { SpeakableWords } from "../components/speech/SpeakableWords";
import { TrainingTimer } from "../components/training/TrainingTimer";
import { useDataset } from "../features/dataset/DatasetContext";

function RevealSection({ title, step, open, onToggle, children }: { title: string; step: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return <section className={`reveal-section ${open ? "open" : ""}`}><button className="reveal-heading" onClick={onToggle} aria-expanded={open}><span>{step}</span><strong>{title}</strong>{open ? <ChevronUp /> : <ChevronDown />}</button>{open && <div className="reveal-content">{children}</div>}</section>;
}

export function QuestionDetailPage() {
  const { questionId } = useParams(); const location = useLocation(); const navigate = useNavigate();
  const { dataset, loading, saveQuestion, deleteQuestion, savePronunciation } = useDataset();
  const question = dataset?.questions.find((item) => item.id === questionId);
  const training = Boolean((location.state as { training?: boolean } | null)?.training);
  const [reveal, setReveal] = useState({ thinking: !training, phrases: !training, answer: !training, chinese: !training });
  const [editing, setEditing] = useState(false); const speech = useSpeech();
  if (loading) return <LoadingState />;
  if (!question) return <div className="page"><div className="empty-state"><strong>没有找到这道题</strong><Link to="/questions" className="button secondary">返回题库</Link></div></div>;
  const toggle = (key: keyof typeof reveal) => setReveal({ ...reveal, [key]: !reveal[key] });
  return <div className="page detail-page"><div className="detail-topline"><Link to="/questions" className="back-link"><ArrowLeft size={17} /> 返回题库</Link><div><button className="icon-button" aria-label={question.favorite ? "取消收藏" : "收藏"} onClick={() => saveQuestion({ ...question, favorite: !question.favorite })}><Heart size={18} fill={question.favorite ? "currentColor" : "none"} /></button><button className="icon-button" aria-label="编辑题目" onClick={() => setEditing(true)}><Pencil size={18} /></button><button className="icon-button danger" aria-label="删除题目" onClick={() => { if (confirm("确定删除这道题？此操作无法撤销。")) { deleteQuestion(question.id); navigate("/questions"); } }}><Trash2 size={18} /></button></div></div>
    <article className="question-hero"><span className="eyebrow">{training ? "RANDOM TRAINING" : question.category}</span><div className="question-speak"><h1><SpeakableWords text={question.question.en} speech={speech} /></h1><button className="icon-button" aria-label="朗读完整问题" onClick={() => speech.speak({ text: question.question.en, id: "question" })}><Volume2 size={20} aria-hidden="true" /></button></div><p>{question.question.zh}</p><div className="detail-meta"><span>熟练度 {question.mastery}/4</span>{question.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><SpeechControls speech={speech} /></article>
    <div className="training-layout"><div className="learning-track"><RevealSection step="01" title="Thinking · 先想清楚" open={reveal.thinking} onToggle={() => toggle("thinking")}><ol className="thinking-list">{question.thinking.length ? question.thinking.map((item) => <li key={item}>{item}</li>) : <li>先给出一个明确观点，再补充理由和与你经历的连接。</li>}</ol></RevealSection><RevealSection step="02" title="Phrase blocks · 调用语言积木" open={reveal.phrases} onToggle={() => toggle("phrases")}><div className="phrase-list">{question.phrases.length ? question.phrases.map((phrase) => <article key={phrase.id}><button onClick={() => speech.speak({ text: phrase.en, id: phrase.id })}><Volume2 size={17} /><span><strong>{phrase.en}</strong>{phrase.zh && <small>{phrase.zh}</small>}</span></button><button className="icon-button" aria-label="加入发音词库" onClick={() => savePronunciation({ id: crypto.randomUUID(), en: phrase.en, zh: phrase.zh ?? "", category: "Paper", note: `来自：${question.question.en}`, mastery: 0 })}><Plus size={17} /></button></article>) : <p className="muted">还没有 Phrase Blocks，可以点击编辑补充。</p>}</div></RevealSection><RevealSection step="03" title="Spoken answer · 听句与跟读" open={reveal.answer} onToggle={() => toggle("answer")}><SentencePlayer sentences={question.answer.en} /></RevealSection><RevealSection step="NOTE" title="中文速记" open={reveal.chinese} onToggle={() => toggle("chinese")}><div className="chinese-notes">{question.answer.zh.map((line) => <p key={line}>{line}</p>)}</div></RevealSection>{question.fallbacks.length > 0 && <section className="fallback-panel"><span className="eyebrow">KEEP SPEAKING</span><h2>忘词时，换一种简单说法</h2>{question.fallbacks.map((item, i) => <article key={`${item.term}-${i}`}><strong>{item.term}</strong><span>→</span><p>{item.fallback}</p></article>)}</section>}</div><aside className="timer-aside"><span className="eyebrow">OUTPUT PRACTICE</span><h2>90 / 60 / 45</h2><p>关掉材料，用自己的话再说一次。</p><TrainingTimer /></aside></div>
    {editing && <QuestionEditor initial={question} onCancel={() => setEditing(false)} onSave={(next) => { saveQuestion(next); setEditing(false); }} />}
  </div>;
}
