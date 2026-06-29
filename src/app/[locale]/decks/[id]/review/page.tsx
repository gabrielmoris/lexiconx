import { requireAuthSSR } from '@/lib/auth/authGuardSSR';
import { getLocale } from 'next-intl/server';
import DeckReview from '@/components/Decks/DeckReview';

export default async function DeckReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  await requireAuthSSR(`/${locale}/onboarding`);
  const { id } = await params;

  return (
    <main className="min-h-screen w-full md:w-5/6 px-5 md:px-0 flex flex-col items-center justify-start pt-10 pb-20 md:py-15">
      <DeckReview deckId={id} />
    </main>
  );
}
