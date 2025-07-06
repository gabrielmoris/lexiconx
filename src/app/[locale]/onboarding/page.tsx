// import { useLocale } from "next-intl";

import {requireAuthSSR} from "@/lib/auth/authGuardServerPages";

export default async function OnBoarding() {
  //   const locale = useLocale();
   await requireAuthSSR();

  return <main className="min-h-screen flex flex-col items-center justify-center">onboarding</main>;
}
