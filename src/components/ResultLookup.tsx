import { useEffect, useState, type FormEvent } from "react";
import { Search, Printer, GraduationCap } from "lucide-react";
import {
  PublishedExam,
  PublishedResult,
  fetchPublishedExams,
  fetchPublishedResult,
} from "../firebase/results";

const bn = (v: string | number) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

export function ResultLookup() {
  const [exams, setExams] = useState<PublishedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [examKey, setExamKey] = useState("");
  const [cls, setCls] = useState("");
  const [roll, setRoll] = useState("");
  const [dob, setDob] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<PublishedResult | null>(null);

  useEffect(() => {
    fetchPublishedExams()
      .then((list) => {
        setExams(list);
        if (list.length > 0) {
          setExamKey(list[0].key);
          setCls(list[0].classes[0]);
        }
      })
      .catch(() => setLoadError("ফলাফল সেবা এখন চালু নেই। কিছুক্ষণ পর আবার চেষ্টা করুন।"))
      .finally(() => setLoading(false));
  }, []);

  const exam = exams.find((e) => e.key === examKey);

  const onExamChange = (key: string) => {
    setExamKey(key);
    const e = exams.find((x) => x.key === key);
    if (e && !e.classes.includes(cls)) setCls(e.classes[0]);
    setResult(null);
    setMessage("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!exam) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      const r = await fetchPublishedResult(exam, cls, roll, dob);
      if (r) setResult(r);
      else setMessage("ফলাফল পাওয়া যায়নি। শ্রেণি, রোল ও জন্ম তারিখ ঠিক আছে কিনা দেখুন।");
    } catch {
      setMessage("ফলাফল আনা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold text-slate-900">শিক্ষার্থীদের ফলাফল</h2>
        <p className="text-sm text-slate-600 mt-1">
          পরীক্ষা বেছে নিয়ে শ্রেণি, রোল নম্বর ও জন্ম তারিখ দিন।
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">লোড হচ্ছে…</p>
      ) : loadError ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{loadError}</p>
      ) : exams.length === 0 ? (
        <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-5">
          এখনো কোনো ফলাফল প্রকাশিত হয়নি।
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="print:hidden bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            পরীক্ষা
            <select className={`${inputCls} mt-1`} value={examKey} onChange={(e) => onExamChange(e.target.value)}>
              {exams.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label || `${x.term} ${x.year}`}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            শ্রেণি
            <select className={`${inputCls} mt-1`} value={cls} onChange={(e) => setCls(e.target.value)}>
              {(exam?.classes ?? []).map((c) => (
                <option key={c} value={c}>
                  শ্রেণি {bn(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            রোল নম্বর
            <input
              className={`${inputCls} mt-1`}
              inputMode="numeric"
              required
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              placeholder="যেমন: ১২"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            জন্ম তারিখ
            <input
              className={`${inputCls} mt-1`}
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold"
            >
              <Search className="w-4 h-4" />
              {busy ? "খোঁজা হচ্ছে…" : "ফলাফল দেখুন"}
            </button>
          </div>
        </form>
      )}

      {message && (
        <p className="print:hidden text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">{message}</p>
      )}

      {result && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </span>
              <div>
                <p className="font-bold text-slate-900">পানিপুর জেলা স্কুল</p>
                <p className="text-sm text-slate-600">{exam?.label}</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="print:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><dt className="text-slate-500">শিক্ষার্থীর নাম</dt><dd className="font-semibold">{result.name}</dd></div>
            <div><dt className="text-slate-500">শ্রেণি / রোল</dt><dd className="font-semibold">{bn(result.cls)} / {bn(result.roll)}</dd></div>
            <div><dt className="text-slate-500">পিতার নাম</dt><dd className="font-semibold">{result.father || "—"}</dd></div>
            <div><dt className="text-slate-500">মাতার নাম</dt><dd className="font-semibold">{result.mother || "—"}</dd></div>
          </dl>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left p-2.5 border-b">বিষয়</th>
                  <th className="p-2.5 border-b">পূর্ণমান</th>
                  <th className="p-2.5 border-b">প্রাপ্ত নম্বর</th>
                  <th className="p-2.5 border-b">গ্রেড</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-2.5">{r.n}</td>
                    <td className="p-2.5 text-center">{bn(r.max)}</td>
                    <td className="p-2.5 text-center">{bn(r.f)}</td>
                    <td className="p-2.5 text-center">{r.g}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">মোট নম্বর</p><p className="font-bold">{bn(result.tot)} / {bn(result.tm)}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{result.pri ? "গ্রেড" : "জিপিএ"}</p><p className="font-bold">{result.pri ? result.grade : bn(result.gpa.toFixed(2))}</p></div>
            {!result.pri && (
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">লেটার গ্রেড</p><p className="font-bold">{result.grade}</p></div>
            )}
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">মেধাস্থান</p><p className="font-bold">{bn(result.rank)} / {bn(result.rankOf)}</p></div>
          </div>

          <p className={`text-sm font-semibold ${result.pass ? "text-emerald-700" : "text-red-700"}`}>
            ফলাফল: {result.pass ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}
          </p>
          {result.note && <p className="text-sm text-slate-600">{result.note}</p>}
        </section>
      )}
    </div>
  );
}
