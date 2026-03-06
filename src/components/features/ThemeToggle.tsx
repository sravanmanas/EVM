import { Sun, Moon } from "lucide-react";

interface Props {
  theme: "dark" | "light";
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}