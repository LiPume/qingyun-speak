import { useState, type FormEvent } from "react";
import type { InterviewQuestion, MasteryLevel } from "../../models/dataset";

function splitLines(value: string) { return value.split("\n").map((line) => line.trim()).filter(Boolean); }
export function createEmptyQuestion(): InterviewQuestion {
  return { id: crypto.randomUUID(), category: "未分类", question: { en: "", zh: "" }, thinking: [], phrases: [], answer: { en: [], zh: [] }, keywords: [], fallbacks: [], tags: [], favorite: false, mastery: 0, createdAt: new Date().toISOString() };
}

export function QuestionEditor({ initial, onSave, onCancel }: { initial: InterviewQuestion; onSave: (question: InterviewQuestion) => void; onCancel: () => void }) {
  const [value, setValue] = useState(initial);
  const field = (key: "en" | "zh", text: string) => setValue({ ...value, question: { ...value.question, [key]: text } });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.question.en.trim()) return;
    onSave({ ...value, updatedAt: new Date().toISOString() });
  }
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="题目编辑器"><form className="editor-panel" onSubmit={submit}><header><div><span className="eyebrow">QUESTION EDITOR</span><h2>{initial.question.en ? "编辑题目" : "添加题目"}</h2></div><button type="button" className="text-link" onClick={onCancel}>关闭</button></header>
    <div className="form-grid"><label className="span-2">English question<input name="question-en" autoComplete="off" required value={value.question.en} onChange={(e) => field("en", e.target.value)} /></label><label className="span-2">中文题目<input name="question-zh" autoComplete="off" value={value.question.zh} onChange={(e) => field("zh", e.target.value)} /></label><label>分类<input name="category" autoComplete="off" value={value.category} onChange={(e) => setValue({ ...value, category: e.target.value })} /></label><label>熟练度<select name="mastery" value={value.mastery} onChange={(e) => setValue({ ...value, mastery: Number(e.target.value) as MasteryLevel })}>{[0,1,2,3,4].map((n) => <option key={n} value={n}>{n} / 4</option>)}</select></label>
      <label className="span-2">Thinking（每行一项）<textarea name="thinking" autoComplete="off" value={value.thinking.join("\n")} onChange={(e) => setValue({ ...value, thinking: splitLines(e.target.value) })} /></label>
      <label className="span-2">Phrase blocks（每行 English | 中文）<textarea name="phrases" autoComplete="off" value={value.phrases.map((p) => `${p.en}${p.zh ? ` | ${p.zh}` : ""}`).join("\n")} onChange={(e) => setValue({ ...value, phrases: splitLines(e.target.value).map((line, index) => { const [en, zh] = line.split("|"); return { id: value.phrases[index]?.id ?? crypto.randomUUID(), en: en.trim(), zh: zh?.trim() }; }) })} /></label>
      <label className="span-2">Spoken answer（每行一句）<textarea name="answer-en" autoComplete="off" rows={6} value={value.answer.en.join("\n")} onChange={(e) => setValue({ ...value, answer: { ...value.answer, en: splitLines(e.target.value) } })} /></label>
      <label className="span-2">中文速记（每行一句）<textarea name="answer-zh" autoComplete="off" value={value.answer.zh.join("\n")} onChange={(e) => setValue({ ...value, answer: { ...value.answer, zh: splitLines(e.target.value) } })} /></label>
      <label>Tags（逗号分隔）<input name="tags" autoComplete="off" value={value.tags.join(", ")} onChange={(e) => setValue({ ...value, tags: e.target.value.split(/[,，]/).map((x) => x.trim()).filter(Boolean) })} /></label><label>Keywords（逗号分隔）<input name="keywords" autoComplete="off" value={value.keywords.join(", ")} onChange={(e) => setValue({ ...value, keywords: e.target.value.split(/[,，]/).map((x) => x.trim()).filter(Boolean) })} /></label>
      <label className="span-2">Fallbacks（每行 term | simple expression | 中文）<textarea name="fallbacks" autoComplete="off" value={value.fallbacks.map((f) => `${f.term ?? ""} | ${f.fallback} | ${f.zh ?? ""}`).join("\n")} onChange={(e) => setValue({ ...value, fallbacks: splitLines(e.target.value).map((line) => { const [term, fallback, zh] = line.split("|").map((x) => x.trim()); return { term, fallback: fallback || term, zh }; }) })} /></label>
    </div><footer><button type="button" className="button secondary" onClick={onCancel}>取消</button><button className="button primary" type="submit">保存题目</button></footer>
  </form></div>;
}
