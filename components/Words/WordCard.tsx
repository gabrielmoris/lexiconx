import useTextToSpeech from "@/hooks/useTextToSpeech";
import formatMongoDate from "@/lib/dateFormat";
import { Language, Word } from "@/types/Words";
import { useTranslations } from "next-intl";
import SoundIcon from "../Icons/SoundIcon";

const WordCard = ({ word }: { word: Word }) => {
  const t = useTranslations("word-card");

  const { speak } = useTextToSpeech({
    onError: (error) => console.error("Speech error:", error),
    rate: 1,
    pitch: 1,
  });

  const readWord = (text: string, language: string) => {
    speak(text, language as Language);
  };

  return (
    <div
      className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 
                 rounded-lg shadow-sm p-4 mb-4 flex flex-col space-y-2
                 hover:shadow-md transition-shadow duration-200"
    >
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

      <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
        {word.lastReviewed && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{t("last-reviewed")}:</span> {formatMongoDate(word.lastReviewed)}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">{t("next-review")}:</span> {formatMongoDate(word.nextReview)}
        </p>
      </div>
    </div>
  );
};

export default WordCard;
