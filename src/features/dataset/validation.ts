import type { InterviewDataset, InterviewQuestion, MasteryLevel } from "../../models/dataset";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function isQuestion(value: unknown): value is InterviewQuestion {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<InterviewQuestion>;
  return Boolean(
    typeof item.id === "string" &&
      typeof item.category === "string" &&
      item.question && typeof item.question.en === "string" && typeof item.question.zh === "string" &&
      item.answer && isStringArray(item.answer.en) && isStringArray(item.answer.zh) &&
      isStringArray(item.thinking) && Array.isArray(item.phrases) &&
      isStringArray(item.keywords) && isStringArray(item.tags) && Array.isArray(item.fallbacks) &&
      typeof item.favorite === "boolean" && [0, 1, 2, 3, 4].includes(item.mastery as MasteryLevel),
  );
}

export function validateDataset(input: unknown): InterviewDataset {
  if (!input || typeof input !== "object") throw new Error("数据必须是 JSON 对象。 ");
  const dataset = input as Partial<InterviewDataset>;
  if (dataset.schemaVersion !== 1) throw new Error("不支持的数据版本；需要 schemaVersion 1。 ");
  if (!Array.isArray(dataset.questions)) throw new Error("数据缺少 questions 数组。 ");
  const invalidIndex = dataset.questions.findIndex((question) => !isQuestion(question));
  if (invalidIndex >= 0) throw new Error(`第 ${invalidIndex + 1} 道 Native 题目结构无效。`);
  if (!Array.isArray(dataset.pronunciation)) throw new Error("数据缺少 pronunciation 数组。 ");
  if (!dataset.metadata || typeof dataset.metadata.name !== "string" || typeof dataset.metadata.updatedAt !== "string") {
    throw new Error("数据缺少有效的 metadata。 ");
  }
  return dataset as InterviewDataset;
}

export function parseImport(input: unknown): InterviewDataset {
  const { adaptCiciDataset, detectSchema } = requireAdapter();
  const schema = detectSchema(input);
  if (schema === "native") return validateDataset(input);
  if (schema === "cici") return validateDataset(adaptCiciDataset(input));
  throw new Error("无法识别 JSON：请选择青云研语 V1 或 Cici 题库导出文件。 ");
}

function requireAdapter() {
  return { adaptCiciDataset, detectSchema };
}

import { adaptCiciDataset, detectSchema } from "../../adapters/ciciAdapter";
