"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import LocaleSwitcher from "@/components/Onboarding/LocaleSwitcher";
import LanguageLearningOnboarding from "@/components/Onboarding/LanguageLearningOnboarding";
import AddFirstCards from "@/components/Onboarding/AddFirstCards";
import LoadingComponent from "@/components/Layout/LoadingComponen";
import OnboardingText from "@/components/Onboarding/OnboardingText";
import { useTranslations } from "next-intl";

export default function OnBoarding() {
  const { storedValue: step, setValue: setStep, isHydrated } = useLocalStorage("onboardingStep", 1);
  const t = useTranslations("onboarding");

  useAuthGuard();

  if (!isHydrated) {
    return <LoadingComponent />;
  }

  const setNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  return (
    <main className="min-h-[90vh] flex flex-col items-center justify-center w-full">
      {step === 1 && <LocaleSwitcher setNextStep={setNextStep} />}
      {step === 2 && <OnboardingText title={t("second-step-title")} text={t("second-step-text")} setNextStep={setNextStep} />}
      {step === 3 && <LanguageLearningOnboarding setNextStep={setNextStep} />}
      {step === 4 && <OnboardingText title={t("forth-step-title")} text={t("forth-step-text")} setNextStep={setNextStep} />}
      {step === 5 && <AddFirstCards />}
    </main>
  );
}
