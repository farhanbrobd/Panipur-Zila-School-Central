import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

/* ভর্তি ওয়েবসাইটের Firebase প্রজেক্ট। এখানে শুধু পড়া হয় (settings কালেকশন সবার জন্য পাবলিক); কিছু লেখা বা বদলানো হয় না। */
const admissionConfig = {
  apiKey: import.meta.env.VITE_ADMISSION_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_ADMISSION_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_ADMISSION_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_ADMISSION_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_ADMISSION_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_ADMISSION_FIREBASE_APP_ID || "",
};

const APP_NAME = "admission";
const app = getApps().some((a) => a.name === APP_NAME) ? getApp(APP_NAME) : initializeApp(admissionConfig, APP_NAME);
const db = getFirestore(app);

export interface AdmissionPerson {
  name?: string;
  desig?: string;
  text?: string;
  photo?: string;
}

export interface AdmissionData {
  logo: string;
  head: AdmissionPerson;
  asst: AdmissionPerson;
}

export async function fetchAdmissionData(): Promise<AdmissionData> {
  const [m, b] = await Promise.all([getDoc(doc(db, "settings", "messages")), getDoc(doc(db, "settings", "branding"))]);
  const md = m.exists() ? m.data() : {};
  const bd = b.exists() ? b.data() : {};
  return {
    logo: String(bd.logo || ""),
    head: (md.head || {}) as AdmissionPerson,
    asst: (md.asst || {}) as AdmissionPerson,
  };
}
