import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export type UserRole = "super_admin" | "headmaster" | "assistant_headmaster" | "teacher";

export type ModuleKey =
  | "notices"
  | "academics"
  | "admission_portal"
  | "results_portal"
  | "tc_portal"
  | "question_paper_portal"
  | "rbac_users";

export interface RoleProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  allowedModules: ModuleKey[];
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  summary: string;
}

export const SUPER_ADMIN_EMAIL = "farhanrhyme21@outlook.com";
export const SUPER_ADMIN_UID = "u0n6HtKNJROkXNdhoEpcvAnh2yB2";

export const DEFAULT_ROLE_MODULES: Record<UserRole, ModuleKey[]> = {
  super_admin: [
    "notices",
    "academics",
    "admission_portal",
    "results_portal",
    "tc_portal",
    "question_paper_portal",
    "rbac_users",
  ],
  headmaster: [
    "notices",
    "academics",
    "admission_portal",
    "results_portal",
    "tc_portal",
    "question_paper_portal",
  ],
  assistant_headmaster: [
    "notices",
    "academics",
    "results_portal",
    "tc_portal",
    "question_paper_portal",
  ],
  teacher: [
    "academics",
    "results_portal",
    "question_paper_portal",
  ],
};

const centralFirebaseConfig = {
  apiKey: import.meta.env.VITE_CENTRAL_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_CENTRAL_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_CENTRAL_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_CENTRAL_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_CENTRAL_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_CENTRAL_FIREBASE_APP_ID || "",
};

const centralApp = getApps().length ? getApp() : initializeApp(centralFirebaseConfig);
export const centralAuth = getAuth(centralApp);
export const centralDb = getFirestore(centralApp);

export async function resolveUserProfile(user: User): Promise<RoleProfile> {
  const userRef = doc(centralDb, "users", user.uid);
  const snap = await getDoc(userRef);

  if (user.uid === SUPER_ADMIN_UID) {
    const profile: RoleProfile = {
      uid: user.uid,
      email: user.email || SUPER_ADMIN_EMAIL,
      name: snap.exists() && snap.data().name ? snap.data().name : "Super Admin",
      role: "super_admin",
      active: true,
      allowedModules: DEFAULT_ROLE_MODULES.super_admin,
    };
    if (!snap.exists()) {
      await setDoc(
        userRef,
        {
          email: profile.email,
          name: profile.name,
          role: "super_admin",
          active: true,
          allowedModules: profile.allowedModules,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    return profile;
  }

  if (snap.exists()) {
    const data = snap.data();
    const role: UserRole = data.role || "teacher";
    return {
      uid: user.uid,
      email: data.email || user.email || "",
      name: data.name || user.email || "Staff Member",
      role,
      active: data.active !== false,
      allowedModules:
        Array.isArray(data.allowedModules) && data.allowedModules.length > 0
          ? data.allowedModules
          : DEFAULT_ROLE_MODULES[role],
    };
  }

  return {
    uid: user.uid,
    email: user.email || "",
    name: user.email || "Unassigned User",
    role: "teacher",
    active: false,
    allowedModules: [],
  };
}

export async function loginWithEmailPass(email: string, password: string): Promise<RoleProfile> {
  const cred = await signInWithEmailAndPassword(centralAuth, email.trim(), password);
  return resolveUserProfile(cred.user);
}

export async function logoutUser(): Promise<void> {
  await signOut(centralAuth);
}

export function observeAuthProfile(cb: (profile: RoleProfile | null) => void): () => void {
  return onAuthStateChanged(centralAuth, async (user) => {
    if (!user) {
      cb(null);
      return;
    }
    const profile = await resolveUserProfile(user);
    cb(profile);
  });
}

export async function fetchNotices(): Promise<NoticeItem[]> {
  const snap = await getDocs(collection(centralDb, "notices"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: String(data.title || ""),
      date: String(data.date || ""),
      summary: String(data.summary || ""),
    };
  });
}

export async function createNotice(input: {
  title: string;
  date: string;
  summary: string;
}): Promise<void> {
  await addDoc(collection(centralDb, "notices"), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function removeNotice(id: string): Promise<void> {
  await deleteDoc(doc(centralDb, "notices", id));
}

export async function fetchAllRoleUsers(): Promise<RoleProfile[]> {
  const snap = await getDocs(collection(centralDb, "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    const role: UserRole = data.role || "teacher";
    return {
      uid: d.id,
      email: String(data.email || ""),
      name: String(data.name || ""),
      role,
      active: data.active !== false,
      allowedModules: Array.isArray(data.allowedModules)
        ? data.allowedModules
        : DEFAULT_ROLE_MODULES[role],
    };
  });
}

export async function saveRoleUser(params: {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
}): Promise<void> {
  const isSuper = params.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const roleToSave: UserRole = isSuper ? "super_admin" : params.role;
  await setDoc(
    doc(centralDb, "users", params.uid.trim()),
    {
      email: params.email.trim(),
      name: params.name.trim(),
      role: roleToSave,
      active: isSuper ? true : params.active,
      allowedModules: DEFAULT_ROLE_MODULES[roleToSave],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(centralAuth, email.trim());
}
