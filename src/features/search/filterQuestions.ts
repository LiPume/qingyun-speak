import type { InterviewQuestion, MasteryLevel } from "../../models/dataset";

export interface QuestionFilters {
  search: string;
  category: string;
  tag: string;
  favoriteOnly: boolean;
  mastery: "all" | MasteryLevel;
}

export function filterQuestions(questions: InterviewQuestion[], filters: QuestionFilters): InterviewQuestion[] {
  const query = filters.search.trim().toLocaleLowerCase();
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
      (filters.mastery === "all" || question.mastery === filters.mastery);
  });
}
