"use client";
// import { useLocale } from "next-intl";
// import { useState } from "react";
// import { useAuthGuard } from "@/hooks/useAuthGuard";
import LocaleSwitcher from "@/components/UI/LocaleSwitcher";

export default function OnBoarding() {
  // const [step, setStep] = useState(1);
  // const { session, status, isLoading } = useAuthGuard();

  return (
    <main className="min-h-[90vh] flex flex-col items-center justify-center">
      <LocaleSwitcher />
    </main>
  );
}
