import { useState, useRef } from "react";
import { X, Upload, ImagePlus } from "lucide-react";

interface Props {
  existing: string[];
  onAdd: (name: string, party: string, symbol: string) => void;
  onCancel: () => void;
}

export default function CandidateForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [symbolPreview, setSymbolPreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImagePick(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrors((e) => ({ ...e, symbol: "Please select an image file." })); return; }
    const reader = new FileReader();
    reader.onload = () => { setSymbolPreview(reader.result as string); setErrors((e) => { const n = { ...e }; delete n.symbol; return n; }); };
    reader.readAsDataURL(file);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Candidate name is required";
    if (!symbolPreview) e.symbol = "Upload a party symbol / photo";
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAdd(name.trim(), party.trim() || "Independent", symbolPreview);
  }

  const field = "bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full";

  return (
    <form onSubmit={handleSubmit} className="evm-border bg-card rounded-xl p-5 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading font-bold text-lg text-foreground">Add Candidate</h3>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full Name *</label>
          <input className={field} placeholder="Candidate name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Party / Group</label>
          <input className={field} placeholder="Party or Independent" value={party} onChange={(e) => setParty(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-2">Party Symbol / Photo *</label>
        <div className="flex items-center gap-4">
          <div onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/60 transition-colors bg-secondary/40 flex-shrink-0">
            {symbolPreview ? <img src={symbolPreview} alt="Symbol" className="w-full h-full object-cover" /> : <ImagePlus className="text-muted-foreground" size={28} />}
          </div>
          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-border transition-colors w-full justify-center">
              <Upload size={16} className="text-primary" />
              {symbolPreview ? "Change Image" : "Upload from Gallery"}
            </button>
            <p className="text-muted-foreground text-xs mt-1.5">Supported: JPG, PNG, WEBP, SVG</p>
          </div>
        </div>
        {errors.symbol && <p className="text-destructive text-xs mt-1">{errors.symbol}</p>}
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-semibold hover:bg-border transition-colors">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">Add Candidate</button>
      </div>
    </form>
  );
}