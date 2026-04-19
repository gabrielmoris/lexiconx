import EasySpeech from "easy-speech";

// NOTE: I am using singleton with observer pattern here. I think it is the best approach
// because I am subscribing from each word card to render the tts.

export type EasySpeechSnapshot = {
  isSupported: boolean;
  isReady: boolean;
  voices: SpeechSynthesisVoice[];
};

let initialized = false;
let initPromise: Promise<void> | null = null;

let snapshot: EasySpeechSnapshot = {
  isSupported: false,
  isReady: false,
  voices: [],
};

type Listener = (snap: EasySpeechSnapshot) => void;
const listeners = new Set<Listener>();

const notify = () => {
  for (const listener of listeners) listener(snapshot);
};

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  listener(snapshot);
  return () => listeners.delete(listener);
};

export const getSnapshot = () => snapshot;

export const initEasySpeech = async () => {
  if (initialized && initPromise) return initPromise;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const detect = EasySpeech.detect();
    snapshot = {
      ...snapshot,
      isSupported: !!detect.speechSynthesis && !!detect.speechSynthesisUtterance,
    };
    notify();

    if (!snapshot.isSupported) {
      initialized = true;
      return;
    }

    try {
      await EasySpeech.init({
        maxTimeout: 5000,
        interval: 250,
      });

      const status = EasySpeech.status() as { status?: string };
      snapshot = {
        ...snapshot,
        isReady: status.status === "init: complete",
        voices: EasySpeech.voices(),
      };
      notify();

      EasySpeech.on?.({
        voiceschanged: () => {
          snapshot = { ...snapshot, voices: EasySpeech.voices() };
          notify();
        },
      } as Parameters<typeof EasySpeech.on>[0]);
    } catch (e) {
      console.warn("EasySpeech init failed:", e);
    }

    initialized = true;
  })();

  return initPromise;
};
