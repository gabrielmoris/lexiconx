import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import "../globals.css";
import AuthProvider from "@/components/Auth/AuthProvider";
import { NextThemesProvider } from "../providers";
import Header from "@/components/Layout/Header";
import { ToastProvider } from "@/context/ToastContext";
import { LanguageToLearnProvider } from "@/context/LanguageToLearnContext";
import { WordsProvider } from "@/context/WordsContext";
import { QuizProvider } from "@/context/QuizContext";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const session = await getServerSession();

  return (
    <html lang={locale} suppressHydrationWarning className="overflow-x-hidden">
      <body className="flex flex-col items-center justify-start overflow-x-hidden">
        <NextIntlClientProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" locale={locale} enableSystem forcedTheme={undefined}>
            <AuthProvider session={session}>
              <ToastProvider>
                <LanguageToLearnProvider>
                  <WordsProvider>
                    <QuizProvider>
                      <Header />
                      {children}
                    </QuizProvider>
                  </WordsProvider>
                </LanguageToLearnProvider>
              </ToastProvider>
            </AuthProvider>
          </NextThemesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
