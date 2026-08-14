import { validateDataset } from "../dataset/validation";
import type { InterviewDataset, SpeechSettings } from "../../models/dataset";
import type { DailyPlanStore, FullTrainingBackup, TrainingHistory } from "../../models/training";
import { validateDailyPlanStore, validateTrainingHistory } from "../../storage/trainingStorage";

const RATES: SpeechSettings["rate"][] = [0.75, 0.9, 1, 1.1];

function validateSettings(value: unknown): SpeechSettings {
  if (!value || typeof value !== "object") throw new Error("备份缺少有效设置。");
  const settings = value as Partial<SpeechSettings>;
  if (!RATES.includes(settings.rate as SpeechSettings["rate"]) || (settings.voiceURI !== undefined && typeof settings.voiceURI !== "string")) {
    throw new Error("备份中的语音设置无效。");
  }
  return settings as SpeechSettings;
}

export function createFullTrainingBackup(dataset: InterviewDataset, trainingHistory: TrainingHistory, dailyPlans: DailyPlanStore, settings: SpeechSettings): FullTrainingBackup {
  return {
    schemaVersion: 1,
    app: "Qingyun Speak",
    exportedAt: new Date().toISOString(),
    dataset: validateDataset(dataset),
    trainingHistory: validateTrainingHistory(trainingHistory),
    dailyPlans: validateDailyPlanStore(dailyPlans),
    settings: validateSettings(settings),
  };
}

export function parseFullTrainingBackup(value: unknown): FullTrainingBackup {
  if (!value || typeof value !== "object") throw new Error("完整备份必须是 JSON 对象。");
  const backup = value as Partial<FullTrainingBackup>;
  if (backup.schemaVersion !== 1 || backup.app !== "Qingyun Speak" || typeof backup.exportedAt !== "string" || Number.isNaN(Date.parse(backup.exportedAt))) {
    throw new Error("无法识别完整备份，或备份版本不受支持。");
  }
  return {
    schemaVersion: 1,
    app: "Qingyun Speak",
    exportedAt: backup.exportedAt,
    dataset: validateDataset(backup.dataset),
    trainingHistory: validateTrainingHistory(backup.trainingHistory),
    dailyPlans: validateDailyPlanStore(backup.dailyPlans),
    settings: validateSettings(backup.settings),
  };
}
