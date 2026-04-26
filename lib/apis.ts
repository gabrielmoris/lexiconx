import { Language, User, Word } from "@/types/Words";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const _apiHandler = async (
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
    isSSR?: boolean;
    ssrHeaders?: Record<string, string>;
  } = {},
) => {
  const { method = "GET", body, isSSR = false, ssrHeaders } = options;
  const url = isSSR ? `${baseURL}${endpoint}` : endpoint;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // For SSR calls, forward any provided headers (e.g. Cookie for session)
  if (isSSR && ssrHeaders) {
    Object.assign(headers, ssrHeaders);
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Failed to fetch from ${endpoint}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

// USER RELATED APIS
export const getUserData = async (isSSR = false, ssrHeaders?: Record<string, string>) => {
  const endpoint = "/api/users";
  return _apiHandler(endpoint, { isSSR, ssrHeaders });
};

export const selectUserLearningLanguage = async (language: Language, isSSR = false, ssrHeaders?: Record<string, string>) => {
  return _apiHandler("/api/users", {
    method: "POST",
    body: { activeLanguage: language },
    isSSR,
    ssrHeaders,
  });
};

export const updateUserData = async (userData: Partial<User>, isSSR = false, ssrHeaders?: Record<string, string>) => {
  return _apiHandler("/api/users", {
    method: "PUT",
    body: { userData },
    isSSR,
    ssrHeaders,
  });
};

export const deleteUserData = async (isSSR = false, ssrHeaders?: Record<string, string>) => {
  return _apiHandler("/api/users", {
    method: "DELETE",
    isSSR,
    ssrHeaders,
  });
};

export const fetchUserWords = async (language: Language, isSSR = false, ssrHeaders?: Record<string, string>) => {
  const endpoint = `/api/words?language=${language}`;
  return _apiHandler(endpoint, { isSSR, ssrHeaders });
};

// WORDS RELATED APIS
export const getWordsByIds = async (ids: string[], isSSR = false, ssrHeaders?: Record<string, string>) => {
  const endpoint = `/api/words?ids=${ids.join(",")}`;
  return _apiHandler(endpoint, { isSSR, ssrHeaders });
};

export const updateWordsData = async (words: Word[], isSSR = false, ssrHeaders?: Record<string, string>) => {
  return _apiHandler("/api/words", {
    method: "PUT",
    body: { words },
    isSSR,
    ssrHeaders,
  });
};

export const addWordToDatabase = async (
  wordData: {
    word: string;
    definition: string;
    phoneticNotation: string;
    language: Language;
  },
  isSSR = false,
  ssrHeaders?: Record<string, string>,
) => {
  return _apiHandler("/api/words", {
    method: "POST",
    body: wordData,
    isSSR,
    ssrHeaders,
  });
};

export const deleteWordApi = async (word: Word, isSSR = false, ssrHeaders?: Record<string, string>) => {
  if (!word) throw new Error("Word not found");

  return _apiHandler("/api/words", {
    method: "DELETE",
    body: { word },
    isSSR,
    ssrHeaders,
  });
};

export const wordsGeneration = async (
  languageToLearn: Language,
  userLanguage: Language,
  level: number,
  isSSR = false,
  ssrHeaders?: Record<string, string>,
) => {
  return _apiHandler("/api/ai-words", {
    method: "POST",
    body: { languageToLearn, userLanguage, level },
    isSSR,
    ssrHeaders,
  });
};

// QUIZ RELATED APIS
export const quizGeneration = async (
  languageToLearn: Language,
  userLanguage: Language,
  level: number,
  isSSR = false,
  ssrHeaders?: Record<string, string>,
) => {
  return _apiHandler("/api/ai-quiz", {
    method: "POST",
    body: { languageToLearn, userLanguage, level },
    isSSR,
    ssrHeaders,
  });
};
