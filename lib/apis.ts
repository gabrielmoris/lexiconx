// TODO: Use 1 functiuon for all this.
import { Language, User, Word } from "@/types/Words";
import { Session } from "next-auth";

// USER RELATED APIS
export const getUserData = async (session: Session) => {
  const response = await fetch(`/api/users?email=${session?.user?.email}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

export const selectUserLearningLanguage = async (session: Session, language: Language) => {
  const response = await fetch(`/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session, activeLanguage: language }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to select language");
  }
  return response.json();
};

export const updateUserData = async (session: Session, userData: User) => {
  const response = await fetch(`/api/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session, userData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user data");
  }
  return response.json();
};

export const fetchUserWords = async (session: Session, language: Language) => {
  const response = await fetch(`/api/words?language=${language}&email=${session.user?.email}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user words");
  }
  return response.json();
};

// WORDS RELATED APIS
export const getWordsByIds = async (ids: string[], userEmail: string) => {
  const response = await fetch(`/api/words?ids=${ids.join(",")}&email=${userEmail}`);
  if (!response.ok) {
    throw new Error("Failed to fetch words by ID");
  }
  return response.json();
};

export const updateWordsData = async (session: Session, words: Word[]) => {
  const response = await fetch(`/api/words`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session, words }),
  });

  if (!response.ok) {
    throw new Error("Failed to save words data");
  }
  return response.json();
};

export const addword = async (formData: {
  word: string;
  definition: string;
  phoneticNotation: string;
  language: Language;
  session: Session | null;
}) => {
  if (!formData.session) throw new Error("Session not found");

  const response = await fetch(`/api/words`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...formData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add word");
  }
  return response.json();
};

// QUIZ RELATED APIS
export const quizGeneration = async (session: Session, languageToLearn: Language, userLanguage: Language, level: number) => {
  const response = await fetch(`/api/ai-gen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session, languageToLearn, userLanguage, level }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate quiz");
  }
  return response.json();
};
