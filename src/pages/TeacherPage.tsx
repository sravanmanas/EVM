import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Unlock, Users, LogOut, AlertCircle, ShieldCheck, Vote, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { loadAllElections, loadElectionById, savePollingElectionId, loadPollingElectionId, clearPollingElectionId } from "@/lib/storage";
import { Election } from "@/types";
import PinPad from "@/components/features/PinPad";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "@/components/features/ThemeToggle";

type AuthStep = "login" | "dashboard";

export default function TeacherPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [authStep, setAuthStep] = useState<AuthStep>("login");
  const [electionInput, setElectionInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [election, setElection] = useState<Election | null>(null);
  const [pinMode, setPinMode] = useState<"idle" | "unlock">("idle");

  useEffect(() => {
    const savedId = loadPollingElectionId();
    if (savedId) {
      const e = loadElectionById(savedId);
      if (e && e.status === "active") { setElection(e); setAuthStep("dashboard"); }
      else clearPollingElectionId();
    }
  }, []);

  const refreshElection = useCallback(() => {
    const id = loadPollingElectionId();
    if (!id) return;
    const e = loadElectionById(id);
    if (e) setElection(e);
  }, []);

  useEffect(() => {
    if (authStep !== "dashboard") return;
    const interval = setInterval(refreshElection, 2000);
    return () => clearInterval(interval);
  }, [authStep, refreshElection]);

  function handleLogin(ev: React.FormEvent) {
    ev.preventDefault();
    setAuthError("");
    const elId = electionInput.trim().toUpperCase();
    if (!elId) { setAuthError("Enter an Election ID."); return; }
    setAuthLoading(true);
    setTimeout(() => {
      const matched = loadAllElections().find((e) => e.id === elId);
      if (!matched) { setAuthError("No election found with that ID."); setAuthLoading(false); return; }
      if (matched.status === "setup") { setAuthError("This election hasn't been activated yet."); setAuthLoading(false); return; }
      if (matched.status === "ended") { setAuthError("This election has already ended."); setAuthLoading(false); return; }
      setElection(matched); setAuthLoading(false); setShowPin(true);
    }, 400);
  }

  function handlePinForLogin(pin: string) {
    if (!election) return;
    if (pin === election.controlPassword) {
      savePollingElectionId(election.id); setAuthStep("dashboard"); setShowPin(false);
      toast.success(`Logged in to: ${election.title}`);
    } else { toast.error("Incorrect PIN. Try again."); setElection(null); setShowPin(false); }
  }

  function onPinEntered(pin: string) {
    if (!election) return;
    if (pin === election.controlPassword) {
      setPinMode("idle"); toast.success("EVM Unlocked — Hand the device to the student."); navigate("/evm");
    } else { toast.error("Incorrect PIN. Try again."); }
  }

  function handleLogout() {
    clearPollingElectionId(); setElection(null); setAuthStep("login");
    setElectionInput(""); setShowPin(false); setAuthError("");
  }

  const field = "bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full transition-colors";

  if (authStep === "login") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"><Vote className="text-primary-foreground" size={20} /></div>
            <div><h1 className="text-lg font-heading font-bold text-foreground">EVM SYSTEM</h1><p className="text-xs text-muted-foreground">Polling Officer Portal</p></div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-6 animate-slide-up">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center mx-auto mb-5 evm-glow">
                <ShieldCheck className="text-primary" size={40} />
              </div>
              <h2 className="text-4xl font-heading font-bold text-foreground">POLLING OFFICER</h2>
              <p className="text-muted-foreground text-sm mt-2">Enter your Election ID and Control PIN</p>
            </div>
            {!showPin ? (
              <form onSubmit={handleLogin} className="evm-border bg-card rounded-2xl p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Election ID</label>
                  <input className={`${field} font-mono text-center tracking-widest uppercase`} placeholder="e.g. A1B2C3D4" value={electionInput} onChange={(e) => { setElectionInput(e.target.value.toUpperCase()); setAuthError(""); }} autoFocus autoComplete="off" />
                  <p className="text-muted-foreground text-xs mt-1">Provided by the Election Officer for your class</p>
                </div>
                {authError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2 text-destructive text-sm">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /><span>{authError}</span>
                  </div>
                )}
                <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {authLoading ? <span className="inline-block w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "FIND ELECTION →"}
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-slide-up">
                <div className="evm-border bg-card rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Election Found</p>
                  <h3 className="font-heading font-bold text-xl text-primary">{election?.title}</h3>
                  {election?.description && <p className="text-muted-foreground text-sm mt-1">{election.description}</p>}
                </div>
                <PinPad onSubmit={handlePinForLogin} onCancel={() => { setShowPin(false); setElection(null); setElectionInput(""); }} label="Enter EVM Control PIN to authenticate" />
              </div>
            )}
            <button onClick={() => navigate("/")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center evm-border rounded-2xl p-10 bg-card max-w-sm w-full">
          <AlertCircle className="text-yellow-400 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-heading font-bold mb-2">Election Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">Could not load your election data.</p>
          <button onClick={handleLogout} className="px-6 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-semibold">Log Out</button>
        </div>
      </div>
    );
  }

  if (election.status === "ended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center evm-border rounded-2xl p-10 bg-card max-w-sm w-full">
          <div className="text-5xl mb-4">🏁</div>
          <h2 className="text-2xl font-heading font-bold mb-2">Election Ended</h2>
          <p className="text-muted-foreground text-sm mb-6">The Election Officer has closed this election.</p>
          <button onClick={handleLogout} className="px-6 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-semibold">Log Out</button>
        </div>
      </div>
    );
  }

  const totalVoted = election.votedStudentIds.length;
  const total = election.studentIds.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold text-primary">POLLING OFFICER</h1><p className="text-xs text-muted-foreground">{election.title}</p></div>
        <div className="flex items-center gap-2">
          <button onClick={refreshElection} className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors" title="Refresh"><RefreshCw size={16} /></button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-border transition-colors"><LogOut size={16} /> Exit</button>
        </div>
      </div>
      <div className="max-w-sm mx-auto px-6 py-10 space-y-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-semibold">Election ID: {election.id}</span>
        </div>
        <div className="evm-border bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Users size={16} /> Voting Progress</span>
            <span className="text-primary font-bold text-sm">{totalVoted}/{total}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (totalVoted / total) * 100 : 0}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">{total - totalVoted} students pending</p>
        </div>
        <div className="evm-border bg-card rounded-2xl p-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-900/30 border-2 border-red-500/40 animate-lock-pulse">
            <Lock className="text-red-400" size={36} />
          </div>
          <h2 className="text-xl font-heading font-bold mb-1">EVM LOCKED</h2>
          <p className="text-muted-foreground text-sm">Enter PIN to unlock for next voter</p>
        </div>
        <div className="animate-slide-up">
          {pinMode === "idle" ? (
            <button onClick={() => setPinMode("unlock")} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3 evm-glow">
              <Unlock size={22} /> ENTER PIN TO UNLOCK
            </button>
          ) : (
            <PinPad onSubmit={onPinEntered} onCancel={() => setPinMode("idle")} label="Enter 4-Digit Control PIN" />
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground px-4">After each vote, the device automatically locks. Re-enter the PIN for each new student.</p>
      </div>
    </div>
  );
}