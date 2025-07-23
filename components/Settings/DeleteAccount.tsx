"use client";
import { useToastContext } from "@/context/ToastContext";
import DeleteAccountIcon from "../Icons/DeleteAccountIcon";
import { useTranslations } from "next-intl";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { deleteUserData } from "@/lib/apis";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Popup from "../UI/Popup";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Quiz } from "@/types/Quiz";

const DeleteAccount = () => {
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const { showToast } = useToastContext();
  const { session, status } = useAuthGuard();
  const t = useTranslations("delete-account");
  const { deleteValue: deleteStep } = useLocalStorage("onboardingStep", 1);
  const { deleteValue: deleteQuiz } = useLocalStorage<{ quizzes: Quiz[] }>("quizes", { quizzes: [] });

  const handleDelete = async () => {
    try {
      if (status !== "authenticated" || !session) {
        throw new Error();
      }

      const { data } = await deleteUserData(session);

      if (data.deletedCount !== 1) {
        throw new Error();
      }

      deleteStep();
      deleteQuiz();
      signOut();
    } catch {
      showToast({
        message: t("error-deleting-account"),
        variant: "error",
        duration: 3000,
      });
    }
  };

  return (
    <>
      {isOpenPopup && <Popup handleAccept={handleDelete} handleClose={() => setIsOpenPopup(false)} message={t("delete message")} />}
      <button
        aria-label="Toggle Dark Mode"
        type="button"
        className="p-2 rounded-md hover:dark:bg-theme-fg-dark hover:bg-theme-fg-light transition-all duration-300 relative cursor-pointer"
        onClick={() => setIsOpenPopup(true)}
      >
        <DeleteAccountIcon className="w-6 h-6" />
      </button>
    </>
  );
};

export default DeleteAccount;
