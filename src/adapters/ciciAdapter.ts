import { DEFAULT_PRONUNCIATION, type InterviewDataset, type InterviewQuestion } from "../models/dataset";
import { parseLegacyAnswer, splitBilingualQuestion } from "../lib/sentence";

interface LegacyQuestion {
  id?: string | number;
  question?: string;
  answer?: string;
  tags?: string[];
  audioFile?: string;
}

interface LegacyEnvelope {
  appName?: string;
  questions?: LegacyQuestion[];
}

export function detectSchema(input: unknown): "native" | "cici" | "unknown" {
  if (!input || typeof input !== "object") return "unknown";
  const record = input as Record<string, unknown>;
  if (record.schemaVersion === 1 && Array.isArray(record.questions)) return "native";
  if (Array.isArray(input)) return "cici";
  if (Array.isArray(record.questions)) return "cici";
  return "unknown";
}

function assertLegacyQuestion(item: LegacyQuestion, index: number): asserts item is Required<Pick<LegacyQuestion, "question" | "answer">> & LegacyQuestion {
  if (typeof item.question !== "string" || !item.question.trim()) {
    throw new Error(`第 ${index + 1} 道题缺少有效的 question。`);
  }
  if (typeof item.answer !== "string") {
    throw new Error(`第 ${index + 1} 道题缺少有效的 answer。`);
  }
}

export function adaptCiciDataset(input: unknown): InterviewDataset {
  const envelope = input as LegacyEnvelope;
  const items = Array.isArray(input) ? input as LegacyQuestion[] : envelope?.questions;
  if (!Array.isArray(items)) throw new Error("未找到 Cici questions 数组。请检查 JSON 结构。 ");

  const now = new Date().toISOString();
  const questions: InterviewQuestion[] = items.map((item, index) => {
    assertLegacyQuestion(item, index);
    const tags = Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [];
    const category = tags[0]?.replace(/^P\d+\s*/, "").trim() || "未分类";
    return {
      id: String(item.id ?? `legacy-${index + 1}`),
      category,
      question: splitBilingualQuestion(item.question),
      thinking: [],
      phrases: [],
      answer: parseLegacyAnswer(item.answer),
      keywords: [],
      fallbacks: [],
      tags,
      favorite: false,
      mastery: 0,
      createdAt: now,
      updatedAt: now,
      legacy: item.audioFile ? { audioFile: item.audioFile } : undefined,
    };
  });

  return {
    schemaVersion: 1,
    metadata: { name: envelope?.appName || "青云研语题库", updatedAt: now },
    questions,
    pronunciation: DEFAULT_PRONUNCIATION,
  };
}
