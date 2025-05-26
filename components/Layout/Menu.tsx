"use client";
import { Link } from "@/src/i18n/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";

const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  return (
    <div className="relative">
      <nav
        className={`absolute h-max flex flex-col py-5 bottom-10 md:top-10 
                   border border-gray-300 dark:border-gray-600 right-5
                   bg-white dark:bg-theme-fg-dark rounded-md 
                   shadow-sm shadow-gray-400 dark:shadow-gray-800 z-50
                   text-theme-text-light dark:text-theme-text-dark
                   transition-all duration-300 ease-in-out
                   ${openMenu ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
                   `}
        onClick={() => setOpenMenu(!openMenu)}
      >
        <Link className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-text-light dark:hover:text-theme-text-dark px-10 py-2" href="/">
          Home
        </Link>
        <Link
          className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-text-light dark:hover:text-theme-text-dark px-10 py-2"
          href="/cards"
        >
          Cards
        </Link>
      </nav>
      <Image
        width={50}
        height={50}
        onClick={() => setOpenMenu(!openMenu)}
        src={session?.user?.image || "/icons/anon-icn.svg"}
        alt={session?.user?.name || "User Avatar"}
        className="w-[50px] h-[50px] rounded-full cursor-pointer"
      />
    </div>
  );
};

export default Menu;
