import React, { useEffect, useState } from "react";
import { ShieldCheck, LogOut, ExternalLink, BellRing, Trash2, UserPlus } from "lucide-react";
import {
  RoleProfile,
  UserRole,
  NoticeItem,
  loginWithEmailPass,
  logoutUser,
  observeAuthProfile,
  createNotice,
  removeNotice,
  fetchAllRoleUsers,
  saveRoleUser,
  SUPER_ADMIN_EMAIL,
} from "../firebase/rbac";
import { ONLINE_SERVICES } from "../config/portals";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  headmaster: "Headmaster",
  assistant_headmaster: "Assistant Headmaster",
  teacher: "Teacher",
};

interface Props {
  notices: NoticeItem[];
  onNoticesUpdated: () => Promise<void>;
}

export const CentralAdminPanel: React.FC<Props> = ({ notices, onNoticesUpdated }) => {
  const [profile, setProfile] = useState<RoleProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [noticeSummary, setNoticeSummary] = useState("");
  const [noticeStatus, setNoticeStatus] = useState("");

  const [roleUsers, setRoleUsers] = useState<RoleProfile[]>([]);
  const [targetUid, setTargetUid] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetRole, setTargetRole] = useState<UserRole>("teacher");
  const [roleStatus, setRoleStatus] = useState("");

  useEffect(() => {
    const unsub = observeAuthProfile(async (p) => {
      setProfile(p);
      setCheckingAuth(false);
      if (p?.role === "super_admin") {
        setRoleUsers(await fetchAllRoleUsers());
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setSubmittingLogin(true);
    try {
      const p = await loginWithEmailPass(email, password);
      setProfile(p);
      setEmail("");
      setPassword("");
      if (p.role === "super_admin") {
        setRoleUsers(await fetchAllRoleUsers());
      }
    } catch {
      setAuthError("প্রমাণীকরণ ব্যর্থ হয়েছে। অনুমোদিত ইমেইল ও পাসওয়ার্ড ব্যবহার করুন।");
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !profile.allowedModules.includes("notices")) return;
    await createNotice({
      title: noticeTitle.trim(),
      date: noticeDate.trim(),
      summary: noticeSummary.trim(),
    });
    setNoticeTitle("");
    setNoticeDate("");
    setNoticeSummary("");
    setNoticeStatus("নোটিশ সংরক্ষিত হয়েছে।");
    await onNoticesUpdated();
  };

  const handleDeleteNotice = async (id: string) => {
    if (!profile || !profile.allowedModules.includes("notices")) return;
    await removeNotice(id);
    await onNoticesUpdated();
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== "super_admin") return;
    await saveRoleUser({
      uid: targetUid,
      email: targetEmail,
      name: targetName,
      role: targetRole,
      active: true,
    });
    setTargetUid("");
    setTargetEmail("");
    setTargetName("");
    setRoleStatus("RBAC রোল আপডেট করা হয়েছে।");
    setRoleUsers(await fetchAllRoleUsers());
  };

  if (checkingAuth) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl border text-center text-slate-600">
        অ্যাডমিন সেশন যাচাই করা হচ্ছে...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2.5 mb-5">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
          <h2 className="text-xl font-bold text-slate-900">Central Admin Sign In</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          {authError && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {authError}
            </p>
          )}
          <button
            type="submit"
            disabled={submittingLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold transition"
          >
            {submittingLogin ? "যাচাই হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>
      </div>
    );
  }

  if (!profile.active) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border text-center space-y-4">
        <p className="text-rose-600 font-semibold">
          আপনার অ্যাকাউন্টটি সক্রিয় নয় অথবা এখনো কোনো রোল নির্ধারিত হয়নি।
        </p>
        <button
          onClick={logoutUser}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium"
        >
          লগআউট
        </button>
      </div>
    );
  }

  const serviceModuleMap = {
    admission: "admission_portal",
    results: "results_portal",
    tc: "tc_portal",
    question_paper: "question_paper_portal",
  } as const;

  const permittedPortals = ONLINE_SERVICES.filter((item) =>
    profile.allowedModules.includes(serviceModuleMap[item.id])
  );

  return (
    <div className="max-w-6xl mx-auto my-10 px-4 space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            RBAC Role: {ROLE_LABELS[profile.role]}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-slate-600">{profile.email}</p>
        </div>
        <button
          onClick={logoutUser}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          লগআউট
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">অনুমোদিত পোর্টাল অ্যাক্সেস</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permittedPortals.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-bold text-slate-900">{p.titleBn}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{p.subtitleBn}</p>
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shrink-0"
              >
                খুলুন <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {profile.allowedModules.includes("notices") && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">নোটিশ প্রকাশ ও ব্যবস্থাপনা</h3>
          </div>
          <form onSubmit={handleAddNotice} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="নোটিশের শিরোনাম"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
            <input
              type="date"
              required
              value={noticeDate}
              onChange={(e) => setNoticeDate(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold"
            >
              নোটিশ যোগ করুন
            </button>
            <textarea
              required
              rows={2}
              value={noticeSummary}
              onChange={(e) => setNoticeSummary(e.target.value)}
              placeholder="নোটিশের সংক্ষিপ্ত বিবরণ"
              className="md:col-span-3 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </form>
          {noticeStatus && <p className="text-sm text-emerald-700 font-medium">{noticeStatus}</p>}

          <div className="divide-y border rounded-xl">
            {notices.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">বর্তমানে কোনো নোটিশ নেই।</p>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{n.title}</div>
                    <div className="text-xs text-slate-500">{n.date}</div>
                    <p className="text-sm text-slate-700 mt-1">{n.summary}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    aria-label="নোটিশ মুছুন"
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {profile.role === "super_admin" && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">
              RBAC User & Role Assignment (Primary Super Admin: {SUPER_ADMIN_EMAIL})
            </h3>
          </div>

          <form onSubmit={handleSaveRole} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              required
              value={targetUid}
              onChange={(e) => setTargetUid(e.target.value)}
              placeholder="Firebase Auth UID"
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
            <input
              type="email"
              required
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="ব্যবহারকারীর ইমেইল"
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
            <input
              type="text"
              required
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="নাম ও পদবি"
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as UserRole)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm"
            >
              <option value="super_admin">Super Admin</option>
              <option value="headmaster">Headmaster</option>
              <option value="assistant_headmaster">Assistant Headmaster</option>
              <option value="teacher">Teacher</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
            >
              রোল সংরক্ষণ
            </button>
          </form>

          {roleStatus && <p className="text-sm text-emerald-700 font-medium">{roleStatus}</p>}

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3">নাম</th>
                  <th className="p-3">ইমেইল</th>
                  <th className="p-3">UID</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {roleUsers.map((u) => (
                  <tr key={u.uid}>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 font-mono text-xs">{u.uid}</td>
                    <td className="p-3 font-semibold text-emerald-700">{ROLE_LABELS[u.role]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};