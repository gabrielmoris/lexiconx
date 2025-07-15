import React from "react";

import Menu from "./Menu";
import LexiconxLogo from "../Icons/LexiconxLogo";

const Header = () => {
  return (
    <header
      className="fixed md:sticky w-screen flex flex-row py-2 px-10 items-center justify-between
        bottom-0 lg:top-0
        bg-gray-100/50 dark:bg-gray-900/20
        shadow-sm dark:shadow-theme-fg-dark
        backdrop-blur-lg
        z-30"
    >
      <LexiconxLogo className="size-10" />
      <Menu />
    </header>
  );
};

export default Header;
