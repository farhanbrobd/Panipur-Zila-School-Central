import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { centralDb } from "./rbac";

/* ওয়েবসাইটের পাবলিক কনটেন্ট (নোটিশ, সংবাদ, শিক্ষক, রুটিন, গ্যালারি, সেটিংস) Firestore-এ একটি ডকুমেন্টে থাকে।
   শিক্ষার্থীর ব্যক্তিগত রেকর্ড (students, results) কখনো প্রকাশ করা হয় না। */
const PRIVATE_KEYS = ["students", "results"];

export async function fetchSiteContent(): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(centralDb, "site", "content"));
  if (!snap.exists()) return null;
  const raw = snap.data().json;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function saveSiteContent(data: Record<string, unknown>): Promise<void> {
  const pub: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (!PRIVATE_KEYS.includes(k)) pub[k] = v;
  }
  const json = JSON.stringify(pub);
  if (new TextEncoder().encode(json).length > 1_000_000) {
    throw new Error("কনটেন্ট ১ MB সীমার চেয়ে বড়");
  }
  await setDoc(doc(centralDb, "site", "content"), { json, updatedAt: serverTimestamp() });
}
