
import { useTranslations } from "next-intl";
import React from "react";
import {useAuthGuard} from "@/hooks/useAuthGuard";

const StatsPage = () => {
   // const t = useTranslations("stats");
   const {userData}=useAuthGuard()
console.log(userData)

    return (
        <main className="p-5 w-full md:w-1/2">
            {/*<h1>{t("title")}</h1>*/}

        </main>
    );
};

export default StatsPage;
