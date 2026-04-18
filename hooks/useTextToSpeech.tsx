/* eslint-disable react-hooks/exhaustive-deps */
import { Language } from "@/types/Words";
import { useState, useEffect, useCallback, useMemo } from "react";
import EasySpeech from "easy-speech";

interface UseTextToSpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeechReturn {
  speak: (text: string, language: Language) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  isReady: boolean;
  voices: SpeechSynthesisVoice[];
  getVoicesForLanguage: (language: Language) => SpeechSynthesisVoice[];
}

const useTextToSpeech = (options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const languages = useMemo(
    () => ({
      中文: "zh-CN",
      English: "en-US",
      Deutsch: "de-DE",
      Español: "es-ES",
      русский: "ru-RU",
    }),
    []
  );

  const handleStart = useCallback(() => {
    setIsSpeaking(true);
    setIsPaused(false);
    options.onStart?.();
  }, [options.onStart]);

  const handleEnd = useCallback(() => {
    setIsSpeaking(false);
    setIsPaused(false);
    options.onEnd?.();
  }, [options.onEnd]);

  const handleError = useCallback(
    (error: SpeechSynthesisErrorEvent) => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (error.error !== "interrupted") {
        options.onError?.(new Error(`Speech synthesis error: ${error.error}`));
      }
    },
    [options.onError]
  );

  useEffect(() => {
    setIsMounted(true);
    const detect = EasySpeech.detect();
    const supported = !!detect.speechSynthesis && !!detect.speechSynthesisUtterance;
    setIsSupported(supported);
  }, []);

  useEffect(() => {
    if (!isMounted || !isSupported) return;

    const initEasySpeech = async () => {
      try {
        await EasySpeech.init({ maxTimeout: 5000, interval: 250 });
        setIsReady(true);
        setVoices(EasySpeech.voices());

        EasySpeech.on({
          start: handleStart,
          end: handleEnd,
          error: handleError,
          pause: () => setIsPaused(true),
          resume: () => setIsPaused(false),
        });
      } catch (error) {
        console.warn("EasySpeech init failed:", error);
        options.onError?.(error instanceof Error ? error : new Error("Failed to initialize speech"));
      }
    };

    initEasySpeech();

    return () => {
      EasySpeech.reset();
    };
  }, [isMounted, isSupported, handleStart, handleEnd, handleError, options.onError]);

  const getVoicesForLanguage = useCallback(
    (language: Language) => {
      if (!language) return voices.filter((voice: { lang: string; }) => voice.lang.startsWith("en-US"));
      const langCode = languages[language].split("-")[0];
      return voices.filter((voice: { lang: string; }) => voice.lang.startsWith(langCode));
    },
    [voices, languages]
  );

  const speak = useCallback(
    async (text: string, language: Language) => {
      if (!isMounted || !isSupported) {
        options.onError?.(new Error("Text-to-speech is not supported in this browser"));
        return;
      }

      if (!text.trim()) {
        options.onError?.(new Error("No text provided"));
        return;
      }

      if (!isReady) {
        console.log("EasySpeech not ready yet, queuing speech request...");
        return;
      }

      const status = EasySpeech.status();
      if (status.status !== "init: complete") {
        options.onError?.(new Error("Text-to-speech not initialized"));
        return;
      }

      EasySpeech.cancel();

      const voicesForLang = getVoicesForLanguage(language);
      let voice: SpeechSynthesisVoice | undefined = voicesForLang[0];

      if (!voice) {
        const langCode = languages[language];
        voice = voices.find((v: { lang: string; }) => v.lang === langCode) || voices.find((v: { lang: string; }) => v.lang.startsWith(langCode.split("-")[0]));
      }

      if (!voice) {
        console.warn(`No voices found for language: ${language}. Using default voice.`);
      }

      try {
        await EasySpeech.speak({
          text,
          voice,
          pitch: options.pitch ?? 1,
          rate: options.rate ?? 1,
          volume: options.volume ?? 1,
        });
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error("Speech synthesis failed"));
      }
    },
    [getVoicesForLanguage, isMounted, isSupported, isReady, languages, options, voices]
  );

  const cancel = useCallback(() => {
    if (!isMounted || !isSupported) return;

    EasySpeech.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isMounted, isSupported]);

  const pause = useCallback(() => {
    if (!isMounted || !isSupported) return;

    EasySpeech.pause();
    setIsPaused(true);
  }, [isMounted, isSupported]);

  const resume = useCallback(() => {
    if (!isMounted || !isSupported) return;

    EasySpeech.resume();
    setIsPaused(false);
  }, [isMounted, isSupported]);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    isReady,
    voices,
    getVoicesForLanguage,
  };
};

export default useTextToSpeech;