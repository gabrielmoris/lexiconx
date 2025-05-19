import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import "../globals.css";
import AuthProvider from "@/components/auth/AuthProvider";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const session = await getServerSession();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <AuthProvider session={session}>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
