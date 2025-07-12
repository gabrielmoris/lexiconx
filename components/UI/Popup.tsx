import { useTranslations } from "next-intl";
import React from "react";
import Button from "./Button";

interface Props {
  handleClose: () => void;
  handleAccept: () => void;
  message: string;
}

const Popup = ({ handleClose, handleAccept, message }: Props) => {
  const t = useTranslations("popup");
  return (
    <main
      className="shadow-sm dark:shadow-theme-fg-dark
        backdrop-blur-2xl z-29 fixed top-0 left-0 w-screen
        h-screen overflow-y-hidden"
    >
      <section
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 md:w-1/2  transform  bg-theme-bg-light dark:bg-theme-bg-dark md:border rounded-lg 
            md:shadow-sm border-gray-300 dark:border-gray-700 px-10 py-5"
      >
        <p className="mb-10 font ">{message}</p>

        <div className="flex flex-row gap-5">
          <Button type="button" onClick={handleClose} variant="secondary" className="mb-5">
            {t("close-popup")}
          </Button>

          <Button type="button" onClick={handleAccept} variant="primary" className="mb-5">
            {t("accept-popup")}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Popup;
