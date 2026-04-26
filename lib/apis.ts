import { Language, User, Word } from "@/types/Words";
import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// PRIVATE API HANDLER
const _apiHandler = async (
	endpoint: string,
	options: {
		method?: "GET" | "POST" | "PUT" | "DELETE";
		body?: Record<string, unknown>;
		isSSR?: boolean;
	} = {},
) => {
	const { method = "GET", body, isSSR = false } = options;
	const url = isSSR ? `${baseURL}${endpoint}` : endpoint;

	const config: RequestInit = {
		method,
		headers: { "Content-Type": "application/json" },
		credentials: "include", // Include cookies for server-side session validation
	};

	// For SSR calls, forward the user's cookies so the API route can validate the session
	if (isSSR) {
		try {
			const cookieStore = await cookies();
			config.headers = {
				...config.headers,
				Cookie: cookieStore.toString(),
			};
		} catch {
			// cookies() may not be available in all contexts
		}
	}

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

// EXPORTED FUNCTIONS

// USER RELATED APIS
export const getUserData = async (isSSR = false) => {
	const endpoint = "/api/users";
	return _apiHandler(endpoint, { isSSR });
};

export const selectUserLearningLanguage = async (language: Language, isSSR = false) => {
	return _apiHandler("/api/users", {
		method: "POST",
		body: { activeLanguage: language },
		isSSR,
	});
};

export const updateUserData = async (userData: Partial<User>, isSSR = false) => {
	return _apiHandler("/api/users", {
		method: "PUT",
		body: { userData },
		isSSR,
	});
};

export const deleteUserData = async (isSSR = false) => {
	return _apiHandler("/api/users", {
		method: "DELETE",
		isSSR,
	});
};

export const fetchUserWords = async (language: Language, isSSR = false) => {
	const endpoint = `/api/words?language=${language}`;
	return _apiHandler(endpoint, { isSSR });
};

// WORDS RELATED APIS
export const getWordsByIds = async (ids: string[], isSSR = false) => {
	const endpoint = `/api/words?ids=${ids.join(",")}`;
	return _apiHandler(endpoint, { isSSR });
};

export const updateWordsData = async (words: Word[], isSSR = false) => {
	return _apiHandler("/api/words", {
		method: "PUT",
		body: { words },
		isSSR,
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
) => {
	return _apiHandler("/api/words", {
		method: "POST",
		body: wordData,
		isSSR,
	});
};

export const deleteWordApi = async (word: Word, isSSR = false) => {
	if (!word) throw new Error("Word not found");

	return _apiHandler("/api/words", {
		method: "DELETE",
		body: { word },
		isSSR,
	});
};

export const wordsGeneration = async (languageToLearn: Language, userLanguage: Language, level: number, isSSR = false) => {
	return _apiHandler("/api/ai-words", {
		method: "POST",
		body: { languageToLearn, userLanguage, level },
		isSSR,
	});
};

// QUIZ RELATED APIS
export const quizGeneration = async (languageToLearn: Language, userLanguage: Language, level: number, isSSR = false) => {
	return _apiHandler("/api/ai-quiz", {
		method: "POST",
		body: { languageToLearn, userLanguage, level },
		isSSR,
	});
};
