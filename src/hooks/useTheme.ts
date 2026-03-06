import { useState, useEffect } from "react";
import { loadTheme, saveTheme } from "@/lib/storage";

export function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">(loadTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
    saveTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}