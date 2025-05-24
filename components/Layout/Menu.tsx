import { Link } from "@/src/i18n/navigation";
import React from "react";

const Menu = () => {
  return (
    <nav className="absolute bottom-0 md:top-0">
      <Link href="/">Home</Link>
      <Link href="/cards">Home</Link>
    </nav>
  );
};

export default Menu;
