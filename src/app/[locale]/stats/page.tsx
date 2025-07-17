
import { useTranslations } from "next-intl";
import React from "react";

const StatsPage = () => {
    const t = useTranslations("stats");

    return (
        <main className="p-5 w-full md:w-1/2">
            <h1>{t("title")}</h1>
        </main>
    );
};

export default StatsPage;
