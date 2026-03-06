import { useEffect, useRef, useState } from "react";
import { X, Download, Share2, Send, Twitter } from "lucide-react";
import { Election } from "@/types";
import { percentOf, formatCount } from "@/lib/utils";
import { toast } from "sonner";

interface Props { election: Election; onClose: () => void; }

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
async function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src;
  });
}
async function generateVictoryCanvas(election: Election): Promise<HTMLCanvasElement> {
  const W = 1080, H = 1080, canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H; const ctx = canvas.getContext("2d")!;
  const sorted = [...election.candidates].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0], totalVotes = election.candidates.reduce((s, c) => s + c.votes, 0);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a1628"); bg.addColorStop(0.5, "#0f1e3a"); bg.addColorStop(1, "#0a1628");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W/2, H*0.42, 0, W/2, H*0.42, 340);
  glow.addColorStop(0, "rgba(59,130,246,0.18)"); glow.addColorStop(1, "rgba(59,130,246,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  const lg = ctx.createLinearGradient(0,0,W,0);
  lg.addColorStop(0,"rgba(59,130,246,0)"); lg.addColorStop(0.5,"rgba(59,130,246,1)"); lg.addColorStop(1,"rgba(59,130,246,0)");
  ctx.fillStyle = lg; ctx.fillRect(0,0,W,4); ctx.fillRect(0,H-4,W,4);
  const cc=["#fbbf24","#f59e0b","#3b82f6","#60a5fa","#ffffff"], rng=(s:number)=>(Math.sin(s)*43758.5453)%1;
  for(let i=0;i<55;i++){ctx.beginPath();ctx.arc(rng(i*3.1)*W,rng(i*7.4)*H,rng(i*2.2)*6+2,0,Math.PI*2);ctx.fillStyle=cc[i%cc.length]+"55";ctx.fill();}
  ctx.font="bold 36px Arial"; ctx.fillStyle="#94a3b8"; ctx.textAlign="center";
  ctx.fillText(election.title.toUpperCase(),W/2,80);
  ctx.font="bold 28px Arial"; ctx.fillStyle="#fbbf24"; ctx.fillText("🏆  WINNER",W/2,140);
  const imgSize=240,imgX=(W-imgSize)/2,imgY=170;
  ctx.beginPath(); ctx.arc(W/2,imgY+imgSize/2,imgSize/2+16,0,Math.PI*2);
  const ring=ctx.createLinearGradient(imgX-16,imgY-16,imgX+imgSize+16,imgY+imgSize+16);
  ring.addColorStop(0,"#fbbf24"); ring.addColorStop(0.5,"#f59e0b"); ring.addColorStop(1,"#fbbf24");
  ctx.strokeStyle=ring; ctx.lineWidth=6; ctx.stroke();
  if(winner.symbol.startsWith("data:")||winner.symbol.startsWith("http")){const img=await loadImg(winner.symbol);if(img){ctx.save();ctx.beginPath();ctx.arc(W/2,imgY+imgSize/2,imgSize/2,0,Math.PI*2);ctx.clip();ctx.drawImage(img,imgX,imgY,imgSize,imgSize);ctx.restore();}}
  else{ctx.font=`${imgSize*0.72}px Arial`;ctx.textAlign="center";ctx.fillText(winner.symbol,W/2,imgY+imgSize*0.75);}
  ctx.font="bold 80px Arial Black,Arial"; ctx.fillStyle="#ffffff"; ctx.textAlign="center";
  while(ctx.measureText(winner.name).width>W-80){const s=parseInt(ctx.font);ctx.font=`bold ${s-4}px Arial Black,Arial`;}
  ctx.fillText(winner.name,W/2,imgY+imgSize+80);
  ctx.font="500 38px Arial"; ctx.fillStyle="#60a5fa"; ctx.fillText(winner.party.toUpperCase(),W/2,imgY+imgSize+130);
  const pY=imgY+imgSize+175,pW=340,pH=72,pX=(W-pW)/2;
  drawRoundRect(ctx,pX,pY,pW,pH,36);
  const pg=ctx.createLinearGradient(pX,pY,pX+pW,pY+pH);
  pg.addColorStop(0,"#1e3a5f"); pg.addColorStop(1,"#1e40af");
  ctx.fillStyle=pg; ctx.fill(); ctx.strokeStyle="#3b82f6"; ctx.lineWidth=2; ctx.stroke();
  ctx.font="bold 40px Arial Black,Arial"; ctx.fillStyle="#fbbf24"; ctx.textAlign="center";
  ctx.fillText(`${formatCount(winner.votes)}  VOTES  ·  ${percentOf(winner.votes,totalVotes)}%`,W/2,pY+46);
  const dY=pY+pH+55, dg=ctx.createLinearGradient(120,dY,W-120,dY);
  dg.addColorStop(0,"rgba(59,130,246,0)"); dg.addColorStop(0.5,"rgba(59,130,246,0.6)"); dg.addColorStop(1,"rgba(59,130,246,0)");
  ctx.fillStyle=dg; ctx.fillRect(120,dY,W-240,2);
  const sY=dY+50, cW=W/3;
  [{label:"TOTAL VOTERS",value:formatCount(election.studentIds.length)},{label:"VOTES CAST",value:formatCount(totalVotes)},{label:"TURNOUT",value:`${percentOf(totalVotes,election.studentIds.length)}%`}]
    .forEach((s,i)=>{const cx=cW*i+cW/2;ctx.font="bold 48px Arial Black,Arial";ctx.fillStyle="#3b82f6";ctx.textAlign="center";ctx.fillText(s.value,cx,sY+4);ctx.font="500 24px Arial";ctx.fillStyle="#64748b";ctx.fillText(s.label,cx,sY+44);});
  [1,2].forEach(n=>{ctx.fillStyle="rgba(59,130,246,0.3)";ctx.fillRect(cW*n-1,sY-28,2,80);});
  ctx.font="600 24px Arial"; ctx.fillStyle="#1d4ed8"; ctx.textAlign="center";
  ctx.fillText("EVM VOTING SYSTEM",W/2,H-42);
  return canvas;
}

