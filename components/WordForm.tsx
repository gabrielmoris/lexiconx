"use client";
import { useLanguage } from "@/context/LanguageToLearnContext";
import { useToastContext } from "@/context/toastContext";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Button from "./UI/Button";

const WordForm = () => {
  const { showToast } = useToastContext();
  const { selectedLanguage } = useLanguage();
  const { data: session, status } = useSession();
  const t = useTranslations("cards");

  const [loading, setLoading] = useState(false);
  const [addWord, setAddWord] = useState(false);
  const [formData, setFormData] = useState({
    word: "",
    definition: "",
    phoneticNotation: "",
    language: selectedLanguage,
    session: session,
  });

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      language: selectedLanguage,
      session: session,
    }));
  }, [selectedLanguage, session]);

  const handlesubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          language: "Chinese",
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        showToast({
          message: t("error-adding-word"),
          variant: "error",
          duration: 3000,
        });
        throw new Error(result.error || "Something went wrong");
      }

      showToast({
        message: t("success-word-added"),
        variant: "success",
        duration: 3000,
      });
      // Clear the form
      setFormData({
        word: "",
        definition: "",
        phoneticNotation: "",
        language: selectedLanguage,
        session: session,
      });
    } catch (error: unknown) {
      console.error("Failed to add word:", error);
      showToast({
        message: error instanceof Error ? error.message : t("error-adding-word"),
        variant: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return null;
  }

  if (addWord) {
    return (
      <form onSubmit={handlesubmit} className="w-full max-w-md md:border rounded-sm p-5">
        <p className="py-5 font-bold text-xl text-center">{t("cards-form")}</p>

        <input
          type="text"
          name="word"
          required
          placeholder="Word *"
          className="w-full p-2 border rounded mb-4"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value.trim() })}
        />

        <input
          type="text"
          name="phoneticNotation"
          placeholder="Phonetic Notation / Pinyin"
          className="w-full p-2 border rounded mb-4"
          value={formData.phoneticNotation}
          onChange={(e) => setFormData({ ...formData, phoneticNotation: e.target.value.trim() })}
        />

        <input
          type="text"
          name="definition"
          placeholder="Definition *"
          required
          className="w-full p-2 border rounded mb-4"
          value={formData.definition}
          onChange={(e) => setFormData({ ...formData, definition: e.target.value.trim() })}
        />

        <Button type="button" onClick={() => setAddWord(false)} variant="secondary" className="mb-5">
          {t("close-btn")}
        </Button>

        <Button type="submit" disabled={loading} variant="primary" className="mb-5">
          {loading ? t("adding") : t("add")}
        </Button>
      </form>
    );
  }

  return (
    <section className="w-full p-5 max-w-md">
      <Button onClick={() => setAddWord(true)} className="flex items-center justify-between px-5">
        {t("add-word")} <span className="text-2xl font-extrabold">+</span>
      </Button>
    </section>
  );
};

export default WordForm;
