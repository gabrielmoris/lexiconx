"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useToastContext } from "@/context/ToastContext";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import { useQuizManager } from "@/hooks/useQuizManager";
import LoadingComponent from "@/components/Layout/LoadingComponent";
import QuyizFinished from "@/components/Quiz/QuyizFinished";
import QuizView from "@/components/Quiz/QuizView";
import type { User } from "@/types/Words";
import { getUserData } from "@/lib/apis";
import { redirect } from "next/navigation";

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
          redirect("/");
        }
      } else if (status === "unauthenticated") {
        redirect("/");
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

  const { speak, isReady, isSupported } = useTextToSpeech({
    onError: (error) => {
      console.error("Speech error:", error);
      showToast({
        message: t("error-speech"),
        variant: "error",
        duration: 3000,
      });
    },
  });

  const readQuiz = useCallback(() => {
    if (!isSupported) {
      showToast({
        message: t("error-speech"),
        variant: "error",
        duration: 3000,
      });
      return;
    }

    if (!isReady) {
      showToast({
        message: t("loading-voices"),
        variant: "info",
        duration: 2000,
      });
      return;
    }

    if (currentQuizItem?.sentence) {
      speak(currentQuizItem?.sentence, currentQuizItem?.language);
    }
  }, [isSupported, isReady, currentQuizItem?.sentence, currentQuizItem?.language, showToast, t, speak]);

  if (isLoading || status === "loading" || !userData) {
    return <LoadingComponent />;
  }

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center md:justify-start py-15 px-4 w-full">
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
