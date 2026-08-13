import { useCallback, useEffect, useRef, useState } from "react";
import { loadSettings, saveSettings } from "../storage/storage";
import type { SpeechSettings } from "../models/dataset";

export type SpeechStatus = "idle" | "speaking" | "paused";
interface SpeakOptions { text: string; id?: string; onEnd?: () => void }

export function useSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const synth = supported ? window.speechSynthesis : null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>(loadSettings);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    if (!synth) return;
    const update = () => setVoices(synth.getVoices());
    update();
    synth.addEventListener("voiceschanged", update);
    return () => synth.removeEventListener("voiceschanged", update);
  }, [synth]);

  const selectedVoice = voices.find((voice) => voice.voiceURI === settings.voiceURI)
    ?? voices.find((voice) => voice.lang.toLowerCase() === "en-us")
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
    ?? null;

  const stop = useCallback(() => {
    generation.current += 1;
    synth?.cancel();
    setStatus("idle");
    setActiveId(null);
  }, [synth]);

  const speak = useCallback(({ text, id, onEnd }: SpeakOptions) => {
    if (!synth || !text.trim()) return false;
    synth.cancel();
    const current = ++generation.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = settings.rate;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onend = () => {
      if (generation.current !== current) return;
      setStatus("idle");
      setActiveId(null);
      onEnd?.();
    };
    utterance.onerror = () => {
      if (generation.current === current) {
        setStatus("idle");
        setActiveId(null);
      }
    };
    setActiveId(id ?? null);
    setStatus("speaking");
    synth.speak(utterance);
    return true;
  }, [selectedVoice, settings.rate, synth]);

  const updateSettings = useCallback((next: SpeechSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  return {
    supported, voices, selectedVoice, rate: settings.rate, status, activeId, speak, stop,
    pause() { if (synth?.speaking) { synth.pause(); setStatus("paused"); } },
    resume() { if (synth?.paused) { synth.resume(); setStatus("speaking"); } },
    setVoice(voiceURI: string) { updateSettings({ ...settings, voiceURI }); },
    setRate(rate: SpeechSettings["rate"]) { updateSettings({ ...settings, rate }); },
  };
}
