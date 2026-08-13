const ABBREVIATIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "e.g.", "i.e."];

export function splitEnglishSentences(text: string): string[] {
  const input = text.trim().replace(/\s+/g, " ");
  if (!input) return [];

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const Segmenter = Intl.Segmenter;
    return [...new Segmenter("en", { granularity: "sentence" }).segment(input)]
      .map(({ segment }) => segment.trim())
      .filter(Boolean);
  }

  let protectedText = input;
  ABBREVIATIONS.forEach((value, index) => {
    protectedText = protectedText.replaceAll(value, `__ABBR_${index}__`);
  });
  return (protectedText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map((sentence) =>
      ABBREVIATIONS.reduce(
        (result, value, index) => result.replaceAll(`__ABBR_${index}__`, value),
        sentence.trim(),
      ),
    )
    .filter(Boolean);
}

export function splitBilingualQuestion(value: string): { en: string; zh: string } {
  const spacedSlash = value.lastIndexOf(" / ");
  if (spacedSlash >= 0) {
    return {
      en: value.slice(0, spacedSlash).trim(),
      zh: value.slice(spacedSlash + 3).trim(),
    };
  }
  const chineseStart = value.search(/[\u3400-\u9fff]/);
  if (chineseStart > 0) {
    const beforeChinese = value.slice(0, chineseStart).replace(/\s*[/｜|]\s*$/, "").trim();
    return { en: beforeChinese, zh: value.slice(chineseStart).trim() };
  }
  return { en: value.trim(), zh: "" };
}

export function parseLegacyAnswer(value: string): { en: string[]; zh: string[] } {
  const paragraphs = value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chineseIndex = paragraphs.findIndex((part) => /[\u3400-\u9fff]/.test(part));
  const enText = (chineseIndex < 0 ? paragraphs : paragraphs.slice(0, chineseIndex)).join(" ");
  const zhText = chineseIndex < 0 ? "" : paragraphs.slice(chineseIndex).join("\n");
  return {
    en: splitEnglishSentences(enText),
    zh: zhText ? zhText.split(/(?<=[。！？])/u).map((part) => part.trim()).filter(Boolean) : [],
  };
}
