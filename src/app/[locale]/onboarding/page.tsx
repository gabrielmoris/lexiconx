"use client";
// import { useLocale } from "next-intl";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import LocaleSwitcher from "@/components/UI/LocaleSwitcher";
import LanguageLearningOnboarding from "@/components/UI/LanguageLearningOnboarding";

export default function OnBoarding() {
  const [step, setStep] = useState(2);
  useAuthGuard();

  return (
    <main className="min-h-[90vh] flex flex-col items-center justify-center">
      {step === 1 && <LocaleSwitcher setNextStep={() => setStep(2)} />}
      {step === 2 && <LanguageLearningOnboarding setNextStep={() => setStep(3)} />}
    </main>
  );
}
