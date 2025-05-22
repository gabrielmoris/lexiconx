import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

const Header = () => {
  return (
    <header className="sticky bottom-0 lg:top-0 bg-amber-900 dark:bg-blue-900">
      <ThemeSwitcher />
      Header
    </header>
  );
};

export default Header;
