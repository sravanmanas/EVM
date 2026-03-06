export async function generateProjectZip(progress?: (msg: string) => void) {
  if (progress) progress("Preparing project export...");
  
  const content = "EVM Voting System Source Code Export";
  
  return new Blob([content], { type: "application/zip" });
}

export function downloadZip(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  
  a.href = url;
  a.download = "EVM-Voting-System.zip";
  
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
