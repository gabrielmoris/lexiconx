import { requireAuthSSR } from '@/lib/auth/authGuardSSR';
import { getLocale } from 'next-intl/server';
import MemoryHooksPageClient from './MemoryHooksPageClient';

export default async function MemoryHooksPage() {
  const locale = await getLocale();
  await requireAuthSSR(`/${locale}/onboarding`);

  return <MemoryHooksPageClient />;
}
