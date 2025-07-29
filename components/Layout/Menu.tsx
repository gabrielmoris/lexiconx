"use client";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "@/src/i18n/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import AnonIcon from "../Icons/AnonICon";
import HomeIcon from "../Icons/Homeicon";
import CardsIcon from "../Icons/CardsIcon";
import UserIcon from "../Icons/UserIcon";
import LogoutIcon from "../Icons/LogoutIcon";
import LoadingComponent from "./LoadingComponent";
import SettingsIcon from "../Icons/SettingsIcon";
import StatsIcon from "@/components/Icons/StatsIcon";
import { useTranslations } from "next-intl";

const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const { data: session, status } = useSession();
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("menu");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (status === "loading") {
    return <LoadingComponent />;
  }

  return (
    <div className="relative flex flex-col items-center justify-center" ref={menuRef}>
      <nav
        onClick={() => setOpenMenu(!openMenu)}
        className={`absolute h-max flex flex-col min-w-[8rem] py-5 bottom-10 md:top-10
               border border-gray-300 dark:border-gray-600 -right-5
               bg-white dark:bg-theme-fg-dark rounded-md
               shadow-sm shadow-gray-400 dark:shadow-gray-800 z-50
               text-theme-text-light dark:text-theme-text-dark
               transition-all duration-300 ease-in-out
               ${openMenu ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-1/2 pointer-events-none"}
               `}
      >
        <Link
          className="flex flex-row justify-start items-center w-full gap-5 hover:bg-gray-100 
          dark:hover:bg-gray-700 hover:text-theme-text-light dark:hover:text-theme-text-dark 
          px-5 py-2"
          href="/"
        >
          <HomeIcon className="w-4 h-4" /> {t("home")}
        </Link>
        <Link
          className="flex flex-row justify-start items-center w-full gap-5 hover:bg-gray-100 
          dark:hover:bg-gray-700 hover:text-theme-text-light dark:hover:text-theme-text-dark 
          px-5 py-2"
          href="/cards"
        >
          <CardsIcon className="w-4 h-4" /> {t("cards")}
        </Link>
        <Link
          className="flex flex-row justify-start items-center w-full gap-5 hover:bg-gray-100 
          dark:hover:bg-gray-700 hover:text-theme-text-light dark:hover:text-theme-text-dark 
          px-5 py-2"
          href="/settings"
        >
          <SettingsIcon className="w-4 h-4" /> {t("settings")}
        </Link>
        <Link
          className="flex flex-row justify-start items-center w-full gap-5 hover:bg-gray-100
          dark:hover:bg-gray-700 hover:text-theme-text-light dark:hover:text-theme-text-dark
          px-5 py-2"
          href="/stats"
        >
          <StatsIcon className="w-4 h-4" /> {t("stats")}
        </Link>
        {session?.user?.image ? (
          <p
            className="flex flex-row cursor-pointer justify-start items-center w-full gap-5 
            hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-text-light 
            dark:hover:text-theme-text-dark px-5 py-2"
            onClick={() => signOut()}
          >
            <LogoutIcon className="w-4 h-4" /> {t("logout")}
          </p>
        ) : (
          <Link
            className="flex flex-row cursor-pointer justify-start items-center w-full gap-5 
            hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-text-light 
            dark:hover:text-theme-text-dark px-5 py-2"
            href="/login"
          >
            <UserIcon className="w-4 h-4" /> {t("login")}
          </Link>
        )}
      </nav>
      {session?.user?.image ? (
        <Image
          width={50}
          height={50}
          onClick={() => setOpenMenu(!openMenu)}
          src={session?.user?.image}
          alt={session?.user?.name || "user-icn"}
          className="w-[50px] h-[50px] rounded-full cursor-pointer"
          priority
        />
      ) : (
        <AnonIcon
          className="w-[50px] h-[50px] p-1 rounded-full cursor-pointer border border-gray-300 dark:border-gray-600"
          onClick={() => setOpenMenu(!openMenu)}
        />
      )}
    </div>
  );
};

export default Menu;
