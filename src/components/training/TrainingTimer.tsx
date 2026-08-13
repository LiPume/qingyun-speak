import { Pause, Play, RotateCcw } from "lucide-react";
import { TRAINING_DURATIONS, useTrainingTimer } from "../../hooks/useTrainingTimer";

const guidance = { 90: "先完整讲出来，允许停顿，但不要中断表达链。", 60: "删掉枝节，只保留观点、理由和例子。", 45: "重新组织，不照搬上一遍的句子。" };
export function TrainingTimer() {
  const timer = useTrainingTimer();
  return <section className="timer-card"><div className="timer-rounds" aria-label="训练轮次">{TRAINING_DURATIONS.map((duration, index) => <button key={duration} className={timer.duration === duration ? "active" : ""} onClick={() => timer.selectDuration(duration)}><span>ROUND {index + 1}</span><strong>{duration}s</strong></button>)}</div><div className={`timer-face ${timer.running ? "is-running" : ""}`}><span>{String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:{String(timer.remaining % 60).padStart(2, "0")}</span><small>{timer.finished ? "这一轮完成" : guidance[timer.duration]}</small></div><div className="timer-controls">{timer.running ? <button className="button primary" onClick={timer.pause}><Pause size={17} /> 暂停</button> : <button className="button primary" onClick={timer.start} disabled={timer.finished}><Play size={17} /> {timer.remaining === timer.duration ? "开始" : "继续"}</button>}<button className="button secondary" onClick={timer.reset}><RotateCcw size={17} /> 重置</button>{timer.finished && timer.duration !== 45 && <button className="button secondary" onClick={() => timer.selectDuration(timer.duration === 90 ? 60 : 45)}>下一轮 →</button>}</div></section>;
}
