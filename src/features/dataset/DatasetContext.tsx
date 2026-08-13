import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { adaptCiciDataset } from "../../adapters/ciciAdapter";
import type { InterviewDataset, InterviewQuestion, PronunciationItem } from "../../models/dataset";
import { loadDataset, resetDataset as clearStoredDataset, saveDataset } from "../../storage/storage";

interface DatasetContextValue {
  dataset: InterviewDataset | null;
  loading: boolean;
  error: string | null;
  saveQuestion: (question: InterviewQuestion) => void;
  deleteQuestion: (id: string) => void;
  savePronunciation: (item: PronunciationItem) => void;
  deletePronunciation: (id: string) => void;
  replaceDataset: (dataset: InterviewDataset) => void;
  resetToDefault: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

async function fetchDefaultDataset(): Promise<InterviewDataset> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/cici-default.json`);
  if (!response.ok) throw new Error("默认题库加载失败，请刷新页面重试。 ");
  return adaptCiciDataset(await response.json());
}

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<InterviewDataset | null>(loadDataset);
  const [loading, setLoading] = useState(() => dataset === null);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((next: InterviewDataset) => {
    const updated = { ...next, metadata: { ...next.metadata, updatedAt: new Date().toISOString() } };
    saveDataset(updated);
    setDataset(updated);
  }, []);

  const resetToDefault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      clearStoredDataset();
      const next = await fetchDefaultDataset();
      persist(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "默认题库加载失败。 ");
    } finally {
      setLoading(false);
    }
  }, [persist]);

  useEffect(() => {
    if (dataset) return;
    let active = true;
    void fetchDefaultDataset()
      .then((next) => { if (active) persist(next); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "默认题库加载失败。 ");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dataset, persist]);

  const value = useMemo<DatasetContextValue>(() => ({
    dataset, loading, error,
    saveQuestion(question) {
      if (!dataset) return;
      const exists = dataset.questions.some((item) => item.id === question.id);
      persist({ ...dataset, questions: exists
        ? dataset.questions.map((item) => item.id === question.id ? question : item)
        : [question, ...dataset.questions] });
    },
    deleteQuestion(id) {
      if (dataset) persist({ ...dataset, questions: dataset.questions.filter((item) => item.id !== id) });
    },
    savePronunciation(item) {
      if (!dataset) return;
      const exists = dataset.pronunciation.some((entry) => entry.id === item.id);
      persist({ ...dataset, pronunciation: exists
        ? dataset.pronunciation.map((entry) => entry.id === item.id ? item : entry)
        : [item, ...dataset.pronunciation] });
    },
    deletePronunciation(id) {
      if (dataset) persist({ ...dataset, pronunciation: dataset.pronunciation.filter((item) => item.id !== id) });
    },
    replaceDataset: persist,
    resetToDefault,
  }), [dataset, error, loading, persist, resetToDefault]);

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) throw new Error("useDataset must be used inside DatasetProvider");
  return context;
}
