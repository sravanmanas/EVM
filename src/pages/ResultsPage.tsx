import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Trophy, Users, BarChart3, ArrowLeft, Copy, Share2 } from "lucide-react";
import { loadElection, loadElectionById } from "@/lib/storage";
import { Election } from "@/types";
import { percentOf, formatCount } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "@/components/features/ThemeToggle";
import VictoryShareModal from "@/components/features/VictoryShareModal";
import { toast } from "sonner";

function CandidateSymbol({ symbol }: { symbol: string }) {
  if (symbol.startsWith("data:") || symbol.startsWith("http")) {
    return <div className="w-14 h-14 rounded-xl overflow-hidden border border-border bg-secondary flex-shrink-0"><img src={symbol} alt="symbol" className="w-full h-full object-cover" /></div>;
  }
  return <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-3xl border border-border flex-shrink-0">{symbol}</div>;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [election, setElection] = useState<Election | null>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const idParam = searchParams.get("id");
    const e = idParam ? loadElectionById(idParam) : loadElection();
    if (!e || e.status !== "ended") { navigate("/officer"); return; }
    setElection(e);
  }, [navigate, searchParams]);

  if (!election) return null;

  const totalVotes = election.candidates.reduce((s, c) => s + c.votes, 0);
  const sorted = [...election.candidates].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];
  const isTie = sorted.length > 1 && sorted[0].votes === sorted[1].votes && sorted[0].votes > 0;
  const podiumBg = ["bg-yellow-900/25 border-yellow-600/40", "bg-slate-800/40 border-slate-500/40", "bg-amber-900/20 border-amber-700/40"];
  const podiumColor = ["text-yellow-400", "text-slate-300", "text-amber-600"];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/officer")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={22} /></button>
          <div><h1 className="text-2xl font-heading font-bold text-primary">ELECTION RESULTS</h1><p className="text-xs text-muted-foreground">{election.title}</p></div>
        </div>
        <div className="flex items-center gap-2">
          {!isTie && <button onClick={() => setShowShare(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"><Share2 size={16} /> Share</button>}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {totalVotes > 0 && (
          <div className={`rounded-2xl p-8 text-center ${isTie ? "evm-border bg-card" : "bg-gradient-to-b from-yellow-900/30 to-card evm-border border-yellow-600/40"}`}>
            {isTie ? (
              <><div className="text-5xl mb-3">🤝</div><h2 className="text-3xl font-heading font-bold text-foreground">TIE RESULT</h2><p className="text-muted-foreground mt-1">Multiple candidates received equal votes</p></>
            ) : (
              <>
                <Trophy className="text-yellow-400 mx-auto mb-3" size={52} />
                <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold mb-2">Winner</p>
                <div className="flex justify-center mb-3">
                  {winner.symbol.startsWith("data:") || winner.symbol.startsWith("http") ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-yellow-500/50"><img src={winner.symbol} alt={winner.name} className="w-full h-full object-cover" /></div>
                  ) : <div className="text-7xl">{winner.symbol}</div>}
                </div>
                <h2 className="text-4xl font-heading font-bold text-yellow-300">{winner.name}</h2>
                <p className="text-muted-foreground mt-1">{winner.party}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900/30 border border-yellow-600/40">
                  <span className="text-yellow-300 font-bold">{formatCount(winner.votes)} votes</span>
                  <span className="text-muted-foreground text-sm">({percentOf(winner.votes, totalVotes)}%)</span>
                </div>
              </>
            )}
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Users size={18} />, label: "Total Voters", value: formatCount(election.studentIds.length) },
            { icon: <BarChart3 size={18} />, label: "Votes Cast", value: formatCount(totalVotes) },
            { icon: <Trophy size={18} />, label: "Turnout", value: `${percentOf(totalVotes, election.studentIds.length)}%` },
          ].map((s) => (
            <div key={s.label} className="evm-border bg-card rounded-xl p-4 text-center">
              <div className="text-primary flex justify-center mb-1">{s.icon}</div>
              <div className="text-2xl font-heading font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2"><BarChart3 size={20} className="text-primary" /> All Candidates</h3>
          {sorted.map((c, i) => {
            const pct = percentOf(c.votes, totalVotes);
            return (
              <div key={c.id} className={`evm-border rounded-xl p-4 ${i < 3 ? podiumBg[i] : "bg-card"}`}>
                <div className="flex items-center gap-4 mb-3">
                  <span className={`text-2xl font-heading font-bold w-8 flex-shrink-0 ${i < 3 ? podiumColor[i] : "text-muted-foreground"}`}>#{i + 1}</span>
                  <CandidateSymbol symbol={c.symbol} />
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-lg text-foreground truncate">{c.name}</div>
                    <div className="text-muted-foreground text-sm">{c.party}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xl font-heading font-bold ${i === 0 && !isTie ? "text-yellow-300" : "text-foreground"}`}>{formatCount(c.votes)}</div>
                    <div className="text-muted-foreground text-sm">{pct}%</div>
                  </div>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${i === 0 && !isTie ? "bg-yellow-400" : "bg-primary/60"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {totalVotes === 0 && <div className="text-center py-10 text-muted-foreground">No votes were cast in this election.</div>}
        </div>
        <div className="evm-border bg-card rounded-xl p-4 flex items-center justify-between text-sm">
          <div><span className="text-muted-foreground">Election ID: </span><span className="font-mono font-bold text-foreground">{election.id}</span></div>
          <button onClick={() => { navigator.clipboard.writeText(election.id); toast.success("Election ID copied!"); }} className="flex items-center gap-1.5 text-primary hover:opacity-80 transition-opacity text-xs font-semibold"><Copy size={14} /> Copy</button>
        </div>
      </div>
      {showShare && <VictoryShareModal election={election} onClose={() => setShowShare(false)} />}
    </div>
  );
}