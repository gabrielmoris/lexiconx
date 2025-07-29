"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";
import { locales } from "@/src/i18n/routing";
import ChinaFlag from "@/components/Icons/ChinaFlag";
import EnglishFlag from "@/components/Icons/EnglishFlag";
import GermanFlag from "@/components/Icons/GermanFlag";
import SpanishFlag from "@/components/Icons/SpanishFlag";
import RussianFlag from "@/components/Icons/RussianFlag";
import { Language, Locale } from "@/types/Words";
import { createElement, useState, useEffect, useMemo } from "react";
import { updateUserData } from "@/lib/apis";
import { AnimatePresence, motion, easeOut, easeIn } from "framer-motion";
import LoadingComponent from "../Layout/LoadingComponent";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const languages = {
  en: { name: "English", icon: EnglishFlag },
  de: { name: "Deutsch", icon: GermanFlag },
  zh: { name: "中文", icon: ChinaFlag },
  es: { name: "Español", icon: SpanishFlag },
  ru: { name: "русский", icon: RussianFlag },
};

const titles = ["Select your native language!", "Wähle deine Muttersprache!", "Selecciona tu idioma nativo!", "选择你的母语！"];

export default function LocaleSwitcher({ setNextStep }: { setNextStep: () => void }) {
  const [isUserChoosing, setIsUserChoosing] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentLocale: Locale = useLocale() as Locale;
  const pathname = usePathname();
  const { session, status } = useAuthGuard();

  const flagPositions = useMemo(() => {
    const positions: { [key: string]: { x: number; y: number; rotation: number } } = {};
    const flagCount = locales.length;
    const radius = 25;
    const centerX = 50;
    const centerY = 50;

    locales.forEach((locale, index) => {
      const angle = (index / flagCount) * 2 * Math.PI - Math.PI / 2;

      positions[locale] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        rotation: 0,
      };
    });
    return positions;
  }, []);

  const [isFlagPositionsReady, setIsFlagPositionsReady] = useState(false);

  useEffect(() => {
    setIsFlagPositionsReady(true);
  }, []);

  const handleUserChoice = async (language: Locale) => {
    try {
      if (!session || status !== "authenticated") {
        console.warn("Session not found or not authenticated. Cannot update user data.");
        return;
      }

      await updateUserData(session, { nativeLanguage: languages[language].name as Language });
      setNextStep();
    } catch (error) {
      console.error("Failed to select language:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
    center: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.5,
        ease: easeIn,
      },
    },
  };

  if (!isFlagPositionsReady || status === "loading") return <LoadingComponent />;

  return (
    <section className="relative flex flex-col items-center justify-start gap-10 h-72 lg:h-96 w-72 lg:w-96 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="lg:text-2xl text-xl font-bold text-center z-10"
        >
          {titles[currentIndex]}
        </motion.p>
      </AnimatePresence>

      {isUserChoosing ? (
        <>
          {/* Floating flags with waving animation */}
          {locales.map((locale) => (
            <motion.div
              key={`floating-${locale}`}
              className="absolute z-20"
              style={{
                left: `${flagPositions[locale]?.x || 50}%`,
                top: `${flagPositions[locale]?.y || 50}%`,
                transform: `translate(-50%, -50%)`,
                animation: `wave-${locale} 3s ease-in-out infinite`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.1 * locales.indexOf(locale) } }}
            >
              <Link
                href={`/${pathname.split("/")[1]}`}
                locale={locale}
                className="block hover:scale-110 transition-transform duration-200"
                onClick={() => handleUserChoice(locale as Locale)}
                aria-label={`Switch to ${languages[locale as Locale].name}`}
              >
                <div className="flex items-center justify-center cursor-pointer w-16 h-16 md:w-20 md:h-20">
                  {createElement(languages[locale as Locale].icon, {
                    className: "w-full h-full object-contain",
                  })}
                </div>
              </Link>
            </motion.div>
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
        <button
          onClick={() => setIsUserChoosing(true)}
          className="hover:scale-120 transition-transform"
          aria-label={`Open language selector. Current language: ${languages[currentLocale].name}`}
        >
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
        @keyframes wave-ru {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(2deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-2deg) scale(1.05);
          }
        }
      `}</style>
    </section>
  );
}
