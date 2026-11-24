import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

/* ফলাফল পোর্টালের Firebase প্রজেক্ট (pzs-93c0b)। এখানে শুধু পড়া হয়, কিছু লেখা হয় না। */
const resultsFirebaseConfig = {
  apiKey: import.meta.env.VITE_RESULTS_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_RESULTS_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_RESULTS_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_RESULTS_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_RESULTS_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_RESULTS_FIREBASE_APP_ID || "",
};

const APP_NAME = "results";
const resultsApp = getApps().some((a) => a.name === APP_NAME)
  ? getApp(APP_NAME)
  : initializeApp(resultsFirebaseConfig, APP_NAME);
const resultsDb = getFirestore(resultsApp);

export interface PublishedExam {
  key: string;
  year: string;
  term: string;
  label: string;
  classes: string[];
}

export interface ResultRow {
  n: string;
  max: number;
  f: number;
  g: string;
}

export interface PublishedResult {
  year: string;
  term: string;
  cls: string;
  roll: number;
  name: string;
  father: string;
  mother: string;
  rows: ResultRow[];
  tot: number;
  tm: number;
  gpa: number;
  grade: string;
  pass: boolean;
  pri: boolean;
  rank: number;
  rankOf: number;
  note: string;
}

interface MetaExam {
  year?: unknown;
  term?: unknown;
  label?: unknown;
  classes?: unknown;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toLatinDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* শিক্ষকরা যেসব পরীক্ষার ফলাফল প্রকাশ করেছেন তার তালিকা */
export async function fetchPublishedExams(): Promise<PublishedExam[]> {
  const snap = await getDoc(doc(resultsDb, "publishedMeta", "index"));
  if (!snap.exists()) return [];
  const exams = (snap.data().exams ?? {}) as Record<string, MetaExam>;
  return Object.entries(exams)
    .map(([key, e]) => ({
      key,
      year: String(e.year ?? ""),
      term: String(e.term ?? ""),
      label: String(e.label ?? ""),
      classes: Array.isArray(e.classes)
        ? (e.classes as unknown[]).map(String).sort((a, b) => Number(a) - Number(b))
        : [],
    }))
    .filter((e) => e.year && e.term && e.classes.length > 0)
    .sort((a, b) => b.year.localeCompare(a.year));
}

/* আইডি = SHA-256(বছর|টার্ম|শ্রেণি|রোল|জন্মতারিখ) — publish.js-এর সাথে হুবহু এক */
export async function fetchPublishedResult(
  exam: PublishedExam,
  cls: string,
  rollInput: string,
  dob: string
): Promise<PublishedResult | null> {
  const roll = parseInt(toLatinDigits(rollInput.trim()), 10);
  if (!Number.isFinite(roll) || !dob) return null;
  const id = await sha256([exam.year, exam.term, String(cls), String(roll), dob].join("|"));
  const snap = await getDoc(doc(resultsDb, "publishedResults", id));
  return snap.exists() ? (snap.data() as PublishedResult) : null;
}

export interface SchoolMeta {
  school: string;
  slogan: string;
  addr: string;
  eiin: string;
  upazila: string;
  district: string;
  head: string;
  asst: string;
  year: string;
  classTeachers: Record<string, { name: string }>;
  counts: Record<string, number>;
}

/* ফলাফল পোর্টাল নিজে থেকে যে স্কুল-তথ্য প্রকাশ করে (স্বাক্ষর, মোবাইল ও শিক্ষার্থীর নাম বাদে) */
export async function fetchSchoolMeta(): Promise<SchoolMeta | null> {
  const snap = await getDoc(doc(resultsDb, "publishedMeta", "school"));
  return snap.exists() ? (snap.data() as SchoolMeta) : null;
}
