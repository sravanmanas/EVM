import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Lock, AlertCircle, ChevronRight } from "lucide-react";
import { loadElectionById, loadPollingElectionId, loadElection, saveElection } from "@/lib/storage";
import { Election, Candidate } from "@/types";

type EVMStep = "auth" | "vote" | "confirm" | "success" | "locked";

function CandidateSymbol({ symbol, size = "md" }: { symbol: string; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "w-24 h-24 text-6xl" : "w-16 h-16 text-4xl";
  if (symbol.startsWith("data:") || symbol.startsWith("http")) {
    return <div className={`${dim} rounded-xl overflow-hidden border border-border bg-secondary flex-shrink-0`}><img src={symbol} alt="symbol" className="w-full h-full object-cover" /></div>;
  }
  return <div className={`${dim} rounded-xl bg-secondary flex items-center justify-center border border-border flex-shrink-0`}>{symbol}</div>;
}

export default function EVMPage() {
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [step, setStep] = useState<EVMStep>("auth");
  const [studentId, setStudentId] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [authError, setAuthError] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");

  useEffect(() => {
    const pollingId = loadPollingElectionId();
    const e = pollingId ? loadElectionById(pollingId) : loadElection();
    if (!e || e.status !== "active") { navigate("/teacher"); return; }
    setElection(e);
  }, [navigate]);

  function handleAuth(ev: React.FormEvent) {
    ev.preventDefault();
    if (!election) return;
    const id = studentIdInput.trim().toUpperCase();
    if (!id) { setAuthError("Please enter your Student ID."); return; }
    if (!election.studentIds.includes(id)) { setAuthError("Student ID not found. Contact the Polling Officer."); return; }
    if (election.votedStudentIds.includes(id)) { setAuthError("You have already voted. Each student may vote only once."); return; }
    setStudentId(id); setAuthError(""); setStep("vote");
  }

  function castVote() {
    if (!election || !selectedCandidate) return;
    const updated: Election = {
      ...election,
      candidates: election.candidates.map((c) => c.id === selectedCandidate.id ? { ...c, votes: c.votes + 1 } : c),
      votedStudentIds: [...election.votedStudentIds, studentId],
    };
    saveElection(updated); setElection(updated); setStep("success");
    setTimeout(() => setStep("locked"), 3000);
  }

  if (!election) return null;

  if (step === "auth") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4"><span className="text-4xl">🗳️</span></div>
            <h2 className="text-3xl font-heading font-bold text-foreground">{election.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">Enter your Student ID to vote</p>
          </div>
          <form onSubmit={handleAuth} className="evm-border bg-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Student ID</label>
              <input className="w-full bg-secondary/60 border border-border rounded-lg px-4 py-3 text-foreground font-mono text-lg text-center tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                placeholder="e.g. STU001" value={studentIdInput} onChange={(e) => { setStudentIdInput(e.target.value.toUpperCase()); setAuthError(""); }} autoFocus />
              {authError && (
                <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-destructive text-xs">{authError}</p>
                </div>
              )}
            </div>
            <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity">VERIFY & PROCEED</button>
          </form>
          <p className="text-center text-xs text-muted-foreground">Your vote is completely anonymous</p>
        </div>
      </div>
    );
  }

  if (step === "vote") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border px-6 py-4 text-center">
          <h2 className="text-2xl font-heading font-bold text-foreground">{election.title}</h2>
          <p className="text-muted-foreground text-sm">Select your preferred candidate</p>
        </div>
        <div className="max-w-md mx-auto px-4 py-8 space-y-4 animate-slide-up">
          {election.candidates.map((c) => (
            <button key={c.id} onClick={() => { setSelectedCandidate(c); setStep("confirm"); }}
              className="w-full evm-border bg-card rounded-2xl p-5 flex items-center gap-4 text-left candidate-tile hover:evm-glow">
              <CandidateSymbol symbol={c.symbol} />
              <div className="flex-1"><h3 className="font-heading font-bold text-xl text-foreground">{c.name}</h3><p className="text-muted-foreground text-sm">{c.party}</p></div>
              <ChevronRight className="text-muted-foreground flex-shrink-0" size={20} />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground pb-8">Your vote is secret. No one can see your selection.</p>
      </div>
    );
  }

  if (step === "confirm" && selectedCandidate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6 animate-slide-up">
          <h2 className="text-2xl font-heading font-bold text-foreground">Confirm Your Vote</h2>
          <p className="text-muted-foreground text-sm">You are about to vote for:</p>
          <div className="evm-border bg-card rounded-2xl p-8 flex flex-col items-center gap-3 evm-glow">
            <CandidateSymbol symbol={selectedCandidate.symbol} size="lg" />
            <h3 className="text-3xl font-heading font-bold text-primary">{selectedCandidate.name}</h3>
            <p className="text-muted-foreground">{selectedCandidate.party}</p>
          </div>
          <p className="text-yellow-400 text-sm font-semibold">⚠️ This action cannot be undone</p>
          <div className="flex gap-4">
            <button onClick={() => { setSelectedCandidate(null); setStep("vote"); }} className="flex-1 py-3.5 bg-secondary text-foreground rounded-xl font-semibold hover:bg-border transition-colors">Go Back</button>
            <button onClick={castVote} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity">CAST VOTE</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-5 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-green-900/40 border-2 border-green-500/50 flex items-center justify-center mx-auto animate-check-bounce">
            <CheckCircle className="text-green-400" size={52} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Vote Recorded!</h2>
          <p className="text-muted-foreground">Your vote has been securely and anonymously recorded.</p>
          <div className="evm-border bg-card rounded-xl px-6 py-4 inline-block"><p className="text-sm text-muted-foreground">Thank you for participating in the election</p></div>
          <p className="text-xs text-muted-foreground animate-lock-pulse">Locking device in a moment...</p>
        </div>
      </div>
    );
  }

  if (step === "locked") { navigate("/teacher"); return null; }
  return null;
}