import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, LogOut, Play, BarChart2, AlertTriangle, Upload, Settings, ChevronLeft, FileText, KeyRound, Vote, Copy, Trophy, FolderArchive } from "lucide-react";
import { toast } from "sonner";
import { Election, Candidate, AdminCredentials } from "@/types";
import { loadAllElections, upsertElection, deleteElection, saveActiveElectionId, generateId, loadAdminCredentials, saveAdminCredentials } from "@/lib/storage";
import { parseStudentIds } from "@/lib/utils";
import CandidateForm from "@/components/features/CandidateForm";
import ElectionSetup from "@/components/features/ElectionSetup";
import ExportModal from "@/components/features/ExportModal";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "@/components/features/ThemeToggle";

type View = "list" | "manage" | "create" | "settings";
type ManageTab = "overview" | "candidates" | "students";

export default function OfficerPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [elections, setElections] = useState<Election[]>([]);
  const [selected, setSelected] = useState<Election | null>(null);
  const [view, setView] = useState<View>("list");
  const [manageTab, setManageTab] = useState<ManageTab>("overview");
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [studentText, setStudentText] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);
  const [creds, setCreds] = useState<AdminCredentials>(loadAdminCredentials());
  const [newId, setNewId] = useState(creds.adminId);
  const [newPass, setNewPass] = useState(creds.password);
  const [confirmPass, setConfirmPass] = useState("");
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => { setElections(loadAllElections()); }, []);

  function refresh() {
    const all = loadAllElections(); setElections(all);
    if (selected) { const updated = all.find(e => e.id === selected.id) ?? null; setSelected(updated); }
  }
  function saveE(election: Election) { upsertElection(election); refresh(); }
  function handleCreate(title: string, description: string, password: string) {
    const e: Election = { id: generateId(), title, description, status: "setup", controlPassword: password, candidates: [], studentIds: [], votedStudentIds: [], createdAt: new Date().toISOString() };
    upsertElection(e); refresh(); setSelected(e); setManageTab("candidates"); setView("manage");
    toast.success("Election created! Add candidates next.");
  }
  function addCandidate(name: string, party: string, symbol: string) {
    if (!selected) return;
    const c: Candidate = { id: generateId(), name, party, symbol, votes: 0 };
    const u = { ...selected, candidates: [...selected.candidates, c] };
    setSelected(u); saveE(u); setShowCandidateForm(false); toast.success(name + " added.");
  }
  function removeCandidate(id: string) {
    if (!selected) return;
    const u = { ...selected, candidates: selected.candidates.filter(c => c.id !== id) };
    setSelected(u); saveE(u); toast.info("Candidate removed.");
  }
  function importFromText() {
    if (!selected) return;
    const ids = parseStudentIds(studentText);
    if (!ids.length) { toast.error("No valid IDs found."); return; }
    const merged = Array.from(new Set([...selected.studentIds, ...ids]));
    const u = { ...selected, studentIds: merged }; setSelected(u); saveE(u); setStudentText("");
    toast.success(ids.length + " IDs imported (" + merged.length + " total).");
  }
  function importFromCSV(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]; if (!file || !selected) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ids = parseStudentIds(reader.result as string);
      if (!ids.length) { toast.error("No valid IDs in CSV."); return; }
      const merged = Array.from(new Set([...selected.studentIds, ...ids]));
      const u = { ...selected, studentIds: merged }; setSelected(u); saveE(u);
      toast.success(ids.length + " IDs from CSV (" + merged.length + " total).");
    }; reader.readAsText(file); ev.target.value = "";
  }
  function activateElection() {
    if (!selected) return;
    if (selected.candidates.length < 2) { toast.error("Need at least 2 candidates."); return; }
    if (!selected.studentIds.length) { toast.error("Upload student IDs first."); return; }
    const u = { ...selected, status: "active" as const }; setSelected(u); saveE(u); saveActiveElectionId(selected.id);
    toast.success("Election activated!");
  }
  function endElection() {
    if (!selected) return;
    const u = { ...selected, status: "ended" as const, endedAt: new Date().toISOString() }; setSelected(u); saveE(u); saveActiveElectionId(selected.id);
    toast.success("Election ended."); navigate("/results?id=" + selected.id);
  }
  function handleDelete(id: string) {
    if (!confirm("Delete this election?")) return;
    deleteElection(id); if (selected?.id === id) { setSelected(null); setView("list"); }
    refresh(); toast.info("Deleted.");
  }
  function saveSettings(ev: React.FormEvent) {
    ev.preventDefault(); setSettingsError("");
    if (!newId.trim()) { setSettingsError("Admin ID cannot be empty."); return; }
    if (newPass.length < 4) { setSettingsError("Password must be at least 4 characters."); return; }
    if (newPass !== confirmPass) { setSettingsError("Passwords do not match."); return; }
    const u: AdminCredentials = { adminId: newId.trim(), password: newPass };
    saveAdminCredentials(u); setCreds(u); setConfirmPass(""); toast.success("Credentials updated!");
  }

  const totalVotes = (e: Election) => e.candidates.reduce((s, c) => s + c.votes, 0);
  const field = "bg-secondary/60 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          {(view==="manage"||view==="create"||view==="settings")&&(
            <button onClick={()=>{setView("list");setSelected(null);setShowCandidateForm(false);}} className="text-muted-foreground hover:text-foreground mr-1"><ChevronLeft size={22}/></button>
          )}
          <div>
            <h1 className="text-xl font-heading font-bold text-primary leading-tight">ELECTION OFFICER</h1>
            <p className="text-xs text-muted-foreground">{view==="list"&&"All Elections"}{view==="create"&&"Create Election"}{view==="manage"&&selected?.title}{view==="settings"&&"Admin Settings"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view==="manage"&&selected?.status==="active"&&<button onClick={endElection} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-semibold hover:opacity-90"><BarChart2 size={14}/> End & Results</button>}
          {view==="manage"&&selected?.status==="ended"&&<button onClick={()=>navigate("/results?id="+selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90"><BarChart2 size={14}/> View Results</button>}
          <ThemeToggle theme={theme} onToggle={toggleTheme}/>
          <button onClick={()=>setView("settings")} className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground"><Settings size={17}/></button>
          <button onClick={()=>{sessionStorage.clear();navigate("/");}} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm hover:bg-border"><LogOut size={15}/> Exit</button>
        </div>
      </div>

      {view==="list"&&(
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold">All Elections</h2>
            <button onClick={()=>setView("create")} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90"><Plus size={16}/> New Election</button>
          </div>
          {elections.length===0&&<div className="text-center py-20 space-y-4"><Vote className="text-muted-foreground/40 mx-auto" size={56}/><p className="text-muted-foreground text-lg">No elections yet.</p><button onClick={()=>setView("create")} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90">Create First Election</button></div>}
          <div className="grid gap-4">
            {elections.map(e=>(
              <div key={e.id} className="evm-border bg-card rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-bold text-xl truncate">{e.title}</h3>
                      <span className={"text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 "+(e.status==="active"?"bg-green-900/30 text-green-400 border border-green-800/40":e.status==="ended"?"bg-blue-900/30 text-blue-400 border border-blue-800/40":"bg-yellow-900/20 text-yellow-400 border border-yellow-800/30")}>{e.status.toUpperCase()}</span>
                    </div>
                    {e.description&&<p className="text-muted-foreground text-sm mb-2 line-clamp-1">{e.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground"><span>{e.candidates.length} candidates</span><span>{e.studentIds.length} voters</span>{e.status!=="setup"&&<span>{totalVotes(e)} votes</span>}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {e.status==="ended"&&<button onClick={()=>navigate("/results?id="+e.id)} className="flex items-center gap-1.5 px-3 py-2 bg-yellow-900/30 border border-yellow-700/40 text-yellow-400 rounded-lg text-xs font-semibold hover:opacity-90"><Trophy size={13}/> Results</button>}
                    <button onClick={()=>{setSelected(e);setManageTab("overview");setView("manage");}} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90">Manage</button>
                    <button onClick={()=>handleDelete(e.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-destructive"><Trash2 size={15}/></button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs"><span className="text-muted-foreground">Election ID:</span><span className="font-mono font-bold tracking-wider">{e.id}</span></div>
                  <button onClick={()=>{navigator.clipboard.writeText(e.id);toast.success("Election ID copied!");}} className="flex items-center gap-1.5 text-primary text-xs font-semibold hover:opacity-80"><Copy size={13}/> Copy ID</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="create"&&<div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in"><ElectionSetup onCreate={handleCreate}/></div>}

      {view==="manage"&&selected&&(
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          <div className={"rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold "+(selected.status==="active"?"bg-green-900/20 border border-green-800/30 text-green-400":selected.status==="ended"?"bg-blue-900/20 border border-blue-800/30 text-blue-400":"bg-yellow-900/15 border border-yellow-800/25 text-yellow-400")}>
            <div className={"w-2 h-2 rounded-full "+(selected.status==="active"?"bg-green-400 animate-pulse":selected.status==="ended"?"bg-blue-400":"bg-yellow-400")}/>
            <span>{selected.status.toUpperCase()}</span>
            {selected.status==="active"&&<span className="ml-auto text-xs font-normal">{selected.votedStudentIds.length}/{selected.studentIds.length} voted</span>}
          </div>
          <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
            {(["overview","candidates","students"] as ManageTab[]).map(t=>(
              <button key={t} onClick={()=>setManageTab(t)} className={"flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize "+(manageTab===t?"bg-primary text-primary-foreground shadow":"text-muted-foreground hover:text-foreground")}>
                {t==="candidates"?"Candidates ("+selected.candidates.length+")":t==="students"?"Students ("+selected.studentIds.length+")":"Overview"}
              </button>
            ))}
          </div>
          {manageTab==="overview"&&(
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{label:"Candidates",v:selected.candidates.length},{label:"Registered",v:selected.studentIds.length},{label:"Voted",v:selected.votedStudentIds.length},{label:"Pending",v:selected.studentIds.length-selected.votedStudentIds.length}].map(s=>(
                  <div key={s.label} className="evm-border rounded-xl p-4 bg-card text-center"><div className="text-3xl font-heading font-bold text-primary">{s.v}</div><div className="text-xs text-muted-foreground mt-1">{s.label}</div></div>
                ))}
              </div>
              {selected.status==="setup"&&(
                <div className="space-y-3">
                  {selected.candidates.length<2&&<div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/40 text-yellow-400 text-sm"><AlertTriangle size={16}/>Add at least 2 candidates</div>}
                  {!selected.studentIds.length&&<div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/40 text-yellow-400 text-sm"><AlertTriangle size={16}/>Upload student voter list</div>}
                  <button onClick={activateElection} className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90"><Play size={20}/> ACTIVATE ELECTION</button>
                </div>
              )}
            </div>
          )}
          {manageTab==="candidates"&&(
            <div className="space-y-4 animate-fade-in">
              {selected.status==="setup"&&!showCandidateForm&&<button onClick={()=>setShowCandidateForm(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90"><Plus size={18}/> Add Candidate</button>}
              {showCandidateForm&&<CandidateForm existing={selected.candidates.map(c=>c.symbol)} onAdd={addCandidate} onCancel={()=>setShowCandidateForm(false)}/>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{selected.candidates.map(c=>(
                <div key={c.id} className="evm-border bg-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary border border-border flex-shrink-0">{c.symbol.startsWith("data:")||c.symbol.startsWith("http")?<img src={c.symbol} alt={c.name} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-3xl">{c.symbol}</div>}</div>
                  <div className="flex-1 min-w-0"><div className="font-heading font-bold text-lg truncate">{c.name}</div><div className="text-muted-foreground text-sm">{c.party}</div>{selected.status!=="setup"&&<div className="text-primary font-bold text-sm mt-0.5">{c.votes} votes</div>}</div>
                  {selected.status==="setup"&&<button onClick={()=>removeCandidate(c.id)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 size={18}/></button>}
                </div>
              ))}</div>
              {!selected.candidates.length&&!showCandidateForm&&<p className="text-center text-muted-foreground py-12">No candidates yet.</p>}
            </div>
          )}
          {manageTab==="students"&&(
            <div className="space-y-5 animate-fade-in">
              {selected.status==="setup"&&(
                <div className="evm-border rounded-xl p-5 bg-card space-y-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2"><Upload size={18} className="text-primary"/>Import Student IDs</h3>
                  <div><p className="text-muted-foreground text-sm mb-2">Option 1: Upload CSV file</p>
                    <input ref={csvRef} type="file" accept=".csv,.txt" className="hidden" onChange={importFromCSV}/>
                    <button onClick={()=>csvRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm font-semibold hover:bg-border"><FileText size={16} className="text-primary"/>Upload CSV / TXT</button>
                    <p className="text-muted-foreground text-xs mt-1">One ID per line or comma-separated</p></div>
                  <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border"/><span className="text-xs text-muted-foreground">or paste manually</span><div className="flex-1 h-px bg-border"/></div>
                  <div><p className="text-muted-foreground text-sm mb-2">Option 2: Paste IDs manually</p>
                    <textarea className="w-full h-28 bg-secondary/60 border border-border rounded-lg p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono" placeholder="STU001
STU002" value={studentText} onChange={e=>setStudentText(e.target.value)}/>
                    <button onClick={importFromText} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 mt-2"><Upload size={15}/>Import</button></div>
                </div>
              )}
              <div className="evm-border rounded-xl bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <span className="font-heading font-bold">Voter List</span><span className="text-muted-foreground text-sm">{selected.votedStudentIds.length}/{selected.studentIds.length} voted</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {!selected.studentIds.length&&<p className="text-center text-muted-foreground py-8 text-sm">No students imported yet.</p>}
                  {selected.studentIds.map(id=>{
                    const voted=selected.votedStudentIds.includes(id);
                    return <div key={id} className="px-5 py-2.5 flex items-center justify-between"><span className="font-mono text-sm">{id}</span>{voted?<span className="voted-badge">✓ VOTED</span>:<span className="text-xs text-muted-foreground">Pending</span>}</div>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view==="settings"&&(
        <div className="max-w-md mx-auto px-6 py-8 animate-fade-in space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center"><KeyRound className="text-primary" size={24}/></div>
            <div><h2 className="text-2xl font-heading font-bold">Admin Settings</h2><p className="text-muted-foreground text-sm">Change login credentials</p></div>
          </div>
          <form onSubmit={saveSettings} className="evm-border bg-card rounded-2xl p-6 space-y-5">
            <div><label className="block text-sm font-semibold mb-1.5">Admin ID</label><input className={field} value={newId} onChange={e=>setNewId(e.target.value)} placeholder="New admin ID"/></div>
            <div><label className="block text-sm font-semibold mb-1.5">New Password</label><input className={field} type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="New password"/></div>
            <div><label className="block text-sm font-semibold mb-1.5">Confirm Password</label><input className={field} type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="Confirm"/></div>
            {settingsError&&<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{settingsError}</div>}
            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:opacity-90">Save Credentials</button>
          </form>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground">
            <p className="font-semibold text-foreground text-xs uppercase tracking-widest mb-2">Current</p>
            <p>ID: <span className="font-mono font-bold text-foreground">{creds.adminId}</span></p>
            <p>Password: <span className="font-mono font-bold text-foreground">{"•".repeat(creds.password.length)}</span></p>
          </div>
          <div className="evm-border bg-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center"><FolderArchive className="text-primary" size={20}/></div>
              <div><h3 className="font-heading font-bold text-lg">Export Project</h3><p className="text-muted-foreground text-xs">Download or share the full source code</p></div>
            </div>
            <button onClick={()=>setShowExport(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-secondary border border-border rounded-xl font-semibold text-sm hover:bg-border">
              <FolderArchive size={16} className="text-primary"/>Generate & Share ZIP
            </button>
          </div>
        </div>
      )}
      {showExport&&<ExportModal onClose={()=>setShowExport(false)}/>}
    </div>
  );
}