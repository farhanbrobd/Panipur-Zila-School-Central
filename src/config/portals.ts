export interface ServicePortal {
  id: "admission" | "results" | "tc" | "question_paper";
  titleBn: string;
  subtitleBn: string;
  descriptionBn: string;
  url: string;
  ctaLabelBn: string;
}

export interface GovLinkItem {
  labelBn: string;
  url: string;
}

export const PORTAL_URLS = {
  admission: "https://farhanbrobd.github.io/admission-pzs/",
  resultAndTcAndQp: "https://farhanbrobd.github.io/Panipur-Zila-school/",
} as const;

export const ONLINE_SERVICES: ServicePortal[] = [
  {
    id: "admission",
    titleBn: "ভর্তি পোর্টাল (Admission)",
    subtitleBn: "অনলাইন ভর্তি আবেদন ও প্রবেশপত্র",
    descriptionBn:
      "অনলাইনে ভর্তি আবেদন, ভর্তি ফি জমা, প্রবেশপত্র ডাউনলোড ও আবেদনের অবস্থা জানতে ভর্তি পোর্টালে যান।",
    url: PORTAL_URLS.admission,
    ctaLabelBn: "ভর্তি পোর্টালে যান",
  },
  {
    id: "results",
    titleBn: "ফলাফল প্রস্তুত (শিক্ষকদের জন্য)",
    subtitleBn: "নম্বর এন্ট্রি, এডমিট কার্ড ও ট্রান্সক্রিপ্ট",
    descriptionBn:
      "শিক্ষকরা লগইন করে পরীক্ষার নম্বর এন্ট্রি, ফলাফল প্রস্তুত, এডমিট কার্ড ও ট্রান্সক্রিপ্ট তৈরি করতে পারবেন।",
    url: PORTAL_URLS.resultAndTcAndQp,
    ctaLabelBn: "ফলাফল পোর্টালে যান",
  },
  {
    id: "tc",
    titleBn: "টিসি ও প্রত্যয়নপত্র পোর্টাল (TC & Certificate)",
    subtitleBn: "ছাড়পত্র ও প্রত্যয়নপত্র সেবা",
    descriptionBn:
      "টিসি (TC) ও প্রত্যয়নপত্র সংক্রান্ত সেবার জন্য সংযুক্ত পোর্টালে প্রবেশ করুন।",
    url: PORTAL_URLS.resultAndTcAndQp,
    ctaLabelBn: "টিসি পোর্টালে যান",
  },
  {
    id: "question_paper",
    titleBn: "প্রশ্নপত্র প্রস্তুত পোর্টাল (Question Paper)",
    subtitleBn: "প্রশ্নপত্র তৈরি ও প্রিন্ট ট্যাব",
    descriptionBn:
      "সৃজনশীল ও বহুনির্বাচনি প্রশ্নপত্র প্রস্তুত ও সেট তৈরির জন্য প্রশ্নপত্র ট্যাব/পোর্টালে যান।",
    url: PORTAL_URLS.resultAndTcAndQp,
    ctaLabelBn: "প্রশ্নপত্র ট্যাবে যান",
  },
];

export const GOV_LINKS: GovLinkItem[] = [
  { labelBn: "শিক্ষা মন্ত্রণালয় (MoE)", url: "https://moedu.gov.bd" },
  { labelBn: "মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (DSHE)", url: "https://dshe.gov.bd" },
  { labelBn: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)", url: "https://nctb.gov.bd" },
  { labelBn: "শিক্ষক বাতায়ন (Teachers Portal)", url: "https://teachers.gov.bd" },
];