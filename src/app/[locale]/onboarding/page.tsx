"use client";
// import { useLocale } from "next-intl";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import LocaleSwitcher from "@/components/Onboarding/LocaleSwitcher";
import LanguageLearningOnboarding from "@/components/Onboarding/LanguageLearningOnboarding";
import AddFirstCards from "@/components/Onboarding/AddFirstCards";

export default function OnBoarding() {
  const [step, setStep] = useState(1);
  useAuthGuard();

  return (
    <main className="min-h-[90vh] flex flex-col items-center justify-center w-full">
      {step === 1 && <LocaleSwitcher setNextStep={() => setStep(2)} />}
      {step === 2 && <LanguageLearningOnboarding setNextStep={() => setStep(3)} />}
      {step === 3 && <AddFirstCards />}
    </main>
  );
}
