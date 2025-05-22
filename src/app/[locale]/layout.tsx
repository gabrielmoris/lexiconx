import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import "../globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import { NextThemesProvider } from "../providers";
import Header from "@/components/Layout/Header";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const session = await getServerSession();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/*
          This script needs to run as early as possible to prevent theme flickering.
          It's provided by next-themes.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'dark' || (theme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" locale={locale} enableSystem>
            <AuthProvider session={session}>
              <Header />
              {children}
            </AuthProvider>
          </NextThemesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
