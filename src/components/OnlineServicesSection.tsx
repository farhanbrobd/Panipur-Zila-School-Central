import { ExternalLink, GraduationCap, Award, ClipboardList, FileCheck, FileText, type LucideIcon } from "lucide-react";
import { ONLINE_SERVICES } from "../config/portals";

interface Props {
  lang: "bn" | "en";
  navigateTo: (page: string) => void;
  mode?: "all" | "admission";
}

const ICONS: Record<string, LucideIcon> = {
  admission: GraduationCap,
  student_result: Award,
  results: ClipboardList,
  tc: FileCheck,
  question_paper: FileText,
};

const EN: Record<string, { title: string; desc: string; cta: string }> = {
  admission: { title: "Online Admission", desc: "Apply online, pay the admission fee, download the admit card and check your application status.", cta: "Visit Portal" },
  student_result: { title: "Student Result", desc: "Students can view published exam results using class, roll number and date of birth.", cta: "View Result" },
  results: { title: "Teacher Result Management", desc: "For teachers: enter marks, prepare results, admit cards and transcripts (login required).", cta: "Visit Portal" },
  tc: { title: "TC & Certificate", desc: "Teachers prepare Transfer Certificates and testimonials in the connected portal.", cta: "Visit Portal" },
  question_paper: { title: "Question Paper Preparation", desc: "Teachers prepare and print question papers from the question paper tab of the portal.", cta: "Visit Portal" },
};

export function OnlineServicesSection({ lang, navigateTo, mode = "all" }: Props) {
  const bn = lang === "bn";
  const admission = ONLINE_SERVICES.find((s) => s.id === "admission")!;

  const items = [
    { id: "admission", title: bn ? "অনলাইন ভর্তি" : EN.admission.title, desc: bn ? admission.descriptionBn : EN.admission.desc, cta: bn ? "ভর্তি পোর্টালে যান" : EN.admission.cta, url: admission.url },
    { id: "student_result", title: bn ? "শিক্ষার্থীদের ফলাফল" : EN.student_result.title, desc: bn ? "রোল নম্বর ও জন্ম তারিখ দিয়ে প্রকাশিত পরীক্ষার ফলাফল দেখুন।" : EN.student_result.desc, cta: bn ? "ফলাফল দেখুন" : EN.student_result.cta, url: "" },
    ...ONLINE_SERVICES.filter((s) => s.id !== "admission").map((s) => ({
      id: s.id,
      title: bn ? s.titleBn : EN[s.id].title,
      desc: bn ? s.descriptionBn : EN[s.id].desc,
      cta: bn ? s.ctaLabelBn : EN[s.id].cta,
      url: s.url,
    })),
  ];
  const shown = mode === "admission" ? items.filter((i) => i.id === "admission") : items;

  return (
    <section className="bg-white border-t border-slate-200 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0F2942]">
            {mode === "admission" ? (bn ? "অনলাইন ভর্তি" : "Online Admission") : bn ? "অনলাইন সেবা" : "Online Services"}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {bn ? "প্রয়োজনীয় সেবার জন্য নিচের পোর্টালে প্রবেশ করুন।" : "Use the portals below for the service you need."}
          </p>
        </div>
        <div className={`grid gap-5 ${mode === "admission" ? "grid-cols-1 max-w-xl" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
          {shown.map((s) => {
            const Icon = ICONS[s.id] ?? FileText;
            return (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <span className="w-11 h-11 rounded-xl bg-[#0F2942] text-emerald-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold">
                    <span>{s.cta}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button onClick={() => navigateTo("exam-results")} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold">
                    {s.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
