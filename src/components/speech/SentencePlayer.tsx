import { Play, RotateCcw, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import { SpeakableWords } from "./SpeakableWords";
import { SpeechControls } from "./SpeechControls";

function playAt(
  index: number,
  sentences: string[],
  speech: ReturnType<typeof useSpeech>,
  setActiveIndex: Dispatch<SetStateAction<number | null>>,
  playingAll: { current: boolean },
) {
  setActiveIndex(index);
  speech.speak({ text: sentences[index], id: `sentence-${index}`, onEnd: () => {
    if (playingAll.current && index + 1 < sentences.length) {
      playAt(index + 1, sentences, speech, setActiveIndex, playingAll);
    } else {
      playingAll.current = false;
      setActiveIndex(null);
    }
  } });
}

export function SentencePlayer({ sentences }: { sentences: string[] }) {
  const speech = useSpeech();
  const stopSpeech = speech.stop;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const playingAll = useRef(false);

  const playSentence = useCallback((index: number, continuous = false) => {
    playingAll.current = continuous;
    playAt(index, sentences, speech, setActiveIndex, playingAll);
  }, [sentences, speech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);
  return <div className="sentence-player"><div className="player-toolbar"><button className="button secondary" onClick={() => playSentence(0, true)} disabled={!sentences.length}><Play size={17} /> Play all</button><SpeechControls speech={speech} /><span>{sentences.length} sentences</span></div><ol>{sentences.map((sentence, index) => <li key={`${sentence}-${index}`} className={activeIndex === index ? "active" : ""}><button className="sentence-number" aria-label={`朗读第 ${index + 1} 句`} onClick={() => playSentence(index)}>{String(index + 1).padStart(2, "0")}</button><p><SpeakableWords text={sentence} speech={speech} /></p><button className="icon-button repeat" aria-label={`重复第 ${index + 1} 句`} onClick={() => playSentence(index)}>{activeIndex === index ? <Volume2 size={17} /> : <RotateCcw size={16} />}</button></li>)}</ol></div>;
}
