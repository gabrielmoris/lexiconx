import { Language } from "@/types/Words";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

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
  voices: SpeechSynthesisVoice[];
  getVoicesForLanguage: (language: Language) => SpeechSynthesisVoice[];
}

const useTextToSpeech = (options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const languages = useMemo(
    () => ({
      chinese: "zh-CN",
      english: "en-US",
      german: "de-DE",
      spanish: "es-ES",
    }),
    []
  );

  // Handle hydration by checking support only after component mounts
  useEffect(() => {
    setIsMounted(true);
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Load voices
  const loadVoices = useCallback(() => {
    if (!isMounted || !isSupported) return;

    const synth = window.speechSynthesis;
    const availableVoices = synth.getVoices();
    setVoices(availableVoices);
    setVoicesLoaded(true);
  }, [isMounted, isSupported]);

  // Initialize voices
  useEffect(() => {
    if (!isMounted || !isSupported) return;

    const synth = window.speechSynthesis;

    // Load voices immediately if available
    loadVoices();

    // Listen for voices changed event
    const handleVoicesChanged = () => {
      loadVoices();
    };

    synth.addEventListener("voiceschanged", handleVoicesChanged);

    // Fallback: try loading voices periodically
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      if (voicesLoaded || attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      loadVoices();
      attempts++;
    }, 100);

    return () => {
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
      clearInterval(interval);
    };
  }, [isMounted, isSupported, loadVoices, voicesLoaded]);

  // Update speaking state based on synthesis state
  useEffect(() => {
    if (!isMounted || !isSupported) return;

    const updateState = () => {
      const synth = window.speechSynthesis;
      setIsSpeaking(synth.speaking);
      setIsPaused(synth.paused);
    };

    const interval = setInterval(updateState, 100);

    return () => clearInterval(interval);
  }, [isMounted, isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMounted && isSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isMounted, isSupported]);

  const getVoicesForLanguage = useCallback(
    (language: Language) => {
      if (!language) return voices.filter((voice) => voice.lang.startsWith("en-US"));
      const langCode = languages[language].split("-")[0];
      return voices.filter((voice) => voice.lang.startsWith(langCode));
    },
    [voices, languages]
  );

  const speak = useCallback(
    (text: string, language: Language) => {
      if (!isMounted || !isSupported) {
        options.onError?.(new Error("Text-to-speech is not supported in this browser"));
        return;
      }

      if (!text.trim()) {
        options.onError?.(new Error("No text provided"));
        return;
      }

      const synth = window.speechSynthesis;

      // Cancel any ongoing speech
      synth.cancel();

      // 1. Find a suitable voice for the requested language.
      const voicesForLang = getVoicesForLanguage(language);
      const voiceToUse = voicesForLang[0]; // Let's just pick the first available one.

      // 2. If no voice is found, log an error but still try to speak.
      //    The browser might fall back to a default voice.
      if (!voiceToUse) {
        console.warn(`No voices found for language: ${language}. The browser will attempt to use a default.`);
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // 3. Explicitly assign the found voice and language.
      utterance.voice = voiceToUse;
      utterance.lang = languages[language];
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        options.onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        options.onEnd?.();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (event.error !== "interrupted") {
          options.onError?.(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [getVoicesForLanguage, isMounted, isSupported, languages, options]
  );

  const cancel = useCallback(() => {
    if (!isMounted || !isSupported) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isMounted, isSupported]);

  const pause = useCallback(() => {
    if (!isMounted || !isSupported) return;

    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isMounted, isSupported]);

  const resume = useCallback(() => {
    if (!isMounted || !isSupported) return;

    window.speechSynthesis.resume();
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
    voices,
    getVoicesForLanguage,
  };
};

export default useTextToSpeech;
