/* eslint-disable react-hooks/exhaustive-deps */
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
  isReady: boolean;
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
  const [isReady, setIsReady] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pendingSpeechRef = useRef<{ text: string; language: Language } | null>(null);

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
    const supported = typeof window !== "undefined" && "speechSynthesis" in window;
    setIsSupported(supported);
  }, []);

  // Load voices
  const loadVoices = useCallback(() => {
    if (!isMounted || !isSupported) return;

    const synth = window.speechSynthesis;
    const availableVoices = synth.getVoices();

    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      setVoicesLoaded(true);
      setIsReady(true);

      // If there was a pending speech request, execute it now
      if (pendingSpeechRef.current) {
        const { text, language } = pendingSpeechRef.current;
        pendingSpeechRef.current = null;
        // Use setTimeout to avoid potential recursion issues
        setTimeout(() => speak(text, language), 0);
      }
    }
  }, [isMounted, isSupported]);

  // Initialize voices with more aggressive loading strategy
  useEffect(() => {
    if (!isMounted || !isSupported) return;

    const synth = window.speechSynthesis;

    // Force load voices immediately
    loadVoices();

    // Listen for voices changed event
    const handleVoicesChanged = () => {
      loadVoices();
    };

    synth.addEventListener("voiceschanged", handleVoicesChanged);

    // More aggressive fallback strategy
    let attempts = 0;
    const maxAttempts = 100; // Increased attempts
    const interval = setInterval(() => {
      if (voicesLoaded || attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }

      // Sometimes calling getVoices() multiple times helps trigger loading
      synth.getVoices();
      loadVoices();
      attempts++;
    }, 50); // Reduced interval for faster detection

    // Additional fallback: try to trigger voice loading by creating a dummy utterance
    if (!voicesLoaded) {
      try {
        const dummyUtterance = new SpeechSynthesisUtterance("");
        synth.speak(dummyUtterance);
        synth.cancel(); // Cancel immediately
        loadVoices();
      } catch (error) {
        console.warn("Could not create dummy utterance:", error);
      }
    }

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

      // If voices aren't loaded yet, queue the request
      if (!voicesLoaded || voices.length === 0) {
        console.log("Voices not loaded yet, queuing speech request...");
        pendingSpeechRef.current = { text, language };
        // Try to force load voices again
        loadVoices();
        return;
      }

      const synth = window.speechSynthesis;

      // Cancel any ongoing speech
      synth.cancel();

      // Find a suitable voice for the requested language
      const voicesForLang = getVoicesForLanguage(language);
      const voiceToUse = voicesForLang[0];

      // If no specific voice is found, try to find any voice for the language code
      let fallbackVoice: SpeechSynthesisVoice | undefined = voiceToUse;
      if (!fallbackVoice) {
        const langCode = languages[language];
        fallbackVoice = voices.find((voice) => voice.lang === langCode) || voices.find((voice) => voice.lang.startsWith(langCode.split("-")[0]));
      }

      if (!fallbackVoice) {
        console.warn(`No voices found for language: ${language}. Using default voice.`);
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice and language
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
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
    [getVoicesForLanguage, isMounted, isSupported, languages, options, voicesLoaded, voices, loadVoices]
  );

  const cancel = useCallback(() => {
    if (!isMounted || !isSupported) return;

    // Clear any pending speech
    pendingSpeechRef.current = null;
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
    isReady, // New property to indicate readiness
    voices,
    getVoicesForLanguage,
  };
};

export default useTextToSpeech;
