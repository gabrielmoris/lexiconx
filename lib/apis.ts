import { Language, User, Word } from "@/types/Words";
import { Session } from "next-auth";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// PRIVATE API HANDLER
const _apiHandler = async (
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
    session?: Session | null;
    isSSR?: boolean;
  } = {}
) => {
  const { method = "GET", body, session, isSSR = false } = options;
  const url = isSSR ? `${baseURL}${endpoint}` : endpoint;

  const config: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body || session) {
    config.body = JSON.stringify({
      ...(session && { session }),
      ...body,
    });
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Failed to fetch from ${endpoint}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

// EXPORTED FUNCTIONS

// USER RELATED APIS
export const getUserData = async (session: Session, isSSR = false) => {
  const endpoint = `/api/users?email=${session?.user?.email}`;
  return _apiHandler(endpoint, { isSSR });
};

export const selectUserLearningLanguage = async (session: Session, language: Language, isSSR = false) => {
  return _apiHandler("/api/users", {
    method: "POST",
    session,
    body: { activeLanguage: language },
    isSSR,
  });
};

export const updateUserData = async (session: Session, userData: Partial<User>, isSSR = false) => {
  return _apiHandler("/api/users", {
    method: "PUT",
    session,
    body: { userData },
    isSSR,
  });
};

export const deleteUserData = async (session: Session, isSSR = false) => {
  return _apiHandler("/api/users", {
    method: "DELETE",
    session,
    body: { session },
    isSSR,
  });
};

export const fetchUserWords = async (session: Session, language: Language, isSSR = false) => {
  const endpoint = `/api/words?language=${language}&email=${session.user?.email}`;
  return _apiHandler(endpoint, { isSSR });
};

// WORDS RELATED APIS
export const getWordsByIds = async (ids: string[], userEmail: string, isSSR = false) => {
  const endpoint = `/api/words?ids=${ids.join(",")}&email=${userEmail}`;
  return _apiHandler(endpoint, { isSSR });
};

export const updateWordsData = async (session: Session, words: Word[], isSSR = false) => {
  return _apiHandler("/api/words", {
    method: "PUT",
    session,
    body: { words },
    isSSR,
  });
};

export const addword = async (
  formData: {
    word: string;
    definition: string;
    phoneticNotation: string;
    language: Language;
    session: Session | null;
  },
  isSSR = false
) => {
  if (!formData.session) throw new Error("Session not found");
  const { session, ...wordData } = formData;
  return _apiHandler("/api/words", {
    method: "POST",
    session,
    body: wordData,
    isSSR,
  });
};

export const deleteWordApi = async (word: Word, session: Session, isSSR = false) => {
  if (!word) throw new Error("Word not found");

  return _apiHandler("/api/words", {
    method: "DELETE",
    session,
    body: { word },
    isSSR,
  });
};

export const wordsGeneration = async (session: Session, languageToLearn: Language, userLanguage: Language, level: number, isSSR = false) => {
  return _apiHandler("/api/ai-words", {
    method: "POST",
    session,
    body: { languageToLearn, userLanguage, level },
    isSSR,
  });
};

// QUIZ RELATED APIS
export const quizGeneration = async (session: Session, languageToLearn: Language, userLanguage: Language, level: number, isSSR = false) => {
  return _apiHandler("/api/ai-quiz", {
    method: "POST",
    session,
    body: { languageToLearn, userLanguage, level },
    isSSR,
  });
};
