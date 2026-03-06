import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, GraduationCap, Users, Vote } from "lucide-react";
import { saveRole, loadTheme } from "@/lib/storage";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "@/components/features/ThemeToggle";

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const saved = loadTheme();
    if (saved === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Vote className="text-primary-foreground" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground tracking-wide">EVM SYSTEM</h1>
            <p className="text-xs text-muted-foreground">Electronic Voting Machine</p>
          </div>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-16 px-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6 evm-glow">
          <Vote className="text-primary" size={48} />
        </div>
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2 tracking-wide">
          MOBILE <span className="text-primary">EVM</span> VOTING
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-base">
          Secure, fair, and private electronic voting for school & college elections.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-6">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold">Select Your Role</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button onClick={() => navigate("/admin-login")}
            className="group evm-border rounded-2xl p-8 text-left hover:evm-glow transition-all duration-200 bg-card hover:bg-secondary/60 animate-slide-up">
            <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
              <ShieldCheck className="text-primary" size={28} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-1">Election Officer</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Create elections, add candidates, upload student IDs, and view final results.</p>
            <div className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold">
              <span>Admin Login Required</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
          <button onClick={() => { saveRole("teacher"); navigate("/teacher"); }}
            className="group evm-border rounded-2xl p-8 text-left hover:evm-glow transition-all duration-200 bg-card hover:bg-secondary/60 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
              <GraduationCap className="text-primary" size={28} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-1">Polling Officer</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Manage the EVM session, unlock voting for each student, and maintain privacy.</p>
            <div className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold">
              <span>Enter Polling Panel</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-center">
          {[
            { icon: <ShieldCheck size={16} />, label: "Anonymous Votes" },
            { icon: <Users size={16} />, label: "One Vote Per Student" },
            { icon: <Vote size={16} />, label: "PIN-Locked EVM Mode" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="text-primary">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}