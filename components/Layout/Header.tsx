import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

import Menu from "./Menu";

const Header = () => {
  return (
    <header
      className="fixed md:sticky w-screen flex flex-row py-2 px-5 items-center justify-between
        bottom-0 lg:top-0
        bg-gray-100/50 dark:bg-gray-900/20
        shadow-sm dark:shadow-theme-fg-dark
        backdrop-blur-lg
        z-30"
    >
      <ThemeSwitcher />
      <Menu />
    </header>
  );
};

export default Header;
