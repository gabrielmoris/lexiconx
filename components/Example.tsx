"use client";
import { useTranslations } from "next-intl";
import React from "react";
import LexiconxLogo from "./Icons/LexiconxLogo";

const Example = () => {
  const t = useTranslations("example");

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
    <>
      <h1 className="text-3xl font-bold text-blue-600">{t("title")}</h1>
      <section className=" flex flex-row mt-20 justify-between items-center">
        <LexiconxLogo className="w-15 h-15 animate-spin" />
        <button
          onClick={() => speak("Hi this is a simple tts example to check if this works")}
          className="mt-4 cursor-pointer px-4 py-2 bg-purple-600 text-white rounded"
        >
          🔊 Speak
        </button>
        <button onClick={() => shuo("你好现在我正在说中文因为我可以")} className="mt-4 cursor-pointer px-4 py-2 bg-purple-600 text-white rounded">
          🔊 讲话
        </button>
      </section>
    </>
  );
};

export default Example;
