"use client";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("landingpage");
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // adapt based on target language
    window.speechSynthesis.speak(utterance);
  };
  const shuo = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN"; // adapt based on target language
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-600">{t("title")}</h1>
      <section className="w-1/3 flex flex-row mt-20 justify-between items-center">
        <button
          onClick={() => speak("Hi this is a simple tts example to check if this works")}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
        >
          🔊 Speak
        </button>
        <button onClick={() => shuo("你好现在我正在说中文因为我可以")} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">
          🔊 讲话
        </button>
      </section>
    </main>
  );
}
