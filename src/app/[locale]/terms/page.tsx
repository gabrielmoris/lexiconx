"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6  ">{t("title")}</h1>
      </motion.div>

      <div className="space-y-8">
        {/* Introduction */}
        <motion.section {...fadeInUp} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4  ">{t("section1.title")}</h2>
          <p className="">{t("section1.content")}</p>
        </motion.section>

        {/* Service Description */}
        <motion.section {...fadeInUp} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4  ">{t("section2.title")}</h2>
          <p className=" mb-4">{t("section2.content")}</p>
          <ul className="list-disc pl-6  space-y-2">
            <li>{t("section2.features.quiz")}</li>
            <li>{t("section2.features.progress")}</li>
            <li>{t("section2.features.spaced")}</li>
            <li>{t("section2.features.languages")}</li>
          </ul>
        </motion.section>

        {/* User Obligations */}
        <motion.section {...fadeInUp} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4  ">{t("section3.title")}</h2>
          <p className=" mb-4">{t("section3.content")}</p>
        </motion.section>

        {/* Data Protection */}
        <motion.section {...fadeInUp} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4  ">{t("section4.title")}</h2>
          <p className=" mb-4">{t("section4.content")}</p>
          <ul className="list-disc pl-6  space-y-2">
            <li>{t("section4.data.google")}</li>
            <li>{t("section4.data.progress")}</li>
            <li>{t("section4.data.words")}</li>
            <li>{t("section4.data.usage")}</li>
          </ul>
        </motion.section>

        {/* Cancellation and Termination */}
        <motion.section {...fadeInUp} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4  ">{t("section5.title")}</h2>
          <p className="">{t("section5.content")}</p>
        </motion.section>

        {/* Legal Information */}
        <motion.section {...fadeInUp} transition={{ delay: 0.6 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4  ">{t("section6.title")}</h2>
          <p className="">{t("section6.content")}</p>
        </motion.section>

        {/* Footer */}
        <motion.footer {...fadeInUp} transition={{ delay: 0.7 }} className="text-sm text-gray-500 dark:text-gray-400 text-center mt-12">
          <p>{t("lastUpdated")}</p>
        </motion.footer>
      </div>
    </main>
  );
}
