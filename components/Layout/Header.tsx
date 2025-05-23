"use client";
import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Header = () => {
  const { data: session, status } = useSession();

  return (
    <header className="fixed md:sticky w-full flex flex-row py-2 px-5 items-center justify-between bottom-0 lg:top-0 bg-amber-700 dark:bg-blue-900">
      <ThemeSwitcher />
      {status === "authenticated" && session.user?.image && (
        <Image
          width={50}
          height={50}
          src={session.user.image}
          alt={session.user?.name || "User Avatar"}
          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
        />
      )}
    </header>
  );
};

export default Header;
