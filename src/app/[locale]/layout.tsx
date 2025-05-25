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
        {/* This script runs before React hydration and prevents theme flashing */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  let storedTheme = localStorage.getItem('theme');
                  let theme = storedTheme;

                  if (!storedTheme) {
                    let systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    theme = systemTheme;
                  }

                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {e
                  console.error('Error accessing localStorage:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-x-hidden">
        <NextIntlClientProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" locale={locale} enableSystem forcedTheme={undefined}>
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
