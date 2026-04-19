import { useCallback, useEffect, useRef, useState } from "react";
import EasySpeech from "easy-speech";
import { Language } from "@/types/Words";
import { EasySpeechSnapshot, initEasySpeech, subscribe } from "@/lib/tts/easySpeechService";

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

const LANGUAGE_CODES: Record<Language, string> = {
  中文: "zh-CN",
  English: "en-US",
  Deutsch: "de-DE",
  Español: "es-ES",
  русский: "ru-RU",
};

const useTextToSpeech = (options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speakingRef = useRef(false);
  const [snapshot, setSnapshot] = useState<EasySpeechSnapshot>({
    isSupported: false,
    isReady: false,
    voices: [],
  });

  useEffect(() => {
    let unsub: (() => void) | undefined;

    initEasySpeech().then(() => {
      unsub = subscribe(setSnapshot);
    });

    return () => {
      unsub?.();
    };
  }, []);

  const getVoicesForLanguage = useCallback(
    (language: Language) => {
      const voices = snapshot.voices;
      if (!language) {
        return voices.filter((v) => v.lang.startsWith("en"));
      }
      const langCode = LANGUAGE_CODES[language];
      const base = langCode.split("-")[0];
      return voices.filter((v) => v.lang.startsWith(base));
    },
    [snapshot.voices]
  );

  const speak = useCallback(
    (text: string, language: Language) => {
      if (!snapshot.isSupported) {
        options.onError?.(new Error("Text-to-speech is not supported in this browser"));
        return;
      }
      if (!text.trim()) {
        options.onError?.(new Error("No text provided"));
        return;
      }
      if (!snapshot.isReady) {
        console.log("EasySpeech not ready yet, skipping speech request...");
        return;
      }

      const langCode = LANGUAGE_CODES[language];
      const voicesForLang = getVoicesForLanguage(language);
      let voice: SpeechSynthesisVoice = voicesForLang[0];

      if (!voice) {
        voice =
          snapshot.voices.find((v) => v.lang === langCode) ||
          snapshot.voices.find((v) => v.lang.startsWith(langCode.split("-")[0])) as SpeechSynthesisVoice;
      }

      if (!voice) {
        console.warn(`No voices found for language: ${language}. Using default voice.`);
      }

      EasySpeech.cancel();

      EasySpeech.speak({
        text,
        voice,
        pitch: options.pitch ?? 1,
        rate: options.rate ?? 1,
        volume: options.volume ?? 1,
        start: () => {
          speakingRef.current = true;
          setIsSpeaking(true);
          setIsPaused(false);
          options.onStart?.();
        },
        end: () => {
          speakingRef.current = false;
          setIsSpeaking(false);
          setIsPaused(false);
          options.onEnd?.();
        },
        error: (e: SpeechSynthesisErrorEvent) => {
          speakingRef.current = false;
          setIsSpeaking(false);
          setIsPaused(false);
          if (e.error === "interrupted" || e.error === "canceled") {
           return;
          }
           options.onError?.(new Error(`Speech synthesis error: ${e.error}`));
        },
        pause: () => setIsPaused(true),
        resume: () => setIsPaused(false),
      }).catch((err) => {
          const code = err?.error;
          if (code === "interrupted" || code === "canceled") {
            return;
          }

          options.onError?.(
            new Error(
              `Speech synthesis error (promise): ${
                typeof code === "string" ? code : String(err)
              }`
          )
        );
      });
    },
    [snapshot.isSupported, snapshot.isReady, snapshot.voices, getVoicesForLanguage, options]
  );

  const cancel = useCallback(() => {
    if (!snapshot.isSupported) return;
    speakingRef.current = false;
    EasySpeech.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [snapshot.isSupported]);

  const pause = useCallback(() => {
    if (!snapshot.isSupported) return;
    EasySpeech.pause();
    setIsPaused(true);
  }, [snapshot.isSupported]);

  const resume = useCallback(() => {
    if (!snapshot.isSupported) return;
    EasySpeech.resume();
    setIsPaused(false);
  }, [snapshot.isSupported]);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported: snapshot.isSupported,
    isReady: snapshot.isReady,
    voices: snapshot.voices,
    getVoicesForLanguage,
  };
};

export default useTextToSpeech;