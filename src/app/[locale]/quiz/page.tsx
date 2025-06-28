"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useToastContext } from "@/context/ToastContext";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import { useQuizManager } from "@/hooks/useQuizManager";
import LoadingComponent from "@/components/Layout/LoadingComponen";
import QuyizFinished from "@/components/Quiz/QuyizFinished";
import QuizView from "@/components/Quiz/QuizView";
import type { User } from "@/types/Words";
import { getUserData } from "@/lib/apis";

const QuizPage = () => {
  const { data: session, status } = useSession();
  const { showToast } = useToastContext();
  const t = useTranslations("quiz");
  const [userData, setUserData] = useState<User>();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (status === "authenticated") {
        try {
          const { data } = await getUserData(session);
          setUserData(data);
        } catch (e) {
          console.error(e);
          showToast({ message: t("error-getting-user"), variant: "error", duration: 3000 });
        }
      }
    };
    fetchUser();
  }, [session, status, showToast, t]);

  const {
    isLoading,
    isQuizFinished,
    score,
    currentQuizItem,
    currentQuestion,
    feedback,
    quizProgress,
    questionProgress,
    handleAnswerClick,
    restartQuiz,
  } = useQuizManager(userData!);

  const { speak, getVoicesForLanguage } = useTextToSpeech({
    onError: (error) => console.error("Speech error:", error),
  });

  useEffect(() => {
    if (currentQuizItem?.language) {
      getVoicesForLanguage(currentQuizItem.language);
    }
  }, [currentQuizItem, getVoicesForLanguage]);

  const readQuiz = useCallback(() => {
    if (currentQuizItem?.sentence) {
      speak(currentQuizItem.sentence, currentQuizItem.language);
    }
  }, [currentQuizItem, speak]);

  if (isLoading || status === "loading" || !userData) {
    return <LoadingComponent />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-20 px-4">
      {isQuizFinished ? (
        <QuyizFinished isSuccess={score.success / 2 > score.errors} successPoints={score} onRestartQuiz={restartQuiz} />
      ) : (
        <QuizView
          quizItem={currentQuizItem}
          question={currentQuestion}
          onAnswerClick={handleAnswerClick}
          feedback={feedback}
          quizProgress={quizProgress}
          questionProgress={questionProgress}
          onReadQuiz={readQuiz}
        />
      )}
    </main>
  );
};

export default QuizPage;
