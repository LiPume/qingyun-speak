import { ArchiveRestore, CalendarRange, Download, FileJson, History, RefreshCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { useDataset } from "../features/dataset/DatasetContext";
import { parseImport } from "../features/dataset/validation";
import { createFullTrainingBackup, parseFullTrainingBackup } from "../features/training/backup";
import { useTraining } from "../features/training/TrainingContext";
import { getLocalDateKey } from "../lib/localDate";
import type { InterviewDataset } from "../models/dataset";
import { loadSettings, saveSettings } from "../storage/storage";

function downloadJson(value: unknown, filename: string): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SettingsPage() {
  const { dataset, loading, replaceDataset, resetToDefault } = useDataset();
  const { history, dailyPlans, replaceTrainingData, clearTrainingHistory, clearDailyPlans } = useTraining();
  const datasetFileRef = useRef<HTMLInputElement>(null);
  const backupFileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<InterviewDataset | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  if (loading || !dataset) return <LoadingState />;

  async function chooseDatasetFile(file?: File) {
    if (!file) return;
    try {
      setPreview(parseImport(JSON.parse(await file.text())));
      setMessage(null);
    } catch (reason) {
      setPreview(null);
      setMessage({ kind: "error", text: reason instanceof Error ? reason.message : "导入失败。" });
    } finally {
      if (datasetFileRef.current) datasetFileRef.current.value = "";
    }
  }

  async function restoreFullBackup(file?: File) {
    if (!file) return;
    try {
      const backup = parseFullTrainingBackup(JSON.parse(await file.text()));
      const confirmed = confirm(`完整恢复会覆盖当前题库、练习历史、每日计划和设置。\n\n备份包含 ${backup.dataset.questions.length} 道题、${backup.trainingHistory.records.length} 条练习记录、${backup.dailyPlans.plans.length} 天计划。\n\n确定继续？`);
      if (!confirmed) return;
      replaceDataset(backup.dataset);
      replaceTrainingData(backup.trainingHistory, backup.dailyPlans);
      saveSettings(backup.settings);
      setPreview(null);
      setMessage({ kind: "success", text: `完整备份已恢复：${backup.trainingHistory.records.length} 条练习记录，${backup.dailyPlans.plans.length} 天计划。` });
    } catch (reason) {
      setMessage({ kind: "error", text: reason instanceof Error ? reason.message : "完整恢复失败。" });
    } finally {
      if (backupFileRef.current) backupFileRef.current.value = "";
    }
  }

  return <div className="page settings-page">
    <PageHeader eyebrow="DATA & SETTINGS" title="数据与设置" description="题库与训练记录分别保存。恢复默认题库不会清除打卡；清空训练数据必须单独确认。" />
    <div className="settings-grid">
      <section className="settings-card"><FileJson /><div><span className="eyebrow">CURRENT DATASET</span><h2>{dataset.metadata.name}</h2><p>{dataset.questions.length} 道题 · {dataset.pronunciation.length} 个发音词条</p><small>最近更新：{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dataset.metadata.updatedAt))}</small></div></section>
      <section className="settings-card action"><Upload /><div><h2>导入题库 JSON</h2><p>支持 Native V1 与旧 Cici 导出。只覆盖题库，不改练习历史与每日计划。</p><input ref={datasetFileRef} name="dataset-file" type="file" accept="application/json,.json" hidden onChange={(event) => void chooseDatasetFile(event.target.files?.[0])} /><button className="button secondary" onClick={() => datasetFileRef.current?.click()}>选择题库 JSON</button></div></section>
      <section className="settings-card action"><Download /><div><h2>导出题库</h2><p>保留原有导出能力：当前题库、熟练度、收藏和发音词库。</p><button className="button secondary" onClick={() => { downloadJson(dataset, `qingyun-speak-backup-${getLocalDateKey()}.json`); setMessage({ kind: "success", text: "题库备份文件已生成。" }); }}>导出 JSON</button></div></section>
      <section className="settings-card action warning"><RefreshCcw /><div><h2>恢复默认题库</h2><p>只恢复 170 道默认题目；不会清空练习历史与每日计划。</p><button className="button danger-button" onClick={() => { if (confirm("恢复默认题库会覆盖当前题库修改，但保留练习历史和每日计划。建议先导出备份。确定继续？")) void resetToDefault(); }}>恢复默认</button></div></section>
    </div>

    <div className="settings-section-heading"><span className="eyebrow">TRAINING DATA</span><h2>训练数据</h2><p>{history.records.length} 条练习记录 · {dailyPlans.plans.length} 天计划</p></div>
    <div className="settings-grid">
      <section className="settings-card action"><Download /><div><h2>导出完整训练数据</h2><p>包含题库、练习历史、每日计划和语音设置，可用于完整恢复。</p><button className="button primary" onClick={() => { downloadJson(createFullTrainingBackup(dataset, history, dailyPlans, loadSettings()), `qingyun-speak-full-backup-${getLocalDateKey()}.json`); setMessage({ kind: "success", text: "完整训练备份已生成。" }); }}>导出完整备份</button></div></section>
      <section className="settings-card action"><ArchiveRestore /><div><h2>恢复完整备份</h2><p>校验文件后再次确认，才会覆盖题库与训练数据。</p><input ref={backupFileRef} name="full-backup-file" type="file" accept="application/json,.json" hidden onChange={(event) => void restoreFullBackup(event.target.files?.[0])} /><button className="button secondary" onClick={() => backupFileRef.current?.click()}>选择完整备份</button></div></section>
      <section className="settings-card action warning"><History /><div><h2>清空练习历史</h2><p>删除全部正式练习记录。题库、熟练度、收藏和每日计划不受影响。</p><button className="button danger-button" onClick={() => { if (confirm(`确定清空 ${history.records.length} 条练习记录？此操作无法撤销，每日计划会保留。`)) { clearTrainingHistory(); setMessage({ kind: "success", text: "练习历史已清空，每日计划已保留。" }); } }}>清空练习历史</button></div></section>
      <section className="settings-card action warning"><CalendarRange /><div><h2>清空每日计划</h2><p>删除全部计划与计划历史。练习记录和题库不受影响。</p><button className="button danger-button" onClick={() => { if (confirm(`确定清空 ${dailyPlans.plans.length} 天每日计划？此操作无法撤销，练习历史会保留。`)) { clearDailyPlans(); setMessage({ kind: "success", text: "每日计划已清空，练习历史已保留。" }); } }}>清空每日计划</button></div></section>
    </div>

    {message && <div className={`notice ${message.kind}`} role={message.kind === "error" ? "alert" : "status"} aria-live="polite">{message.text}</div>}
    {preview && <section className="import-preview"><span className="eyebrow">IMPORT PREVIEW</span><h2>准备导入「{preview.metadata.name}」</h2><dl><div><dt>题目</dt><dd>{preview.questions.length}</dd></div><div><dt>发音词条</dt><dd>{preview.pronunciation.length}</dd></div><div><dt>数据版本</dt><dd>V{preview.schemaVersion}</dd></div></dl><p>确认后只覆盖题库；练习历史和每日计划不会变化。</p><div><button className="button secondary" onClick={() => setPreview(null)}>取消</button><button className="button primary" onClick={() => { replaceDataset(preview); setPreview(null); setMessage({ kind: "success", text: `已导入 ${preview.questions.length} 道题，训练数据未改动。` }); }}>确认覆盖并导入</button></div></section>}
  </div>;
}
