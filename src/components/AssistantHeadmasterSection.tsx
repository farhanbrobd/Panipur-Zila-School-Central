import { UserCheck, Users } from "lucide-react";

interface Props {
  lang: "bn" | "en";
  settings: Record<string, string | undefined>;
}

const real = (v?: string) => !!v && !String(v).trim().startsWith("[");

export function AssistantHeadmasterSection({ lang, settings }: Props) {
  const bn = lang === "bn";
  const name = bn ? settings.asstNameBn : settings.asstNameEn || settings.asstNameBn;
  const msg = bn ? settings.asstMessageBn : settings.asstMessageEn || settings.asstMessageBn;
  if (!real(name) && !real(msg)) return null;

  return (
    <section className="bg-slate-50 border-t border-slate-200 py-12 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0">
          {settings.asstPhoto ? (
            <img src={settings.asstPhoto} alt="" className="w-28 h-28 rounded-2xl object-cover border-2 border-emerald-500" />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-slate-100 border-2 border-emerald-500/40 flex items-center justify-center">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#0F2942] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            {bn ? "সহকারী প্রধান শিক্ষকের বাণী" : "Message from the Assistant Headmaster"}
          </h3>
          {real(name) && <p className="font-bold text-slate-900">{name}</p>}
          {real(settings.asstQualification) && <p className="text-xs text-slate-500">{settings.asstQualification}</p>}
          {real(msg) && <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-1">{msg}</p>}
        </div>
      </div>
    </section>
  );
}
