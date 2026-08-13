import type { ReturnTypeUseSpeech } from "./types";

export function SpeakableWords({ text, speech }: { text: string; speech: ReturnTypeUseSpeech }) {
  const parts = text.split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g);
  return <span>{parts.map((part, index) => /^[A-Za-z]/.test(part)
    ? <button className="speakable-word" key={`${part}-${index}`} onClick={(event) => { event.stopPropagation(); speech.speak({ text: part, id: `word-${index}` }); }} aria-label={`朗读单词 ${part}`}>{part}</button>
    : <span key={`${part}-${index}`}>{part}</span>)}</span>;
}
