import { useState } from "react";
import { X, Download, Share2, Send, Twitter, FolderArchive, Loader2, CheckCircle2 } from "lucide-react";
import { generateProjectZip, downloadZip } from "@/lib/projectExport";
import { toast } from "sonner";

interface Props { onClose: () => void; }
type Stage = "idle" | "generating" | "ready";

export default function ExportModal({ onClose }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [progressMsg, setProgressMsg] = useState("Packing all source files…");

  async function build() {
    setStage("generating");
    try {
      const blob = await generateProjectZip((msg) => setProgressMsg(msg));
      setZipBlob(blob);
      setStage("ready");
    } catch {
      toast.error("Failed to generate ZIP.");
      setStage("idle");
    }
  }

  function handleDownload() {
    if (!zipBlob) return;
    downloadZip(zipBlob);
    toast.success("ZIP downloaded! Run: npm install && npm run dev");
  }

  const shareMsg = `🗳️ EVM Voting System — Source Code

Complete mobile EVM voting system.

📦 Setup:
1. Extract ZIP
2. npm install
3. npm run dev
4. Open http://localhost:5173

🔐 Admin: ID admin | Password 0000

Built with React + TypeScript + Tailwind CSS`;

  async function handleNativeShare() {
    if (!zipBlob) return;

    const file = new File([zipBlob], "EVM-Voting-System.zip", { type: "application/zip" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "EVM Voting System",
          text: shareMsg
        });
        toast.success("Shared!");
      } catch {}
    } else {
      navigator.clipboard.writeText(shareMsg);
      toast.success("Instructions copied!");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card evm-border rounded-3xl overflow-hidden animate-slide-up">

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <FolderArchive className="text-primary" size={20}/>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold">Export Source Code</h2>
              <p className="text-muted-foreground text-xs">
                Full project ZIP with all files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18}/>
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">

          <div className="rounded-2xl bg-secondary/60 border border-border p-4 space-y-2 text-sm">
            <p className="font-semibold flex items-center gap-2">
              <FolderArchive size={15} className="text-primary"/>
              What's included
            </p>

            <ul className="text-muted-foreground space-y-1 text-xs">
              {[
                "All pages, hooks, lib, types, components/features",
                "shadcn/ui components (fetched from official registry)",
                "All config files: tailwind, vite, tsconfig, eslint",
                "package.json with full dependency list",
                "public/ folder, README with setup instructions"
              ].map(i => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary">•</span> {i}
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">To run:</span>
              Extract →
              <code className="bg-background px-1 rounded font-mono">npm install</code>
              →
              <code className="bg-background px-1 rounded font-mono">npm run dev</code>
            </div>
          </div>

          {stage === "idle" && (
            <button
              onClick={build}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity"
            >
              <FolderArchive size={20}/> Generate Project ZIP
            </button>
          )}

          {stage === "generating" && (
            <div className="w-full flex flex-col items-center gap-3 py-6">
              <Loader2 className="text-primary animate-spin" size={36}/>
              <p className="text-muted-foreground text-sm text-center">{progressMsg}</p>
            </div>
          )}

          {stage === "ready" && (
            <div className="space-y-4 animate-fade-in">

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-900/20 border border-green-800/30">
                <CheckCircle2 className="text-green-400" size={18}/>
                <span className="text-green-400 text-sm font-semibold">
                  ZIP ready — {(zipBlob!.size / 1024).toFixed(1)} KB
                </span>
              </div>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <Download size={20}/> Download ZIP
              </button>

              <div className="grid grid-cols-4 gap-2">

                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, "_blank")}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
                >
                  WhatsApp
                </button>

                <button
                  onClick={() => window.open(`https://t.me/share/url?url=evmvoting.app&text=${encodeURIComponent(shareMsg)}`, "_blank")}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#2AABEE]/10 border border-[#2AABEE]/30 hover:bg-[#2AABEE]/20 transition-colors"
                >
                  <Send size={24} className="text-[#2AABEE]"/>
                  <span className="text-[11px] font-semibold text-[#2AABEE]">Telegram</span>
                </button>

                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("🗳️ EVM Voting System — Mobile Electronic Voting Machine built with React+TypeScript+Tailwind #OpenSource")}`, "_blank")}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
                >
                  <Twitter size={24}/>
                  <span className="text-[11px] font-semibold text-foreground">X</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-colors"
                >
                  <Share2 size={24}/>
                  <span className="text-[11px] font-semibold">More…</span>
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
