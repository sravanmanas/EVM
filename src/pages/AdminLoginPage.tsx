import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Vote } from "lucide-react";
import { toast } from "sonner";
import { loadAdminCredentials, saveRole } from "@/lib/storage";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "@/components/features/ThemeToggle";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const creds = loadAdminCredentials();
      if (adminId.trim() === creds.adminId && password === creds.password) {
        saveRole("officer");
        toast.success("Welcome, Election Officer!");
        navigate("/officer");
      } else {
        setError("Invalid Admin ID or Password. Please try again.");
        setLoading(false);
      }
    }, 400);
  }

  const field = "bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"><Vote className="text-primary-foreground" size={20} /></div>
          <div><h1 className="text-lg font-heading font-bold text-foreground tracking-wide">EVM SYSTEM</h1><p className="text-xs text-muted-foreground">Admin Portal</p></div>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-slide-up">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center mx-auto mb-5 evm-glow">
              <ShieldCheck className="text-primary" size={40} />
            </div>
            <h2 className="text-4xl font-heading font-bold text-foreground">ADMIN LOGIN</h2>
            <p className="text-muted-foreground text-sm mt-2">Election Officer access only</p>
          </div>
          <form onSubmit={handleLogin} className="evm-border bg-card rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Admin ID</label>
              <input className={field} placeholder="Enter admin ID" value={adminId} onChange={(e) => { setAdminId(e.target.value); setError(""); }} autoFocus autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input className={`${field} pr-12`} type={showPass ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="inline-block w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "LOGIN →"}
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Default: ID <span className="font-mono font-bold text-foreground">admin</span> · Password <span className="font-mono font-bold text-foreground">0000</span>
          </p>
        </div>
      </div>
    </div>
  );
}