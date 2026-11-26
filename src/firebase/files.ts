import { doc, getDoc, setDoc } from "firebase/firestore";
import { centralDb } from "./rbac";

/* নোটিশের PDF/ছবি ফাইল: Firestore-এর site/file_<id> ডকুমেন্টে ভাগ করে রাখা হয় (আলাদা রুলস লাগে না)।
   পাবলিক দর্শক ফাইলটি শুধু ক্লিক করলেই নামে, হোম পেজ ধীর হয় না। */
const CHUNK = 700_000;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface AttachmentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("read-failed"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

export async function saveAttachment(file: File): Promise<AttachmentInfo> {
  if (file.size > MAX_FILE_BYTES) throw new Error("too-large");
  const dataUrl = await readAsDataUrl(file);
  const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const parts = Math.max(1, Math.ceil(dataUrl.length / CHUNK));
  for (let i = 0; i < parts; i++) {
    await setDoc(doc(centralDb, "site", `file_${id}_${i}`), { data: dataUrl.slice(i * CHUNK, (i + 1) * CHUNK) });
  }
  const type = file.type || "application/pdf";
  await setDoc(doc(centralDb, "site", `file_${id}`), { name: file.name, type, size: file.size, parts });
  return { id, name: file.name, type, size: file.size };
}

function dataUrlToBlob(dataUrl: string, type: string): Blob {
  const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

/* ক্লিকের সাথে সাথেই নতুন ট্যাব খোলা হয় (পপআপ-ব্লকার এড়াতে), ফাইল নামলে সেখানে দেখায় */
export async function openAttachment(id: string): Promise<void> {
  const w = window.open("about:blank", "_blank");
  try {
    const head = await getDoc(doc(centralDb, "site", `file_${id}`));
    if (!head.exists()) throw new Error("missing");
    const { parts, type } = head.data() as { parts: number; type: string };
    const snaps = await Promise.all(Array.from({ length: parts }, (_, i) => getDoc(doc(centralDb, "site", `file_${id}_${i}`))));
    const dataUrl = snaps.map((s) => String(s.data()?.data ?? "")).join("");
    const url = URL.createObjectURL(dataUrlToBlob(dataUrl, type));
    if (w) w.location.href = url;
    else window.location.href = url;
  } catch (e) {
    if (w) w.close();
    throw e;
  }
}
