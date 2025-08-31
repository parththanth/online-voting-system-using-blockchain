
import React from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  React.useEffect(() => {
    // Minimal theming without next-themes to avoid runtime errors
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = defaultTheme === 'system' ? (prefersDark ? 'dark' : 'light') : defaultTheme;
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [defaultTheme]);

  return <>{children}</>;
}

