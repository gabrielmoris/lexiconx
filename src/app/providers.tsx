"use client";

import { ThemeProvider, ThemeProviderProps } from "next-themes";

interface Props extends ThemeProviderProps {
  locale?: string;
}

export function NextThemesProvider({ children, ...props }: Props) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
