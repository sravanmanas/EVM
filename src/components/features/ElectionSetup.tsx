import { useState } from "react";
import { Vote } from "lucide-react";

interface Props {
  onCreate: (title: string, description: string, password: string) => void;
}

export default function ElectionSetup({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Election title is required";
    if (!password.trim() || password.length !== 4 || !/^\d{4}$/.test(password)) e.password = "PIN must be exactly 4 digits";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onCreate(title.trim(), description.trim(), password);
  }

  const field = "bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full";

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
          <Vote className="text-primary" size={32} />
        </div>
        <h2 className="text-3xl font-heading font-bold text-foreground">Create New Election</h2>
        <p className="text-muted-foreground mt-2 text-sm">Set up the election details and control PIN</p>
      </div>
      <form onSubmit={handleSubmit} className="evm-border bg-card rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Election Title *</label>
          <input className={field} placeholder="e.g. Student Council Election 2025" value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
          <textarea className={`${field} h-20 resize-none`} placeholder="Brief description of the election..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">EVM Control PIN (4 digits) *</label>
          <input className={`${field} font-mono text-lg tracking-widest max-w-[160px]`} type="password" maxLength={4} placeholder="••••"
            value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
          <p className="text-muted-foreground text-xs mt-1">Teacher will use this PIN to unlock each voting session</p>
          {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
        </div>
        <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity">
          Create Election →
        </button>
      </form>
    </div>
  );
}