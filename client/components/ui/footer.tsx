"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, ArrowUp } from "lucide-react";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted border-border p-1 bg-background/50 backdrop-blur-sm">
        <button
          onClick={() => setTheme("light")}
          className="bg-fl-dark mr-3 rounded-full p-2 text-white hover:opacity-80 transition-opacity"
        >
          <Sun className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Light Mode</span>
        </button>

        <button type="button" onClick={handleScrollTop} className="hover:opacity-70 transition-opacity">
          <ArrowUp className="h-4 w-4" strokeWidth={2} />
          <span className="sr-only">Top</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className="bg-fl-dark ml-3 rounded-full p-2 text-white hover:opacity-80 transition-opacity"
        >
          <Moon className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Dark Mode</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
