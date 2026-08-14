import type { InterviewQuestion, MasteryLevel } from "../../models/dataset";
import type { TrainingHistory } from "../../models/training";
import { hasPracticedToday } from "../training/selectors";

export interface QuestionFilters {
  search: string;
  category: string;
  tag: string;
  favoriteOnly: boolean;
  mastery: "all" | MasteryLevel;
  practice: "all" | "unpracticed" | "practiced" | "today";
}

export function filterQuestions(questions: InterviewQuestion[], filters: QuestionFilters, history?: TrainingHistory, now = new Date()): InterviewQuestion[] {
  const query = filters.search.trim().toLocaleLowerCase();
  const practicedIds = new Set(history?.records.map((record) => record.questionId) ?? []);
  return questions.filter((question) => {
    const searchable = [
      question.question.en,
      question.question.zh,
      ...question.answer.en,
      ...question.keywords,
      ...question.tags,
    ].join(" ").toLocaleLowerCase();
    return (!query || searchable.includes(query)) &&
      (!filters.category || question.category === filters.category) &&
      (!filters.tag || question.tags.includes(filters.tag)) &&
      (!filters.favoriteOnly || question.favorite) &&
      (filters.mastery === "all" || question.mastery === filters.mastery) &&
      (filters.practice === "all" ||
        (filters.practice === "unpracticed" && !practicedIds.has(question.id)) ||
        (filters.practice === "practiced" && practicedIds.has(question.id)) ||
        (filters.practice === "today" && Boolean(history && hasPracticedToday(history, question.id, now))));
  });
}
