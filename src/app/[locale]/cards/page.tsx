"use client";
import { useToastContext } from "@/context/toastContext";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function CardsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setDormData] = useState({
    word: "",
    definition: "",
    pinyin: "",
  });

  const { showToast } = useToastContext();

  const t = useTranslations("cards");

  const handlesubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (Object.keys(formData).length === 0) {
      setLoading(false);
      showToast({
        message: t("error-form-empty"),
        variant: "error",
        duration: 3000,
      });
      return;
    }
    console.log(formData);
    setDormData({
      word: "",
      definition: "",
      pinyin: "",
    });
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-20">
      <form onSubmit={handlesubmit} className="w-full max-w-sm md:border rounded-sm p-5">
        <p className="py-5 font-bold text-xl text-center">{t("cards-form")}</p>
        <input
          type="text"
          name="word"
          placeholder="Word"
          className="w-full p-2 border rounded mb-4"
          value={formData.word}
          onChange={(e) => setDormData({ ...formData, word: e.target.value })}
        />
        <input
          type="text"
          name="definition"
          placeholder="Definition"
          className="w-full p-2 border rounded mb-4"
          value={formData.definition}
          onChange={(e) => setDormData({ ...formData, definition: e.target.value })}
        />
        <input
          type="text"
          name="pinyin"
          placeholder="Pinyin"
          className="w-full p-2 border rounded mb-4"
          value={formData.pinyin}
          onChange={(e) => setDormData({ ...formData, pinyin: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer p-2 bg-secondary dark:bg-theme-fg-dark text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
          aria-busy={loading}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    </main>
  );
}
