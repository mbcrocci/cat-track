import { useRouter } from "@tanstack/react-router";
import { createContext, type PropsWithChildren, useEffect, use, useState } from "react";
import { setThemeServerFn, type T as Theme } from "@/server/theme";

export function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type ResolvedTheme = "light" | "dark";
type ThemeContextVal = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (val: Theme) => void;
};
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter();
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === "system" ? resolveSystemTheme() : theme,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const applied = resolveSystemTheme();
      setResolvedTheme(applied);
      root.className = applied;
      const m = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => {
        const next = resolveSystemTheme();
        setResolvedTheme(next);
        root.className = next;
      };
      m.addEventListener("change", listener);
      return () => m.removeEventListener("change", listener);
    }
    setResolvedTheme(theme);
    root.className = theme;
  }, [theme]);

  function setTheme(val: Theme) {
    setThemeServerFn({ data: val }).then(() => router.invalidate());
  }

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext>
  );
}

export function useTheme() {
  const val = use(ThemeContext);
  if (!val) throw new Error("useTheme called outside of ThemeProvider!");
  return val;
}
