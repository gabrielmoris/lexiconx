"use client";
import Example from "@/components/Example";
// import { useTranslations } from "next-intl";

export default function Home() {
  // const t = useTranslations("landingpage");

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-4">
      <Example />
    </main>
  );
}
