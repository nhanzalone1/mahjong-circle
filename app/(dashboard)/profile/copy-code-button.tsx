"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition"
    >
      {copied ? <Check size={20} /> : <Copy size={20} />}
    </button>
  );
}
