import type { InterviewDataset } from "../../models/dataset";

const PREVIOUS_DEFAULT_QUESTION_COUNT = 142;
const PREVIOUS_DEFAULT_PRONUNCIATION_COUNT = 42;
const PREVIOUS_DEFAULT_FIRST_QUESTION_ID = "Q01";
const PREVIOUS_DEFAULT_LAST_QUESTION_ID = "1785238332870";

export function isPreviousDefaultDataset(dataset: InterviewDataset): boolean {
  return dataset.questions.length === PREVIOUS_DEFAULT_QUESTION_COUNT &&
    dataset.pronunciation.length === PREVIOUS_DEFAULT_PRONUNCIATION_COUNT &&
    dataset.questions[0]?.id === PREVIOUS_DEFAULT_FIRST_QUESTION_ID &&
    dataset.questions.at(-1)?.id === PREVIOUS_DEFAULT_LAST_QUESTION_ID;
}

export function appendMissingDefaultQuestions(
  current: InterviewDataset,
  nextDefault: InterviewDataset,
): InterviewDataset {
  const existingIds = new Set(current.questions.map((question) => question.id));
  const missingQuestions = nextDefault.questions.filter((question) => !existingIds.has(question.id));
  if (missingQuestions.length === 0) return current;
  return { ...current, questions: [...current.questions, ...missingQuestions] };
}
