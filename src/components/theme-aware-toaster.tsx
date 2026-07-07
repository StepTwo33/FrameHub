"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ThemeAwareToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const readMode = () =>
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    readMode();
    const observer = new MutationObserver(readMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return <Toaster theme={theme} position="bottom-right" richColors closeButton />;
}
