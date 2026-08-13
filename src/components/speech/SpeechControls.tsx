import { Pause, Play, Square } from "lucide-react";
import type { ReturnTypeUseSpeech } from "./types";

export function SpeechControls({ speech, compact = false }: { speech: ReturnTypeUseSpeech; compact?: boolean }) {
  return <div className={`speech-controls ${compact ? "compact" : ""}`}>
    {!compact && <>
      <label>Voice
        <select name="speech-voice" value={speech.selectedVoice?.voiceURI ?? ""} onChange={(event) => speech.setVoice(event.target.value)}>
          {speech.voices.length === 0 && <option value="">系统默认 English voice</option>}
          {speech.voices.filter((voice) => voice.lang.startsWith("en")).map((voice) =>
            <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}
        </select>
      </label>
      <label>Rate
        <select name="speech-rate" value={speech.rate} onChange={(event) => speech.setRate(Number(event.target.value) as 0.75 | 0.9 | 1 | 1.1)}>
          {[0.75, 0.9, 1, 1.1].map((rate) => <option key={rate} value={rate}>{rate}×</option>)}
        </select>
      </label>
    </>}
    {speech.status === "speaking" && <button className="icon-button" aria-label="暂停朗读" onClick={speech.pause}><Pause size={17} /></button>}
    {speech.status === "paused" && <button className="icon-button" aria-label="继续朗读" onClick={speech.resume}><Play size={17} /></button>}
    {speech.status !== "idle" && <button className="icon-button" aria-label="停止朗读" onClick={speech.stop}><Square size={16} /></button>}
    {!speech.supported && <span className="field-error">当前浏览器不支持语音合成。</span>}
  </div>;
}
