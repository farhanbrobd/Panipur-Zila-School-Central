import { useState, type FormEvent } from "react";
import { GraduationCap, AlertCircle } from "lucide-react";
import { loginWithEmailPass, logoutUser, resetPassword } from "../firebase/rbac";

export const ADMIN_ROLES = ["super_admin", "headmaster", "assistant_headmaster"];

interface Props {
  lang: "bn" | "en";
  setLang: (l: "bn" | "en") => void;
  onSuccess: () => void;
  onBack: () => void;
}

export function FirebaseAdminLogin({ lang, setLang, onSuccess, onBack }: Props) {
  const bn = lang === "bn";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const p = await loginWithEmailPass(email, password);
      if (p.active && ADMIN_ROLES.includes(p.role)) {
        onSuccess();
      } else {
        await logoutUser();
        setError(bn ? "এই অ্যাকাউন্টের অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।" : "This account is not allowed to access the admin panel.");
      }
    } catch {
      setError(bn ? "ইমেইল বা পাসওয়ার্ড ভুল।" : "Incorrect email or password.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError(bn ? "আগে ইমেইল লিখুন।" : "Enter your email first.");
      return;
    }
    try {
      await resetPassword(email);
      setInfo(bn ? "পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে।" : "Password reset link sent to your email.");
    } catch {
      setError(bn ? "রিসেট লিংক পাঠানো যায়নি।" : "Could not send reset link.");
    }
  };

  const input =
    "w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#091B2C] via-[#0F2942] to-[#0A3A3A] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-[#0F2942] text-white p-6 text-center">
          <GraduationCap className="w-14 h-14 mx-auto mb-3 text-emerald-400" />
          <h2 className="text-xl font-bold">{bn ? "অ্যাডমিন প্যানেল লগইন" : "Admin Portal Login"}</h2>
          <p className="text-xs text-emerald-300 mt-1">পানিপুর জেলা স্কুল (Panipur Zila School)</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">{info}</div>
          )}
          <label className="block text-xs font-bold text-slate-700">
            {bn ? "ইমেইল" : "Email"}
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} mt-1`} />
          </label>
          <label className="block text-xs font-bold text-slate-700">
            {bn ? "পাসওয়ার্ড" : "Password"}
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} mt-1`} />
          </label>
          <button type="submit" disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
            {busy ? (bn ? "যাচাই হচ্ছে…" : "Signing in…") : bn ? "লগইন করুন" : "Login"}
          </button>
          <div className="flex items-center justify-between text-xs">
            <button type="button" onClick={reset} className="text-emerald-700 hover:underline">
              {bn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
            </button>
            <button type="button" onClick={() => setLang(bn ? "en" : "bn")} className="text-slate-600 hover:underline">
              {bn ? "English" : "বাংলা"}
            </button>
          </div>
          <button type="button" onClick={onBack} className="w-full text-xs text-slate-500 hover:text-slate-800">
            ← {bn ? "ওয়েবসাইটে ফিরুন" : "Back to website"}
          </button>
        </form>
      </div>
    </div>
  );
}
