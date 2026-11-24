import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Home,
  Layers,
  Landmark,
  Bell,
} from "lucide-react";
import { ONLINE_SERVICES, GOV_LINKS } from "./config/portals";
import { CentralAdminPanel } from "./components/CentralAdminPanel";
import { NoticeItem, fetchNotices } from "./firebase/rbac";

type ActiveTab = "home" | "services" | "admin";

export default function App() {
  const [tab, setTab] = useState<ActiveTab>("home");
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  const loadNotices = useCallback(async () => {
    try {
      const list = await fetchNotices();
      setNotices(list);
    } catch {
      setNotices([]);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => setTab("home")}
            className="flex items-center gap-2.5 text-left font-bold text-slate-900"
          >
            <span className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span>পানিপুর জেলা স্কুল</span>
          </button>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setTab("home")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                tab === "home"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>হোম</span>
            </button>
            <button
              onClick={() => setTab("services")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                tab === "services"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Online Services</span>
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                tab === "admin"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-900/90 hover:bg-slate-900 text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {tab === "admin" ? (
          <CentralAdminPanel notices={notices} onNoticesUpdated={loadNotices} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
            {tab === "home" && (
              <section className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 sm:p-12 shadow-sm">
                <p className="text-emerald-200 text-sm font-semibold mb-2">
                  কেন্দ্রীয় পোর্টাল হাব (Central Hub)
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-snug mb-4">
                  পানিপুর জেলা স্কুলের সকল ডিজিটাল সেবা এক প্ল্যাটফর্মে
                </h1>
                <p className="text-emerald-100 max-w-2xl text-sm sm:text-base mb-7">
                  ভর্তি, ফলাফল, টিসি ও প্রত্যয়নপত্র এবং প্রশ্নপত্র প্রস্তুত পোর্টালসমূহে সরাসরি প্রবেশ করুন।
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={ONLINE_SERVICES[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50"
                  >
                    ভর্তি পোর্টাল <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={ONLINE_SERVICES[1].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700/80 border border-emerald-400/40 text-white font-semibold text-sm hover:bg-emerald-700"
                  >
                    ফলাফল ও টিসি/প্রশ্নপত্র পোর্টাল <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </section>
            )}

            <section className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Online Services</h2>
                <p className="text-sm text-slate-600 mt-1">
                  সংশ্লিষ্ট পোর্টালসমূহের সরাসরি লিংক নিচে দেওয়া হলো:
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ONLINE_SERVICES.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-5 shadow-2xs"
                  >
                    <div className="space-y-2">
                      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        {srv.subtitleBn}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">{srv.titleBn}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{srv.descriptionBn}</p>
                    </div>
                    <div>
                      <a
                        href={srv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition"
                      >
                        <span>{srv.ctaLabelBn}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-700" />
                <h2 className="text-xl font-bold text-slate-900">নোটিশ বোর্ড</h2>
              </div>
              {notices.length === 0 ? (
                <p className="text-sm text-slate-500">
                  কোনো পাবলিক নোটিশ প্রকাশিত হয়নি বা Firestore `notices` সংযোগের অপেক্ষায় আছে।
                </p>
              ) : (
                <div className="space-y-3">
                  {notices.map((n) => (
                    <div key={n.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900">{n.title}</h3>
                        <span className="text-xs text-slate-500">{n.date}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{n.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-700" />
                <h2 className="text-xl font-bold text-slate-900">গুরুত্বপূর্ণ সরকারি ওয়েবসাইট</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {GOV_LINKS.map((gov) => (
                  <a
                    key={gov.url}
                    href={gov.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition flex items-center justify-between gap-2 text-sm font-semibold text-slate-800"
                  >
                    <span>{gov.labelBn}</span>
                    <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-sm text-slate-600">
        পানিপুর জেলা স্কুল — Central Hub | ভর্তি, ফলাফল, টিসি ও প্রশ্নপত্র পোর্টাল সংযুক্ত
      </footer>
    </div>
  );
}