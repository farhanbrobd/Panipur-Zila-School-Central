import { useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { centralDb } from "../firebase/rbac";
import { fetchSchoolMeta, fetchPublishedExams } from "../firebase/results";
import { fetchAdmissionData } from "../firebase/admission";

type State = "ok" | "warn" | "fail";
interface Row {
  name: string;
  state: State;
  detail: string;
  hint?: string;
}

const code = (e: unknown) => {
  const x = e as { code?: string; message?: string };
  return x?.code || x?.message || "unknown";
};

export function SystemCheck({ lang }: { lang: "bn" | "en" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const bn = lang === "bn";
  const build = typeof __BUILD__ === "string" ? new Date(__BUILD__).toLocaleString("bn-BD") : "—";

  const run = async () => {
    setBusy(true);
    const out: Row[] = [];
    const rulesHint = (p: string) => `${p}-এর Firestore Rules Publish করা হয়নি বা এই অংশ যোগ করা হয়নি।`;

    try {
      const s = await getDoc(doc(centralDb, "site", "content"));
      out.push({ name: "ক্লাউড কনটেন্ট পড়া (সব ডিভাইসের জন্য)", state: s.exists() ? "ok" : "warn", detail: s.exists() ? "প্রকাশিত কনটেন্ট আছে" : "এখনো কিছু সংরক্ষিত হয়নি (প্রথম পরিবর্তনের পর হবে)" });
    } catch (e) {
      out.push({ name: "ক্লাউড কনটেন্ট পড়া (সব ডিভাইসের জন্য)", state: "fail", detail: code(e), hint: rulesHint("central-hub-pzs") + " central-hub.firestore.rules ফাইলের লেখা Firebase Console → Firestore → Rules-এ বসিয়ে Publish করুন।" });
    }
    try {
      await setDoc(doc(centralDb, "site", "health"), { at: serverTimestamp() });
      out.push({ name: "ক্লাউডে সংরক্ষণ (অ্যাডমিন)", state: "ok", detail: "লেখা সফল — এখান থেকে সংরক্ষিত তথ্য সব ডিভাইসে যাবে" });
    } catch (e) {
      out.push({ name: "ক্লাউডে সংরক্ষণ (অ্যাডমিন)", state: "fail", detail: code(e), hint: "central-hub-pzs-এর Rules-এ আপনার UID ঠিক আছে কিনা এবং site অংশ আছে কিনা দেখুন। এটি ঠিক না হলে এক ডিভাইসের পরিবর্তন অন্য ডিভাইসে যাবে না।" });
    }
    try {
      const m = await fetchSchoolMeta();
      out.push(m
        ? { name: "ফলাফল পোর্টাল → স্কুল তথ্য", state: "ok", detail: `পাওয়া গেছে (শ্রেণি শিক্ষক: ${Object.keys(m.classTeachers || {}).length} জন, শিক্ষাবর্ষ ${m.year || "—"})` }
        : { name: "ফলাফল পোর্টাল → স্কুল তথ্য", state: "warn", detail: "পোর্টাল এখনো তথ্য পাঠায়নি", hint: "ফলাফল পোর্টালের repo-তে নতুন publish.js বসান, তারপর পোর্টালে একবার লগইন করুন।" });
    } catch (e) {
      out.push({ name: "ফলাফল পোর্টাল → স্কুল তথ্য", state: "fail", detail: code(e), hint: rulesHint("pzs-93c0b") + " publishedMeta-র `allow get: if true` লাইনটি যোগ করুন।" });
    }
    try {
      const ex = await fetchPublishedExams();
      out.push({ name: "ফলাফল পোর্টাল → প্রকাশিত ফলাফল", state: ex.length ? "ok" : "warn", detail: ex.length ? `${ex.length}টি পরীক্ষা প্রকাশিত` : "কোনো ফলাফল প্রকাশিত নেই", hint: ex.length ? undefined : "পোর্টালের \"এক নজরে\" ট্যাবে শ্রেণি বেছে \"শিক্ষার্থীদের জন্য প্রকাশ\" চাপুন।" });
    } catch (e) {
      out.push({ name: "ফলাফল পোর্টাল → প্রকাশিত ফলাফল", state: "fail", detail: code(e), hint: rulesHint("pzs-93c0b") });
    }
    try {
      const a = await fetchAdmissionData();
      const n = [a.head.text, a.head.photo, a.asst.text, a.asst.photo, a.logo].filter(Boolean).length;
      out.push({ name: "ভর্তি ওয়েবসাইট → বাণী ও ছবি", state: n ? "ok" : "warn", detail: n ? "বাণী/ছবি পাওয়া গেছে" : "ভর্তি সাইটে বাণী/ছবি নেই" });
    } catch (e) {
      out.push({ name: "ভর্তি ওয়েবসাইট → বাণী ও ছবি", state: "fail", detail: code(e) });
    }
    setRows(out);
    setBusy(false);
  };

  const icon = { ok: "✅", warn: "⚠️", fail: "❌" } as const;
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg text-[#0F2942]">{bn ? "সিস্টেম স্ট্যাটাস ও সংযোগ পরীক্ষা" : "System Status"}</h3>
          <p className="text-xs text-slate-500">চালু সংস্করণ (build): {build}</p>
        </div>
        <button onClick={run} disabled={busy} className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl">
          {busy ? "পরীক্ষা চলছে…" : "পরীক্ষা চালান"}
        </button>
      </div>
      {rows.map((r) => (
        <div key={r.name} className="border border-slate-200 rounded-xl p-3 text-sm">
          <p className="font-semibold">{icon[r.state]} {r.name}</p>
          <p className="text-slate-600 break-words">{r.detail}</p>
          {r.hint && <p className="text-amber-800 bg-amber-50 rounded-lg p-2 mt-1 text-xs">{r.hint}</p>}
        </div>
      ))}
    </div>
  );
}
