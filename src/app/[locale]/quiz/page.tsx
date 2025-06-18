"use client";
import LoadingComponent from "@/components/Layout/LoadingComponen";
import { useQuiz } from "@/context/QuizContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "@/src/i18n/navigation";
import type { Quiz } from "@/types/Quiz";
import { useEffect, useState } from "react";

const Quiz = () => {
  const { generateQuiz, quiz } = useQuiz();
  const [storedQuizzes, , isHydrated] = useLocalStorage<{ quizzes: Quiz[] }>("quizes", { quizzes: [] });
  const [quizStep, setQuizStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);

  const route = useRouter();

  useEffect(() => {
    console.log("stored", storedQuizzes);

    if (quiz?.length === 0 && isHydrated && storedQuizzes.quizzes.length === 0) {
      route.push("/cards");
    }
  }, [quiz, storedQuizzes, isHydrated, route]);

  if (!isHydrated) {
    return <LoadingComponent />;
  }

  return <div>page</div>;
};

export default Quiz;
