"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";
import { locales } from "@/src/i18n/routing";
import ChinaFlag from "@/components/Icons/ChinaFlag";
import EnglishFlag from "@/components/Icons/EnglishFlag";
import GermanFlag from "@/components/Icons/GermanFlag";
import SpanishFlag from "@/components/Icons/SpanishFlag";
import { Locale } from "@/types/Words";
import { createElement, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateUserData } from "@/lib/apis";

const languages = {
  en: { name: "English", icon: EnglishFlag },
  de: { name: "Deutsch", icon: GermanFlag },
  zh: { name: "中文", icon: ChinaFlag },
  es: { name: "Español", icon: SpanishFlag },
};

export default function LocaleSwitcher() {
  const [isUserChoosing, setIsUserChoosing] = useState(false);
  const [flagPositions, setFlagPositions] = useState<{ [key: string]: { x: number; y: number; rotation: number } }>({});
  const currentLocale: Locale = useLocale() as Locale;
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const t = useTranslations("locale-switcher");

  // Initialize static positions for flags when user starts choosing
  useEffect(() => {
    if (isUserChoosing) {
      const positions: { [key: string]: { x: number; y: number; rotation: number } } = {};
      const flagCount = locales.length;

      locales.forEach((locale, index) => {
        // Distribute flags evenly across screen
        const angle = (index / flagCount) * 2 * Math.PI;
        const radius = 25;
        const centerX = 50;
        const centerY = 50;

        positions[locale] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          rotation: 0,
        };
      });
      setFlagPositions(positions);
    }
  }, [isUserChoosing]);

  // Check why it is not updating the database

  const handleUserChoice = async (language: Locale) => {
    console.log("User chose a language", language);
    try {
      if (!session || status !== "authenticated") throw new Error("Session not found");
      await updateUserData(session, { nativeLanguage: language });
    } catch (error) {
      console.error("Failed to select language:", error);
    }
    setIsUserChoosing(false);
  };

  return (
    <section className="relative flex flex-col items-center justify-start gap-10 min-h-[65vh] overflow-hidden">
      <p className="text-2xl font-bold text-center z-10">{t("title")}</p>

      {isUserChoosing ? (
        <>
          {/* Floating flags with waving animation */}
          {locales.map((locale) => (
            <div
              key={`floating-${locale}`}
              className="absolute z-20 animate-pulse"
              style={{
                left: `${flagPositions[locale]?.x || 50}%`,
                top: `${flagPositions[locale]?.y || 50}%`,
                transform: `translate(-50%, -50%)`,
                animation: `wave-${locale} 3s ease-in-out infinite`,
              }}
            >
              <Link href={`/${pathname.split("/")[1]}`} locale={locale} className="block hover:scale-110 transition-transform duration-200">
                <div
                  onClick={() => handleUserChoice(locale as Locale)}
                  className="flex items-center justify-center cursor-pointer w-16 h-16 md:w-20 md:h-20"
                >
                  {createElement(languages[locale as Locale].icon, {
                    className: "w-full h-full object-contain",
                  })}
                </div>
              </Link>
            </div>
          ))}

          {/* Close button */}
          <button
            onClick={() => setIsUserChoosing(false)}
            className="absolute cursor-pointer z-30 p-2 rounded-full bg-secondary text-white dark:bg-theme-fg-dark hover:bg-gray-700 transition-colors backdrop-blur-sm"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            aria-label="Close language selector"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      ) : (
        <button onClick={() => setIsUserChoosing(true)} className="hover:scale-120 transition-transform">
          <div className="flex items-center justify-center cursor-pointer w-16 h-16 md:w-20 md:h-20">
            {createElement(languages[currentLocale].icon, {
              className: "w-full h-full object-contain",
            })}
          </div>
        </button>
      )}

      {/* CSS animations for flag waving */}
      <style jsx>{`
        @keyframes wave-en {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-2deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(2deg) scale(1.05);
          }
        }
        @keyframes wave-de {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(1deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-3deg) scale(1.05);
          }
        }
        @keyframes wave-zh {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(2deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-1deg) scale(1.05);
          }
        }
        @keyframes wave-es {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-1deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(3deg) scale(1.05);
          }
        }
      `}</style>
    </section>
  );
}
