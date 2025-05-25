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
      {openMenu && (
        <nav className="absolute top-10 md:bottom-10 right-5" onClick={() => setOpenMenu(!openMenu)}>
          <Link href="/">Home</Link>
          <Link href="/cards">Home</Link>
        </nav>
      )}

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