export default function VictoryShareModal({ election, onClose }: Props) {
  const [previewUrl, setPreviewUrl] = useState(""), [generating, setGenerating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const sorted=[...election.candidates].sort((a,b)=>b.votes-a.votes);
  const winner=sorted[0], totalVotes=election.candidates.reduce((s,c)=>s+c.votes,0);
  const isTie=sorted.length>1&&sorted[0].votes===sorted[1].votes&&totalVotes>0;
  useEffect(()=>{(async()=>{setGenerating(true);const canvas=await generateVictoryCanvas(election);canvasRef.current=canvas;setPreviewUrl(canvas.toDataURL("image/png"));setGenerating(false);})();},[election]);
  function handleDownload(){if(!canvasRef.current)return;const url=canvasRef.current.toDataURL("image/png");const a=document.createElement("a");a.href=url;a.download=`${election.title.replace(/\s+/g,"_")}_result.png`;a.click();toast.success("Victory card downloaded!");}
  async function handleNativeShare(){if(!canvasRef.current)return;canvasRef.current.toBlob(async(blob)=>{if(!blob){toast.error("Could not generate image.");return;}const file=new File([blob],`${election.title}_result.png`,{type:"image/png"});const t=isTie?`🤝 It's a Tie! — ${election.title}`:`🏆 ${winner.name} wins ${election.title} with ${winner.votes} votes!`;if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:election.title,text:t});}catch{}}else{navigator.clipboard.writeText(t);toast.success("Share text copied!");}},"image/png");}
  const shareText=isTie?`🤝 It's a Tie! — ${election.title}`:`🏆 ${winner?.name} wins ${election.title} with ${formatCount(winner?.votes??0)} votes!`;
  const waUrl=`https://wa.me/?text=${encodeURIComponent(shareText)}`, tgUrl=`https://t.me/share/url?url=${encodeURIComponent("https://evmvoting.app")}&text=${encodeURIComponent(shareText)}`, twUrl=`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card evm-border rounded-3xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div><h2 className="text-xl font-heading font-bold">Share Victory</h2><p className="text-muted-foreground text-xs mt-0.5">Download or share the result card</p></div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"><X size={18}/></button>
        </div>
        <div className="px-5 pt-4 pb-3"><div className="rounded-2xl overflow-hidden border border-border bg-secondary aspect-square flex items-center justify-center">{generating?<div className="text-center space-y-3"><div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"/><p className="text-muted-foreground text-sm">Generating…</p></div>:previewUrl?<img src={previewUrl} alt="Victory card" className="w-full h-full object-cover"/>:null}</div></div>
        <div className="px-5 pb-5 space-y-3">
          <button onClick={handleDownload} disabled={generating} className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"><Download size={20}/>Download Image</button>
          <div className="grid grid-cols-4 gap-2">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.847L.057 23.882a.5.5 0 0 0 .612.612l6.102-1.466A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.953 9.953 0 0 1-5.14-1.428l-.369-.22-3.814.917.933-3.742-.241-.384A9.955 9.955 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/></svg><span className="text-[11px] font-semibold text-[#25D366]">WhatsApp</span></a>
            <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#2AABEE]/10 border border-[#2AABEE]/30 hover:bg-[#2AABEE]/20 transition-colors"><Send size={24} className="text-[#2AABEE]"/><span className="text-[11px] font-semibold text-[#2AABEE]">Telegram</span></a>
            <a href={twUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"><Twitter size={24} className="text-white"/><span className="text-[11px] font-semibold text-foreground">X / Twitter</span></a>
            <button onClick={handleNativeShare} disabled={generating} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gradient-to-br from-[#f09433]/10 to-[#e6683c]/10 border border-[#f09433]/30 hover:from-[#f09433]/20 hover:to-[#e6683c]/20 transition-colors disabled:opacity-50"><Share2 size={24} className="text-[#f09433]"/><span className="text-[11px] font-semibold text-[#f09433]">More…</span></button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Use <span className="font-semibold text-foreground">Download</span> then upload to Instagram or Status</p>
        </div>
      </div>
    </div>
  );
}