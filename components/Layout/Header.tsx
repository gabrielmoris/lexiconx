import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

import Menu from "./Menu";

const Header = () => {
  return (
    <header className="fixed md:sticky w-full flex flex-row py-2 px-5 items-center justify-between bottom-0 lg:top-0 bg-amber-700 dark:bg-blue-900">
      <ThemeSwitcher />
      <Menu />
    </header>
  );
};

export default Header;
