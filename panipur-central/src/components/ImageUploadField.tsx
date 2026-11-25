import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  /** ছবির সর্বোচ্চ প্রস্থ/উচ্চতা (পিক্সেল) — বড় ছবি স্বয়ংক্রিয়ভাবে ছোট হয় */
  maxDim?: number;
  quality?: number;
  className?: string;
}

function compress(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const k = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * k));
        const h = Math.max(1, Math.round(img.height * k));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUploadField({ value, onChange, label, maxDim = 400, quality = 0.8, className = "" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (file?: File) => {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) {
      setErr("শুধু ছবি (JPG/PNG) বাছুন।");
      return;
    }
    setBusy(true);
    try {
      onChange(await compress(file, maxDim, quality));
    } catch {
      setErr("ছবিটি পড়া যায়নি, অন্য ছবি চেষ্টা করুন।");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className={`border border-slate-300 rounded-xl px-3 py-2.5 bg-white ${className}`}>
      {label && <p className="text-xs font-bold text-slate-700 mb-2">{label}</p>}
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-slate-50" />
        ) : (
          <div className="w-14 h-14 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
            <ImagePlus className="w-5 h-5" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold"
          >
            {busy ? "প্রস্তুত হচ্ছে…" : value ? "ছবি বদলান" : "ছবি বাছুন"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> মুছুন
            </button>
          )}
        </div>
      </div>
      {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
