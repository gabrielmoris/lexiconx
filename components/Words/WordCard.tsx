import useTextToSpeech from "@/hooks/useTextToSpeech";
import formatMongoDate from "@/lib/dateFormat";
import { Language, Word } from "@/types/Words";
import { useTranslations } from "next-intl";
import SoundIcon from "../Icons/SoundIcon";
import { useToastContext } from "@/context/ToastContext";
import { useCallback, useState } from "react";
import RemoveIcon from "../Icons/RemoveIcon";
import Popup from "../UI/Popup";
import { useWords } from "@/context/WordsContext";

const WordCard = ({ word }: { word: Word }) => {
  const t = useTranslations("word-card");
  const { showToast } = useToastContext();
  const [deletePopup, setDeletePopup] = useState(false);
  const { deleteWord } = useWords();

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

  const readWord = useCallback(
    (text: string, language: Language) => {
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

      if (text) {
        speak(text, language);
      }
    },
    [isReady, isSupported, showToast, speak, t]
  );

  const openDeletePopup = () => {
    setDeletePopup(true);
    document.body.style.overflowY = "hidden";
  };

  const closeDeletePopup = () => {
    setDeletePopup(false);
    document.body.style.overflowY = "auto";
  };

  const handleDelete = () => {
    deleteWord(word);
    closeDeletePopup();
  };

  return (
    <div
      className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 
                 rounded-lg shadow-sm p-4 mb-4 flex flex-col space-y-2
                 hover:shadow-md transition-shadow duration-200"
    >
      {deletePopup && <Popup handleAccept={handleDelete} handleClose={closeDeletePopup} message={t("delete-message")} />}

      <div className="flex flex-row sm:flex-row justify-between mb-2">
        <div className="flex flex-row gap-5">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{word.word}</h3>
          {word.phoneticNotation && <p className="text-md text-gray-600 dark:text-gray-400">[{word.phoneticNotation}]</p>}
        </div>
        <SoundIcon className="w-5 h-5 cursor-pointer" onClick={() => readWord(word.word, word.language)} />
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1">{t("definition")}:</span> {word.definition}
      </p>

      <div className="pt-2 flex flex-row justify-between items-end border-t border-gray-100 dark:border-gray-700 mt-2">
        <div className="flex flex-col gap-1">
          {word.lastReviewed && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">{t("last-reviewed")}:</span> {formatMongoDate(word.lastReviewed)}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{t("next-review")}:</span> {formatMongoDate(word.nextReview)}
          </p>
        </div>
        <RemoveIcon className="w-5 h-5 cursor-pointer" onClick={openDeletePopup} />
      </div>
    </div>
  );
};

export default WordCard;
