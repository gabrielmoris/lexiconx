import LanguageCards from "@/components/LanguageCards";
import LanguageToLearn from "@/components/LanguageToLearn";
import WordForm from "@/components/WordForm";

export default function CardsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-20">
      <LanguageToLearn className="mb-5" />
      <WordForm />
      <LanguageCards />
    </main>
  );
}
