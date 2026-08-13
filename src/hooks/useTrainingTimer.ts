import { useEffect, useState } from "react";

export const TRAINING_DURATIONS = [90, 60, 45] as const;
export type TrainingDuration = typeof TRAINING_DURATIONS[number];

export function useTrainingTimer(initial: TrainingDuration = 90) {
  const [duration, setDuration] = useState<TrainingDuration>(initial);
  const [remaining, setRemaining] = useState<number>(initial);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) { setRunning(false); return 0; }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  function selectDuration(next: TrainingDuration) {
    setDuration(next); setRemaining(next); setRunning(false);
  }

  return {
    duration, remaining, running, finished: remaining === 0,
    start: () => setRunning(true), pause: () => setRunning(false),
    reset: () => { setRunning(false); setRemaining(duration); }, selectDuration,
  };
}
