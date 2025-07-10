"use client";
import { useTranslations } from "next-intl";
import { createElement, useState, useEffect } from "react";
import { LanguageOption, useLanguage } from "@/context/LanguageToLearnContext";
import LoadingComponent from "../Layout/LoadingComponen";
import { selectUserLearningLanguage } from "@/lib/apis";
import { useSession } from "next-auth/react";

export default function LanguageLearningOnboarding({ setNextStep }: { setNextStep: () => void }) {
  const [isUserChoosing, setIsUserChoosing] = useState(true);
  const [flagPositions, setFlagPositions] = useState<{ [key: string]: { x: number; y: number; rotation: number } }>({});
  const [isLoading, setIsLoading] = useState(true);

  const t = useTranslations("languageToLearn");
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();

  const { data: session, status } = useSession();

  // Initialize static positions for flags when user starts choosing
  useEffect(() => {
    if (isUserChoosing) {
      const positions: { [key: string]: { x: number; y: number; rotation: number } } = {};
      const flagCount = languages.length;

      languages.forEach((lang, index) => {
        // Distribute flags evenly across screen
        const angle = (index / flagCount) * 2 * Math.PI;
        const radius = 25;
        const centerX = 50;
        const centerY = 50;

        positions[lang.language] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          rotation: 0,
        };
      });
      setFlagPositions(positions);
      setIsLoading(false);
    }
  }, [isUserChoosing, languages]);

  const handleUserChoice = async (language: LanguageOption) => {
    setIsUserChoosing(false);
    setSelectedLanguage(language);
    if (!session || status !== "authenticated") throw new Error("Session not found");
    await selectUserLearningLanguage(session, language.language);
    setNextStep();
  };

  if (isLoading) return <LoadingComponent />;

  return (
    <section className="relative flex flex-col items-center justify-start gap-10 h-72 lg:h-96  w-72 lg:w-96 overflow-hidden">
      <p className="lg:text-2xl text-xl font-bold text-center z-10">{t("title")}</p>

      {isUserChoosing ? (
        <>
          {/* Floating flags with waving animation  IS ALSO IN LocaleSwitcher !!!! FOLLOW DRY!!*/}
          {languages.map((lang) => (
            <div
              key={`floating-tolearn-${lang.language}`}
              className="absolute z-20 animate-pulse"
              style={{
                left: `${flagPositions[lang.language]?.x || 50}%`,
                top: `${flagPositions[lang.language]?.y || 50}%`,
                transform: `translate(-50%, -50%)`,
                animation: `wave-${lang.language} 3s ease-in-out infinite`,
              }}
            >
              <div className="block hover:scale-110 transition-transform duration-200">
                <div onClick={() => handleUserChoice(lang)} className="flex items-center justify-center cursor-pointer w-16 h-16 md:w-20 md:h-20">
                  {createElement(lang.icon, { className: "w-full h-full object-contain" })}
                </div>
              </div>
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
            {createElement(selectedLanguage.icon, {
              className: "w-full h-full object-contain",
            })}
          </div>
        </button>
      )}

      {/* CSS animations for flag waving */}
      <style jsx>{`
        @keyframes wave-English {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-2deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(2deg) scale(1.05);
          }
        }
        @keyframes wave-Deutsch {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(1deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-3deg) scale(1.05);
          }
        }
        @keyframes wave-中文 {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(2deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-1deg) scale(1.05);
          }
        }
        @keyframes wave-Español {
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
