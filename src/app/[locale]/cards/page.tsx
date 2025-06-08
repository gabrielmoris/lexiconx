import LanguageCards from "@/components/Words/WordList";
import LanguageToLearn from "@/components/LanguageToLearn";
import WordForm from "@/components/WordForm";

export default function CardsPage() {
  return (
    <main className="min-h-screen max-w-xl flex flex-col items-center justify-start py-20">
      <LanguageToLearn className="mb-5" />
      <WordForm className="mb-5" />
      <LanguageCards />
    </main>
  );
}
