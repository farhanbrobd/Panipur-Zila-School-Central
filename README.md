# পানিপুর জেলা স্কুল — Central Hub

React + Vite + Tailwind + Firebase (প্রজেক্ট: central-hub-pzs)।

## লোকালে চালানো
    npm install
    cp .env.example .env
    npm run dev
    npm run build      # dist/ তৈরি হয়
    npm run typecheck  # ঐচ্ছিক: টাইপ পরীক্ষা

## Netlify
Build command: npm run build · Publish directory: dist
Environment variables: .env.example-এর ৬টি VITE_CENTRAL_* মান।

## Firestore Rules
central-hub.firestore.rules ফাইলের লেখা Firebase Console → Firestore → Rules-এ বসান।

## শিক্ষার্থীদের ফলাফল
1. results-project.rules-addition.txt অনুযায়ী pzs-93c0b-এর Rules-এ ৩ লাইন যোগ করুন।
2. result-portal-addon/publish.js ফলাফল পোর্টালের index.html-এর পাশে রাখুন এবং qpaper.js-এর পরে `<script src="publish.js"></script>` যোগ করুন।
3. পোর্টালের "এক নজরে" ট্যাবে "শিক্ষার্থীদের জন্য প্রকাশ" চাপুন।

## নোট
- মূল স্কুল ওয়েবসাইট: src/SchoolSite.tsx (১৮ পেজ, বাংলা/ইংরেজি)। অ্যাডমিন লগইন Firebase দিয়ে; "লাইভে প্রকাশ করুন" চাপলে কনটেন্ট Firestore (site/content)-এ যায়।
- ভর্তি, ফলাফল/টিসি/প্রশ্নপত্র পোর্টাল এই প্রজেক্টের অংশ নয় — শুধু লিংক দেওয়া আছে (src/config/portals.ts)।
- .env GitHub-এ যাবে না (.gitignore-এ আছে)।
