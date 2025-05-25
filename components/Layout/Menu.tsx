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
        className={`absolute h-max flex flex-col py-5 bottom-10 md:top-10  right-5
                     bg-theme-fg-light dark:bg-theme-fg-dark rounded-md shadow-lg z-50
                     text-theme-text-dark dark:text-theme-text-light
                     transition-all duration-300 ease-in-out
                     ${openMenu ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
                     `}
        onClick={() => setOpenMenu(!openMenu)}
      >
        <Link className="hover:bg-theme-fg-dark dark:hover:bg-theme-fg-light hover:text-theme-text-dark dark:text-theme-text-light px-5" href="/">
          Home
        </Link>
        <Link
          className="hover:bg-theme-fg-dark dark:hover:bg-theme-fg-light hover:text-theme-text-dark dark:text-theme-text-light px-5"
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
        style={{ width: "50px", height: "50px", borderRadius: "50%" }}
      />
    </div>
  );
};

export default Menu;
