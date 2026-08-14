import { Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { DailyPlan, DailyPlanModuleTarget } from "../../models/training";

interface DailyPlanEditorProps {
  categories: { category: string; questionCount: number; coreCount: number }[];
  plan?: DailyPlan;
  onSave: (targets: DailyPlanModuleTarget[]) => void;
  onClear: () => void;
  onCopyYesterday: () => DailyPlan | null;
}

export function DailyPlanEditor({ categories, plan, onSave, onClear, onCopyYesterday }: DailyPlanEditorProps) {
  const [targets, setTargets] = useState<DailyPlanModuleTarget[]>(plan?.moduleTargets ?? []);
  const [categoryToAdd, setCategoryToAdd] = useState("");
  const [message, setMessage] = useState("");
  const available = useMemo(() => categories.filter((item) => !targets.some((target) => target.category === item.category)), [categories, targets]);
  const total = targets.reduce((sum, target) => sum + target.targetCount, 0);
  const updateCount = (category: string, delta: number) => setTargets((current) => current.map((target) => {
    if (target.category !== category) return target;
    const maximum = categories.find((item) => item.category === category)?.questionCount ?? target.targetCount;
    return { ...target, targetCount: Math.min(maximum, Math.max(1, target.targetCount + delta)) };
  }));
  const remove = (category: string) => setTargets((current) => current.filter((target) => target.category !== category));
  return <div className="plan-editor">
    <div className="plan-editor-toolbar">
      <label><span className="sr-only">添加计划模块</span><select value={categoryToAdd} onChange={(event) => setCategoryToAdd(event.target.value)}><option value="">选择要练的模块…</option>{available.map((item) => <option key={item.category} value={item.category}>{item.category} · {item.questionCount} 题{item.coreCount ? ` · ${item.coreCount} 核心` : ""}</option>)}</select></label>
      <button className="button secondary" disabled={!categoryToAdd} onClick={() => { setTargets([...targets, { category: categoryToAdd, targetCount: 1 }]); setCategoryToAdd(""); }}><Plus size={16} aria-hidden="true" /> 添加模块</button>
    </div>
    {targets.length ? <div className="plan-target-list">{targets.map((target) => { const maximum = categories.find((item) => item.category === target.category)?.questionCount ?? target.targetCount; return <div key={target.category} className="plan-target-row"><span>{target.category}</span><div className="target-stepper" aria-label={`${target.category}目标题数`}><button type="button" aria-label={`减少${target.category}目标题数`} onClick={() => updateCount(target.category, -1)} disabled={target.targetCount <= 1}><Minus size={15} aria-hidden="true" /></button><strong>{target.targetCount}<small>题</small></strong><button type="button" aria-label={`增加${target.category}目标题数`} onClick={() => updateCount(target.category, 1)} disabled={target.targetCount >= maximum}><Plus size={15} aria-hidden="true" /></button></div><button className="icon-button danger" aria-label={`删除${target.category}`} onClick={() => remove(target.category)}><Trash2 size={16} aria-hidden="true" /></button></div>; })}</div> : <div className="plan-empty"><strong>今天还没有计划</strong><span>先选一个模块，再定一个够得着的题数。</span></div>}
    <div className="plan-editor-footer"><span>今日计划：<strong>{total} 题</strong></span><div><button className="text-link" onClick={() => { const copied = onCopyYesterday(); if (copied) setTargets(copied.moduleTargets); setMessage(copied ? "已复制昨天计划。" : "昨天没有可复制的计划。"); }}>复制昨天计划</button>{plan && <button className="text-link danger-text" onClick={() => { if (confirm("确定清空今天的计划？练习记录不会被删除。")) { onClear(); setTargets([]); setMessage("今日计划已清空。"); } }}>清空今日计划</button>}<button className="button primary" disabled={!targets.length} onClick={() => { onSave(targets); setMessage("今日计划已保存。"); }}>保存今日计划</button></div></div>
    <div className="plan-message" role="status" aria-live="polite">{message}</div>
    {plan && <button className="auto-plan-link" onClick={() => document.getElementById("today-recommendations")?.scrollIntoView({ behavior: "smooth" })}><Sparkles size={16} aria-hidden="true" /> 自动安排今日计划 <span>按核心覆盖与最近练习生成建议</span></button>}
  </div>;
}
