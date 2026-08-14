import { Heart, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { InterviewQuestion } from "../../models/dataset";
import type { ReturnTypeUseSpeech } from "../speech/types";

const masteryLabel = ["未学习", "看过", "借助框架", "稳定输出", "成熟表达"];
export function QuestionCard({ question, speech, onFavorite, practiceCount, practicedToday }: { question: InterviewQuestion; speech: ReturnTypeUseSpeech; onFavorite: () => void; practiceCount: number; practicedToday: boolean }) {
  return <article className="question-card">
    <div className="card-meta"><span>{question.category}</span><span className={`mastery level-${question.mastery}`}>{masteryLabel[question.mastery]}</span></div>
    <Link to={`/question/${question.id}`}><h2>{question.question.en}</h2><p>{question.question.zh}</p></Link>
    <div className={`practice-status ${practiceCount ? "is-practiced" : ""}`}>{practicedToday ? `✓ 今天练过 · 累计 ${practiceCount} 次` : practiceCount ? `✓ 已练 ${practiceCount} 次` : "○ 未练"}</div>
    <div className="tag-row">{question.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
    <div className="card-actions"><button className="icon-button" aria-label={`朗读问题：${question.question.en}`} onClick={() => speech.speak({ text: question.question.en, id: question.id })}><Volume2 size={17} /></button><button className={`icon-button ${question.favorite ? "is-favorite" : ""}`} aria-label={question.favorite ? "取消收藏" : "收藏题目"} onClick={onFavorite}><Heart size={17} fill={question.favorite ? "currentColor" : "none"} /></button><Link className="text-link" to={`/question/${question.id}`}>进入训练 →</Link></div>
  </article>;
}
