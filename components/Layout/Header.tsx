import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

import Menu from "./Menu";

const Header = () => {
  return (
    <header className="fixed md:sticky w-full flex flex-row py-2 px-5 items-center justify-between bottom-0 lg:top-0 bg-transparent backfrop-blur-50 shadow-sm shadow-theme-fg-light dark:shadow-fg-dark">
      <ThemeSwitcher />
      <Menu />
    </header>
  );
};

export default Header;
