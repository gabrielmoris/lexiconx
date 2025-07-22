"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("title")}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t("lastUpdated")}</p>
      </motion.div>

      <div className="space-y-8">
        {/* Introduction */}
        <motion.section {...fadeInUp} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("intro.title")}</h2>
          <p className="mb-4">{t("intro.description")}</p>
          <p className="text-sm">{t("intro.contact")}</p>
        </motion.section>

        {/* Data Collection */}
        <motion.section {...fadeInUp} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("dataCollection.title")}</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>{t("dataCollection.google")}</li>
            <li>{t("dataCollection.profile")}</li>
            <li>{t("dataCollection.language")}</li>
            <li>{t("dataCollection.progress")}</li>
            <li>{t("dataCollection.usage")}</li>
          </ul>
        </motion.section>

        {/* Data Usage */}
        <motion.section {...fadeInUp} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("dataUsage.title")}</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>{t("dataUsage.personalization")}</li>
            <li>{t("dataUsage.progress")}</li>
            <li>{t("dataUsage.improvement")}</li>
            <li>{t("dataUsage.legal")}</li>
          </ul>
        </motion.section>

        {/* Third-Party Services */}
        <motion.section {...fadeInUp} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("thirdParty.title")}</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>{t("thirdParty.google")}</li>
            <li>{t("thirdParty.mongodb")}</li>
            <li>{t("thirdParty.gemini")}</li>
          </ul>
        </motion.section>

        {/* User Rights (GDPR) */}
        <motion.section {...fadeInUp} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("userRights.title")}</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>{t("userRights.access")}</li>
            <li>{t("userRights.rectification")}</li>
            <li>{t("userRights.erasure")}</li>
            <li>{t("userRights.portability")}</li>
            <li>{t("userRights.withdraw")}</li>
          </ul>
          <p className="mt-4 text-sm">{t("userRights.contact")}</p>
        </motion.section>

        {/* Data Security */}
        <motion.section {...fadeInUp} transition={{ delay: 0.6 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("security.title")}</h2>
          <p className="mb-4">{t("security.measures")}</p>
          <ul className="list-disc pl-6 space-y-3">
            <li>{t("security.encryption")}</li>
            <li>{t("security.access")}</li>
            <li>{t("security.monitoring")}</li>
          </ul>
        </motion.section>

        {/* Data Retention */}
        <motion.section {...fadeInUp} transition={{ delay: 0.7 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("retention.title")}</h2>
          <p>{t("retention.period")}</p>
          <p className="mt-4">{t("retention.deletion")}</p>
        </motion.section>

        {/* Children's Privacy */}
        <motion.section {...fadeInUp} transition={{ delay: 0.8 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("children.title")}</h2>
          <p>{t("children.policy")}</p>
        </motion.section>

        {/* Changes to Privacy Policy */}
        <motion.section {...fadeInUp} transition={{ delay: 0.9 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("changes.title")}</h2>
          <p>{t("changes.notification")}</p>
        </motion.section>

        {/* Contact Information */}
        <motion.section {...fadeInUp} transition={{ delay: 1.0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t("contact.title")}</h2>
          <p>{t("contact.info")}</p>
          <p className="mt-4">{t("contact.dpo")}</p>
        </motion.section>

        {/* Footer */}
        <motion.footer {...fadeInUp} transition={{ delay: 1.1 }} className="text-sm text-gray-500 dark:text-gray-400 text-center mt-12">
          <p>{t("effectiveDate")}</p>
        </motion.footer>
      </div>
    </main>
  );
}
