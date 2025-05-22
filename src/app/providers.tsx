"use client";

import { ThemeProvider, ThemeProviderProps } from "next-themes";
import { useEffect, useState } from "react";

interface Props extends ThemeProviderProps {
  locale: string;
}

export function NextThemesProvider({ children, locale, ...props }: Props) {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render the ThemeProvider and its children once mounted on the client
  // This prevents the hydration mismatch by not applying the theme on the server.
  if (!mounted) {
    return (
      <html lang={locale} suppressHydrationWarning>
        <body>{children}</body>
      </html>
    );
  }

  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
