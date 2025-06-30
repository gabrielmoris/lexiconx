"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import LexiconxLogo from "@/components/Icons/LexiconxLogo";
import EnglishFlag from "@/components/Icons/EnglishFlag";
import SpanishFlag from "@/components/Icons/SpanishFlag";
import GermanFlag from "@/components/Icons/GermanFlag";
import ChinaFlag from "@/components/Icons/ChinaFlag";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export default function Home() {
  const t = useTranslations("landing");

  return (
    <main className="min-h-screen min-w-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
                      <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <LexiconxLogo className="mx-auto h-32 w-32 text-blue-600 dark:text-blue-400" />
            </motion.div>
            
            <motion.h1
              {...fadeInUp}
              className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl"
            >
              {t("hero.title")}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LexiconX
              </span>
            </motion.h1>
            
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mx-auto mb-10 max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              {t("hero.subtitle")} {t("hero.description")}
            </motion.p>
            
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:items-center"
            >
              <Link
                href="/login"
                className="group relative overflow-hidden rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="relative z-10">{t("hero.start-learning")}</span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              
              <Link
                href="/cards"
                className="rounded-full border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-blue-600 hover:text-blue-600 hover:scale-105 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                {t("hero.explore-features")}
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Language Flags */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-4 sm:left-10 hidden lg:block"
        >
          <EnglishFlag className="h-12 w-12 drop-shadow-lg" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-32 right-4 sm:right-16 hidden lg:block"
        >
          <SpanishFlag className="h-12 w-12 drop-shadow-lg" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 left-4 sm:left-20 hidden lg:block"
        >
          <GermanFlag className="h-12 w-12 drop-shadow-lg" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute bottom-32 right-4 sm:right-10 hidden lg:block"
        >
          <ChinaFlag className="h-12 w-12 drop-shadow-lg" />
        </motion.div>
      </section>

      {/* Features Section */}
                      <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("features.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div
              variants={scaleIn}
              className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 dark:bg-gray-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{t("features.spaced-repetition.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("features.spaced-repetition.description")}
              </p>
            </motion.div>
            
            <motion.div
              variants={scaleIn}
              className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 dark:bg-gray-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{t("features.ai-quizzes.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("features.ai-quizzes.description")}
              </p>
            </motion.div>
            
            <motion.div
              variants={scaleIn}
              className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 dark:bg-gray-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{t("features.fast-progress.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("features.fast-progress.description")}
              </p>
            </motion.div>
            
            <motion.div
              variants={scaleIn}
              className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 dark:bg-gray-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm3 6h4m-4 4h4m-4 4h4" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{t("features.multiple-languages.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("features.multiple-languages.description")}
              </p>
            </motion.div>
            
            <motion.div
              variants={scaleIn}
              className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 dark:bg-gray-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                <svg className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{t("features.progress-tracking.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("features.progress-tracking.description")}
              </p>
            </motion.div>
            
            <motion.div
              variants={scaleIn}
              className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 dark:bg-gray-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{t("features.mobile-friendly.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("features.mobile-friendly.description")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
                      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("cta.subtitle")} {t("cta.description")}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                {t("cta.get-started")}
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
