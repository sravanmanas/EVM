import { useState } from "react";
import { Delete, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  label: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PinPad({ onSubmit, onCancel, label }: Props) {
  const [pin, setPin] = useState("");

  function press(k: string) {
    if (k === "⌫") {
      setPin((p) => p.slice(0, -1));
    } else if (k !== "" && pin.length < 4) {
      const next = pin + k;
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => onSubmit(next), 120);
      }
    }
  }

  return (
    <div className="evm-border bg-card rounded-2xl p-6 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex justify-center gap-4 py-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("w-5 h-5 rounded-full border-2 transition-all", i < pin.length ? "bg-primary border-primary scale-110" : "border-muted-foreground/40")} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((k, i) => (
          <button
            key={i}
            onClick={() => press(k)}
            disabled={k === ""}
            className={cn(
              "h-14 rounded-xl text-xl font-bold transition-all active:scale-90 pin-btn",
              k === "" ? "invisible" :
              k === "⌫" ? "bg-secondary text-muted-foreground hover:bg-border hover:text-foreground" :
              "bg-secondary text-foreground hover:bg-border"
            )}
          >
            {k === "⌫" ? <Delete size={20} className="mx-auto" /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}