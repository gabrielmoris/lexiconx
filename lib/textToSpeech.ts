export const textToSpeech = (text: string, language: "chinese" | "english" | "german" | "spanish") => {
  const languages = {
    chinese: "zh-CN",
    english: "en-US",
    german: "de-DE",
    spanish: "es-ES",
  };
  if (!language || !text) {
    throw new Error("No language or text provided");
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languages[language];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};
