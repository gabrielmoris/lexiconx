"use client"
// import { useLocale } from "next-intl";
import { useState} from "react";
import {useAuthGuard} from "@/hooks/useAuthGuard";

export default function OnBoarding() {
  const [step, setStep] = useState(1);
 const { session, status, isLoading } = useAuthGuard()

  return <main className="min-h-screen flex flex-col items-center justify-center">onboarding</main>;
}
