import { Language, Word } from "@/types/Words";
import { Session } from "next-auth";

export const getUserData = async (session: Session) => {
  const response = await fetch(`/api/users?email=${session?.user?.email}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

export const saveWordsData = async (session: Session, words: Word[]) => {
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
