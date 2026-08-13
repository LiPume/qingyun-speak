import type { InterviewDataset, SpeechSettings } from "../models/dataset";
import { validateDataset } from "../features/dataset/validation";

export const STORAGE_KEYS = {
  dataset: "qingyun.dataset.v1",
  settings: "qingyun.settings.v1",
  training: "qingyun.training.v1",
} as const;

export const DEFAULT_SPEECH_SETTINGS: SpeechSettings = { rate: 0.9 };

export function loadDataset(): InterviewDataset | null {
  const raw = localStorage.getItem(STORAGE_KEYS.dataset);
  if (!raw) return null;
  try {
    return validateDataset(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveDataset(dataset: InterviewDataset): void {
  localStorage.setItem(STORAGE_KEYS.dataset, JSON.stringify(validateDataset(dataset)));
}

export function resetDataset(): void {
  localStorage.removeItem(STORAGE_KEYS.dataset);
}

export function loadSettings(): SpeechSettings {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return DEFAULT_SPEECH_SETTINGS;
  try {
    const value = JSON.parse(raw) as Partial<SpeechSettings>;
    return [0.75, 0.9, 1, 1.1].includes(value.rate ?? 0) ? value as SpeechSettings : DEFAULT_SPEECH_SETTINGS;
  } catch {
    return DEFAULT_SPEECH_SETTINGS;
  }
}

export function saveSettings(settings: SpeechSettings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}
