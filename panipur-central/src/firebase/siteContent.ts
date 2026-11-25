import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { centralDb } from "./rbac";

/* ওয়েবসাইটের পাবলিক কনটেন্ট (নোটিশ, সংবাদ, শিক্ষক ও ছবি, রুটিন, গ্যালারি, সেটিংস) Firestore-এ রাখা হয়।
   ছবিসহ কনটেন্ট বড় হলে একাধিক ডকুমেন্টে ভাগ করে রাখা হয় (প্রতিটি ১ MB-এর নিচে)।
   শিক্ষার্থীর ব্যক্তিগত রেকর্ড (students, results) কখনো প্রকাশ করা হয় না। */
const PRIVATE_KEYS = ["students", "results"];
const CHUNK = 300_000; // অক্ষর; সবচেয়ে খারাপ ক্ষেত্রেও ডকুমেন্ট ~৯০০ KB
const MAX_TOTAL = 6_000_000;

export async function fetchSiteContent(): Promise<Record<string, unknown> | null> {
  const head = await getDoc(doc(centralDb, "site", "content"));
  if (!head.exists()) return null;
  const d = head.data();
  let raw = "";
  if (typeof d.json === "string") {
    raw = d.json; // আগের একক-ডকুমেন্ট ফরম্যাট
  } else if (typeof d.parts === "number") {
    const snaps = await Promise.all(
      Array.from({ length: d.parts }, (_, i) => getDoc(doc(centralDb, "site", `content_${i}`)))
    );
    raw = snaps.map((s) => String(s.data()?.json ?? "")).join("");
  } else {
    return null;
  }
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function publicJson(data: Record<string, unknown>): string {
  const pub: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (!PRIVATE_KEYS.includes(k)) pub[k] = v;
  }
  return JSON.stringify(pub);
}

export async function saveSiteContent(data: Record<string, unknown>): Promise<void> {
  const pub: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (!PRIVATE_KEYS.includes(k)) pub[k] = v;
  }
  const json = JSON.stringify(pub);
  if (json.length > MAX_TOTAL) {
    throw new Error("ছবিসহ কনটেন্ট খুব বড় — কিছু ছবি মুছুন বা ছোট ছবি দিন");
  }
  const parts = Math.max(1, Math.ceil(json.length / CHUNK));
  for (let i = 0; i < parts; i++) {
    await setDoc(doc(centralDb, "site", `content_${i}`), { json: json.slice(i * CHUNK, (i + 1) * CHUNK) });
  }
  // মূল ডকুমেন্ট সবার শেষে লেখা হয়, যাতে দর্শক অর্ধেক কনটেন্ট না দেখে
  await setDoc(doc(centralDb, "site", "content"), { parts, updatedAt: serverTimestamp() });
}
