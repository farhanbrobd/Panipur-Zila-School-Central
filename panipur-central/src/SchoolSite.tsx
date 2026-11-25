// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Globe, Menu, X, ChevronDown, Bell, Calendar, BookOpen,
  Users, Award, Image as ImageIcon, Video, Phone, Mail, MapPin,
  Facebook, ExternalLink, Download, Printer, Shield, Lock, LogOut,
  Plus, Edit2, Trash2, CheckCircle, AlertCircle, FileText, GraduationCap,
  Building2, History, Target, UserCheck, ClipboardList, Clock, FileCheck,
  Database, Upload, RefreshCw, Eye, ArrowRight, Sparkles, Home as HomeIcon,
  Info, Layers, HelpCircle, Send, ChevronRight
} from 'lucide-react';
import { ResultLookup } from './components/ResultLookup';
import { ImageUploadField } from './components/ImageUploadField';
import { fetchSchoolMeta } from './firebase/results';
import { fetchAdmissionData } from './firebase/admission';
import { AssistantHeadmasterSection } from './components/AssistantHeadmasterSection';
import { SystemCheck } from './components/SystemCheck';
import { OnlineServicesSection } from './components/OnlineServicesSection';
import { CentralAdminPanel } from './components/CentralAdminPanel';
import { FirebaseAdminLogin, ADMIN_ROLES } from './components/FirebaseAdminLogin';
import { observeAuthProfile, logoutUser } from './firebase/rbac';
import { fetchSiteContent, saveSiteContent, publicJson } from './firebase/siteContent';

// ============================================================================
// BILINGUAL DICTIONARY & TRANSLATIONS (বাংলা / English)
// ============================================================================
const TRANSLATIONS = {
  bn: {
    langName: 'English',
    switchLabel: 'English',
    govHeader: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর',
    eiinLabel: 'EIIN:',
    estdLabel: 'স্থাপিত:',
    searchPlaceholder: 'নোটিশ, রুটিন, সংবাদ বা পেজ খুঁজুন...',
    adminLogin: 'অ্যাডমিন লগইন',
    adminPanel: 'অ্যাডমিন প্যানেল',
    logout: 'লগআউট',
    // Navigation
    navHome: 'হোম',
    navAboutGroup: 'স্কুল পরিচিতি',
    navAbout: 'স্কুল সম্পর্কে',
    navHistory: 'প্রতিষ্ঠানের ইতিহাস',
    navHeadmaster: 'প্রধান শিক্ষকের বাণী',
    navMission: 'লক্ষ্য ও উদ্দেশ্য',
    navFacilities: 'অবকাঠামো ও সুবিধাসমূহ',
    navAcademicGroup: 'একাডেমিক',
    navAcademicInfo: 'একাডেমিক তথ্য',
    navClassRoutine: 'ক্লাস রুটিন',
    navExamRoutine: 'পরীক্ষার রুটিন',
    navExamResults: 'পরীক্ষার ফলাফল',
    navAdmission: 'ভর্তি তথ্য',
    navAdminGroup: 'প্রশাসন ও শিক্ষার্থী',
    navTeachers: 'শিক্ষক ও কর্মচারী',
    navStudents: 'শিক্ষার্থী তথ্য',
    navNotice: 'নোটিশ বোর্ড',
    navNews: 'সংবাদ ও ইভেন্ট',
    navGalleryGroup: 'গ্যালারি',
    navPhotoGallery: 'ফটো গ্যালারি',
    navVideoGallery: 'ভিডিও গ্যালারি',
    navContact: 'যোগাযোগ',
    // Home Sections
    latestNoticeTicker: 'সর্বশেষ নোটিশ:',
    exploreAcademics: 'একাডেমিক তথ্য দেখুন',
    checkResults: 'ফলাফল অনুসন্ধান',
    admissionOpen: 'ভর্তি তথ্য',
    quickStatsTitle: 'এক নজরে পানিপুর জেলা স্কুল',
    statStudents: 'মোট শিক্ষার্থী',
    statTeachers: 'শিক্ষক ও কর্মচারী',
    statPassRate: 'পাসের হার',
    statEstablished: 'স্থাপিত সাল',
    headmasterTitle: 'প্রধান শিক্ষকের শুভেচ্ছা বাণী',
    readMore: 'বিস্তারিত পড়ুন',
    noticeBoardTitle: 'নোটিশ বোর্ড',
    viewAllNotices: 'সকল নোটিশ দেখুন',
    latestBadge: 'সর্বশেষ',
    downloadPdf: 'পিডিএফ / প্রিন্ট',
    newsEventsTitle: 'সর্বশেষ সংবাদ ও ঘোষণা',
    viewAllNews: 'সকল সংবাদ দেখুন',
    teachersPreviewTitle: 'সম্মানিত শিক্ষকবৃন্দ',
    viewAllTeachers: 'সকল শিক্ষক ও কর্মচারী',
    achievementsTitle: 'অর্জন ও সাফল্য',
    galleryPreviewTitle: 'ফটো ও ভিডিও গ্যালারি',
    importantLinksTitle: 'গুরুত্বপূর্ণ শিক্ষাবিষয়ক লিংক',
    contactFooterTitle: 'যোগাযোগের ঠিকানা',
    quickLinksTitle: 'দ্রুত লিংকসমূহ',
    // Forms & Tables
    selectClass: 'শ্রেণি নির্বাচন করুন',
    selectSection: 'শাখা নির্বাচন করুন',
    selectExam: 'পরীক্ষার নাম নির্বাচন করুন',
    enterRollOrId: 'রোল নম্বর বা Student ID লিখুন',
    searchResultBtn: 'ফলাফল দেখুন',
    printSheet: 'প্রিন্ট / ডাউনলোড করুন',
    noDataPlaceholder: 'কোনো তথ্য যুক্ত করা হয়নি। অ্যাডমিন প্যানেল থেকে তথ্য যুক্ত করুন।',
    editableHint: 'অ্যাডমিন প্যানেল থেকে সম্পাদনাযোগ্য',
    // Classes
    class6: '৬ষ্ঠ শ্রেণি',
    class7: '৭ম শ্রেণি',
    class8: '৮ম শ্রেণি',
    class9: '৯ম শ্রেণি',
    class10: '১০ম শ্রেণি',
    allClasses: 'সকল শ্রেণি',
    // Exams
    halfYearly: 'অর্ধবার্ষিক পরীক্ষা',
    annualExam: 'বার্ষিক পরীক্ষা',
    preTest: 'প্রাক-নির্বাচনী পরীক্ষা',
    testExam: 'নির্বাচনী পরীক্ষা',
    // Result Labels
    studentName: 'শিক্ষার্থীর নাম',
    studentId: 'Student ID',
    rollNo: 'রোল নম্বর',
    group: 'বিভাগ',
    academicYear: 'শিক্ষাবর্ষ',
    subject: 'বিষয়',
    marks: 'প্রাপ্ত নম্বর',
    grade: 'লেটার গ্রেড',
    gpa: 'জিপিএ (GPA)',
    totalMarks: 'মোট নম্বর',
    resultStatus: 'ফলাফল',
    passed: 'উত্তীর্ণ (Passed)',
    failed: 'অকৃতকার্য (Failed)',
  },
  en: {
    langName: 'বাংলা',
    switchLabel: 'বাংলা',
    govHeader: 'Government of the People’s Republic of Bangladesh | DSHE',
    eiinLabel: 'EIIN:',
    estdLabel: 'ESTD:',
    searchPlaceholder: 'Search notices, routines, news, or pages...',
    adminLogin: 'Admin Login',
    adminPanel: 'Admin Panel',
    logout: 'Logout',
    // Navigation
    navHome: 'Home',
    navAboutGroup: 'About',
    navAbout: 'About School',
    navHistory: 'History of School',
    navHeadmaster: 'Headmaster’s Message',
    navMission: 'Mission & Vision',
    navFacilities: 'Facilities',
    navAcademicGroup: 'Academics',
    navAcademicInfo: 'Academic Information',
    navClassRoutine: 'Class Routine',
    navExamRoutine: 'Exam Routine',
    navExamResults: 'Exam Results',
    navAdmission: 'Admission Information',
    navAdminGroup: 'Administration',
    navTeachers: 'Teachers & Staff',
    navStudents: 'Student Information',
    navNotice: 'Notice Board',
    navNews: 'News & Events',
    navGalleryGroup: 'Gallery',
    navPhotoGallery: 'Photo Gallery',
    navVideoGallery: 'Video Gallery',
    navContact: 'Contact Us',
    // Home Sections
    latestNoticeTicker: 'Latest Notice:',
    exploreAcademics: 'Explore Academics',
    checkResults: 'Check Results',
    admissionOpen: 'Admission Info',
    quickStatsTitle: 'Panipur Zila School at a Glance',
    statStudents: 'Total Students',
    statTeachers: 'Teachers & Staff',
    statPassRate: 'Pass Rate',
    statEstablished: 'Established',
    headmasterTitle: 'Message from the Headmaster',
    readMore: 'Read Full Message',
    noticeBoardTitle: 'Notice Board',
    viewAllNotices: 'View All Notices',
    latestBadge: 'LATEST',
    downloadPdf: 'PDF / Print',
    newsEventsTitle: 'Latest News & Announcements',
    viewAllNews: 'View All News',
    teachersPreviewTitle: 'Our Respected Faculty',
    viewAllTeachers: 'All Teachers & Staff',
    achievementsTitle: 'Achievements & Milestones',
    galleryPreviewTitle: 'Photo & Video Gallery',
    importantLinksTitle: 'Important Academic Links',
    contactFooterTitle: 'Contact Information',
    quickLinksTitle: 'Quick Links',
    // Forms & Tables
    selectClass: 'Select Class',
    selectSection: 'Select Section',
    selectExam: 'Select Exam Name',
    enterRollOrId: 'Enter Roll Number or Student ID',
    searchResultBtn: 'Search Result',
    printSheet: 'Print / Download',
    noDataPlaceholder: 'No records added yet. Please add records via the Admin Panel.',
    editableHint: 'Editable via Admin Panel',
    // Classes
    class6: 'Class 6',
    class7: 'Class 7',
    class8: 'Class 8',
    class9: 'Class 9',
    class10: 'Class 10',
    allClasses: 'All Classes',
    // Exams
    halfYearly: 'Half-Yearly Examination',
    annualExam: 'Annual Examination',
    preTest: 'Pre-Test Examination',
    testExam: 'Test Examination',
    // Result Labels
    studentName: 'Student Name',
    studentId: 'Student ID',
    rollNo: 'Roll Number',
    group: 'Group',
    academicYear: 'Academic Year',
    subject: 'Subject',
    marks: 'Marks Obtained',
    grade: 'Letter Grade',
    gpa: 'GPA',
    totalMarks: 'Total Marks',
    resultStatus: 'Status',
    passed: 'Passed',
    failed: 'Failed',
  }
};

// ============================================================================
// NCTB BANGLADESH SECONDARY GRADING CALCULATOR
// ============================================================================
function calculateSubjectGrade(marks) {
  const m = Number(marks);
  if (m >= 80) return { grade: 'A+', gpa: 5.0 };
  if (m >= 70) return { grade: 'A', gpa: 4.0 };
  if (m >= 60) return { grade: 'A-', gpa: 3.5 };
  if (m >= 50) return { grade: 'B', gpa: 3.0 };
  if (m >= 40) return { grade: 'C', gpa: 2.0 };
  if (m >= 33) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
}

function calculateOverallResult(subjects) {
  if (!subjects || subjects.length === 0) return { total: 0, gpa: '0.00', grade: 'F', passed: false };
  let total = 0;
  let totalGpa = 0;
  let hasFailed = false;

  subjects.forEach((sub) => {
    const m = Number(sub.marks) || 0;
    total += m;
    const { gpa } = calculateSubjectGrade(m);
    if (gpa === 0) hasFailed = true;
    totalGpa += gpa;
  });

  if (hasFailed) {
    return { total, gpa: '0.00', grade: 'F', passed: false };
  }

  const avgGpa = totalGpa / subjects.length;
  let grade = 'F';
  if (avgGpa === 5.0) grade = 'A+';
  else if (avgGpa >= 4.0) grade = 'A';
  else if (avgGpa >= 3.5) grade = 'A-';
  else if (avgGpa >= 3.0) grade = 'B';
  else if (avgGpa >= 2.0) grade = 'C';
  else if (avgGpa >= 1.0) grade = 'D';

  return {
    total,
    gpa: avgGpa.toFixed(2),
    grade,
    passed: true
  };
}

// ============================================================================
// INITIAL DEFAULT DATA (STRICTLY NO FAKE PEOPLE/RESULTS - CLEAN PLACEHOLDERS)
// ============================================================================
const INITIAL_SITE_DATA = {
  settings: {
    schoolNameBn: 'পানিপুর জেলা স্কুল',
    schoolNameEn: 'Panipur Zila School',
    taglineBn: 'একটি মনতেশ্বরী শিক্ষা প্রতিষ্ঠান',
    taglineEn: 'Beacon of Knowledge, Discipline & Morality',
    eiin: '[EIIN নম্বর যুক্ত করুন]',
    estd: '[স্থাপিত সাল]',
    heroTitleBn: 'পানিপুর জেলা স্কুলে স্বাগতম',
    heroTitleEn: 'Welcome to Panipur Zila School',
    heroSubtitleBn: 'জাতীয় শিক্ষাক্রম অনুসরণে আধুনিক, বিজ্ঞানমনস্ক ও নৈতিক শিক্ষায় সমৃদ্ধ একটি আদর্শ মাধ্যমিক বিদ্যাপীঠ।',
    heroSubtitleEn: 'An ideal secondary educational institution enriched with modern, scientific, and moral education following the National Curriculum.',
    logoUrl: '',
    bannerUrl: '',
    // Stats Placeholders
    statStudents: '[শিক্ষার্থী সংখ্যা]',
    statTeachers: '[শিক্ষক সংখ্যা]',
    statPassRate: '[পাসের হার %]',
    // About & History Placeholders
    aboutTextBn: '[স্কুল সম্পর্কে বিস্তারিত পরিচিতি এখানে যুক্ত করুন। অ্যাডমিন প্যানেলের "Site & Content" সেকশন থেকে এই তথ্যটি যেকোনো সময় পরিবর্তন ও সংরক্ষণ করা যাবে।]',
    aboutTextEn: '[Add detailed school overview here. You can edit and save this content anytime from the "Site & Content" section in the Admin Panel.]',
    historyTextBn: '[পানিপুর জেলা স্কুলের প্রতিষ্ঠার ইতিহাস, ঐতিহ্য এবং গুরুত্বপূর্ণ মাইলফলকসমূহ এখানে যুক্ত করুন। কোনো কাল্পনিক তথ্য ছাড়াই প্রকৃত ইতিহাস অ্যাডমিন প্যানেল থেকে সংযোজন করুন।]',
    historyTextEn: '[Add the founding history, heritage, and key milestones of Panipur Zila School here. Add authentic historical records via the Admin Panel.]',
    // Headmaster Placeholders
    headmasterNameBn: '[প্রধান শিক্ষকের নাম যুক্ত করুন]',
    headmasterNameEn: '[Add Headmaster Name]',
    headmasterQualification: '[শিক্ষাগত যোগ্যতা যুক্ত করুন, যেমন: এম.এসসি, বি.এড]',
    headmasterPhoto: '',
    asstNameBn: '',
    asstNameEn: '',
    asstQualification: '',
    asstPhoto: '',
    asstMessageBn: '',
    asstMessageEn: '',
    headmasterMessageBn: '[প্রধান শিক্ষকের শুভেচ্ছা বার্তা এখানে যুক্ত করুন। শিক্ষার্থী, অভিভাবক এবং শিক্ষকদের উদ্দেশ্যে দিকনির্দেশনামূলক বাণী অ্যাডমিন প্যানেল থেকে হালনাগাদ করুন।]',
    headmasterMessageEn: '[Add Headmaster’s welcome message here. Update the guiding message for students, guardians, and teachers from the Admin Panel.]',
    // Mission & Vision
    missionBn: '[আমাদের লক্ষ্য (Mission): শিক্ষার্থীদের সুপ্ত প্রতিভার বিকাশ, প্রযুক্তিনির্ভর আধুনিক শিক্ষা এবং দেশপ্রেমিক নাগরিক হিসেবে গড়ে তোলা।]',
    missionEn: '[Our Mission: To nurture students’ latent talents, provide technology-driven modern education, and build patriotic citizens.]',
    visionBn: '[আমাদের উদ্দেশ্য (Vision): জাতীয় ও আন্তর্জাতিক মানের শিক্ষার পরিবেশ নিশ্চিত করে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান হিসেবে প্রতিষ্ঠা লাভ।]',
    visionEn: '[Our Vision: To establish an exemplary educational institution by ensuring a national and international standard learning environment.]',
    // Admission Info
    admissionInfoBn: '[ভর্তি সংক্রান্ত নির্দেশিকা, আবেদন ফরম সংগ্রহের তারিখ, যোগ্যতা এবং প্রয়োজনীয় কাগজপত্রের তালিকা অ্যাডমিন প্যানেল থেকে যুক্ত করুন।]',
    admissionInfoEn: '[Add admission guidelines, application dates, eligibility criteria, and required documents list via the Admin Panel.]',
    // Academic Info
    academicInfoBn: '[জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত ৬ষ্ঠ থেকে ১০ম শ্রেণি পর্যন্ত পাঠদান, শিফট ও শাখা সংক্রান্ত তথ্য এখানে যুক্ত করুন।]',
    academicInfoEn: '[Add curriculum details for Classes 6 to 10 approved by NCTB, shift timings, and section details here.]',
    // Contact Info
    addressBn: '[বিদ্যালয়ের পূর্ণ ঠিকানা, উপজেলা ও জেলা যুক্ত করুন]',
    addressEn: '[Add Full School Address, Upazila & District]',
    phone: '[ফোন নম্বর যুক্ত করুন]',
    email: '[ইমেইল ঠিকানা যুক্ত করুন]',
    facebookUrl: 'https://facebook.com',
    mapEmbedUrl: '',
  },
  notices: [
    {
      id: 'notice-template-1',
      titleBn: '[নমুনা নোটিশ] বার্ষিক পরীক্ষার সময়সূচি ও নির্দেশাবলি সংক্রান্ত বিজ্ঞপ্তি',
      titleEn: '[Sample Notice] Notification Regarding Annual Examination Schedule & Guidelines',
      date: '2026-11-20',
      category: 'Academic',
      isLatest: true,
      descriptionBn: 'এতদ্বারা পানিপুর জেলা স্কুলের সকল শ্রেণির শিক্ষার্থী ও সম্মানিত অভিভাবকবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে, [তারিখ যুক্ত করুন] হতে বিদ্যালয়ের অভ্যন্তরীণ পরীক্ষা অনুষ্ঠিত হবে। অ্যাডমিন প্যানেল থেকে এই নোটিশটি সম্পাদনা বা নতুন নোটিশ যুক্ত করুন।',
      descriptionEn: 'This is to inform all students and respected guardians of Panipur Zila School that internal examinations will commence from [Add Date]. Edit this sample notice or publish new notices via the Admin Panel.',
      attachmentName: 'Exam_Notice_Template.pdf'
    }
  ],
  news: [
    {
      id: 'news-template-1',
      titleBn: '[নমুনা সংবাদ] বার্ষিক ক্রীড়া প্রতিযোগিতা ও পুরস্কার বিতরণী অনুষ্ঠান',
      titleEn: '[Sample News] Annual Sports Competition & Prize Giving Ceremony',
      date: '2026-11-15',
      summaryBn: 'বিদ্যালয় প্রাঙ্গণে উৎসবমুখর পরিবেশে বার্ষিক ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতা আয়োজনের প্রস্তুতি চলছে। প্রকৃত সংবাদ ও ছবি অ্যাডমিন প্যানেল থেকে যুক্ত করুন।',
      summaryEn: 'Preparations are underway to host the annual sports and cultural competition in a festive atmosphere. Add authentic news and photos via the Admin Panel.',
      imageUrl: ''
    }
  ],
  teachers: [
    // Empty by default to strictly avoid fake teachers; Admin can add real teachers immediately
  ],
  students: [
    // Strictly private student records managed inside Admin Panel (empty by default, no fake students)
  ],
  classRoutines: [
    {
      id: 'cr-1',
      className: '6',
      section: 'A',
      dayBn: 'রবিবার (Sunday)',
      periods: [
        { time: '10:00 - 10:45', subject: 'বাংলা (Bengali)', teacher: '[শিক্ষকের নাম]' },
        { time: '10:45 - 11:30', subject: 'ইংরেজি (English)', teacher: '[শিক্ষকের নাম]' },
        { time: '11:30 - 12:15', subject: 'গণিত (Mathematics)', teacher: '[শিক্ষকের নাম]' },
        { time: '01:00 - 01:45', subject: 'বিজ্ঞান (Science)', teacher: '[শিক্ষকের নাম]' },
      ]
    }
  ],
  examRoutines: [
    {
      id: 'er-1',
      examName: 'Annual Examination',
      className: '6',
      date: '[তারিখ যুক্ত করুন]',
      time: '10:00 AM - 01:00 PM',
      subjectBn: 'বাংলা প্রথম পত্র (Bengali 1st Paper)',
      room: '[কক্ষ নং]'
    }
  ],
  results: [
    // Strictly no fake student results. Admin can publish real results and search immediately!
  ],
  photos: [],
  videos: [],
  achievements: [
    {
      id: 'ach-1',
      year: '[সাল]',
      titleBn: '[অর্জন বা পুরস্কারের শিরোনাম যুক্ত করুন]',
      titleEn: '[Add Achievement or Award Title]',
      descBn: '[এসএসসি ফলাফল, ক্রীড়া বা বিজ্ঞান মেলায় বিদ্যালয়ের সাফল্যের বিবরণ অ্যাডমিন প্যানেল থেকে যুক্ত করুন।]',
      descEn: '[Add details of school achievements in SSC results, sports, or science fairs via the Admin Panel.]'
    }
  ],
  facilities: [
    {
      id: 'fac-1',
      titleBn: 'সমৃদ্ধ পাঠাগার (School Library)',
      titleEn: 'Enriched School Library',
      descBn: '[পাঠাগারের বইয়ের সংখ্যা ও পাঠকক্ষের সুবিধাদি সম্পর্কে তথ্য যুক্ত করুন।]',
      descEn: '[Add details about library book collection and reading room facilities.]'
    },
    {
      id: 'fac-2',
      titleBn: 'বিজ্ঞানাগার (Science Laboratory)',
      titleEn: 'Modern Science Laboratory',
      descBn: '[পদার্থ, রসায়ন ও জীববিজ্ঞান ব্যবহারিক ক্লাসের সরঞ্জামাদির বিবরণ যুক্ত করুন।]',
      descEn: '[Add details about Physics, Chemistry, and Biology practical lab facilities.]'
    },
    {
      id: 'fac-3',
      titleBn: 'শেখ রাসেল ডিজিটাল / আইসিটি ল্যাব (ICT Lab)',
      titleEn: 'ICT & Computer Lab',
      descBn: '[কম্পিউটার ল্যাব ও মাল্টিমিডিয়া ক্লাসরুমের সুবিধাসমূহ যুক্ত করুন।]',
      descEn: '[Add details about computer lab and multimedia classroom facilities.]'
    },
    {
      id: 'fac-4',
      titleBn: 'খেলার মাঠ ও সহশিক্ষা কার্যক্রম (Playground)',
      titleEn: 'Spacious Playground & Co-curriculars',
      descBn: '[খেলার মাঠ, স্কাউটিং, বিতর্ক ক্লাব ও সাংস্কৃতিক কার্যক্রমের তথ্য যুক্ত করুন।]',
      descEn: '[Add details about playground, scouting, debate club, and cultural activities.]'
    }
  ],
  studentStats: [
    { className: '6', boys: '[ছাত্র সংখ্যা]', girls: '[ছাত্রী সংখ্যা]', total: '[মোট]' },
    { className: '7', boys: '[ছাত্র সংখ্যা]', girls: '[ছাত্রী সংখ্যা]', total: '[মোট]' },
    { className: '8', boys: '[ছাত্র সংখ্যা]', girls: '[ছাত্রী সংখ্যা]', total: '[মোট]' },
    { className: '9', boys: '[ছাত্র সংখ্যা]', girls: '[ছাত্রী সংখ্যা]', total: '[মোট]' },
    { className: '10', boys: '[ছাত্র সংখ্যা]', girls: '[ছাত্রী সংখ্যা]', total: '[মোট]' },
  ]
};

// ============================================================================
// CUSTOM SVG SCHOOL EMBLEM / CREST
// ============================================================================
const SchoolCrest = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#0F2942" stroke="#10B981" strokeWidth="4" />
    <circle cx="50" cy="50" r="39" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Open Book */}
    <path d="M26 56C26 56 38 52 50 58C62 52 74 56 74 56V36C74 36 62 32 50 38C38 32 26 36 26 36V56Z" fill="#FFFFFF" />
    <path d="M50 38V58" stroke="#0F2942" strokeWidth="2" />
    {/* Rising Sun / Torch */}
    <circle cx="50" cy="25" r="6" fill="#F59E0B" />
    <path d="M50 14V17M39 19L41 21M61 19L59 21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    {/* Ribbon */}
    <path d="M22 68H78L73 76H27L22 68Z" fill="#059669" />
    <text x="50" y="74" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
      PZS • ESTD
    </text>
  </svg>
);

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function SchoolSite() {
  // Language State ('bn' or 'en')
  const [lang, setLang] = useState('bn');
  const t = TRANSLATIONS[lang];

  // Active Page State (18 Public Pages + 'admin-login' + 'admin-dashboard')
  const [activePage, setActivePage] = useState('home');

  // Persistent Site Data State
  const [siteData, setSiteData] = useState(() => {
    try {
      const saved = localStorage.getItem('panipur_zila_school_v1');
      return saved ? JSON.parse(saved) : INITIAL_SITE_DATA;
    } catch {
      return INITIAL_SITE_DATA;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('panipur_zila_school_v1', JSON.stringify(siteData));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [siteData]);

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Firebase: অ্যাডমিন সেশন ও প্রকাশিত কনটেন্ট
  useEffect(() => {
    const unsub = observeAuthProfile((p) => {
      setIsAdminAuthenticated(!!p && p.active && ADMIN_ROLES.includes(p.role));
    });
    return () => unsub();
  }, []);

  const [remoteReady, setRemoteReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ state: 'idle', msg: '' });
  const lastSaved = React.useRef(null);

  useEffect(() => {
    fetchSiteContent()
      .then((remote) => {
        if (remote) {
          setSiteData((prev) => {
            const next = { ...prev, ...remote };
            lastSaved.current = publicJson(next);
            return next;
          });
        }
        setRemoteReady(true);
      })
      .catch((e) => {
        setSyncStatus({ state: 'error', msg: (e && e.code) || 'পড়া যায়নি' });
      })
      .then(() => fetchSchoolMeta())
      .then((m) => {
        if (!m) return;
        // ফলাফল পোর্টালের শিক্ষার্থী সংখ্যা স্বয়ংক্রিয়ভাবে হোম পেজের পরিসংখ্যানে আসে
        const total = Object.values(m.counts || {}).reduce((a, b) => a + Number(b || 0), 0);
        if (total > 0) {
          const shown = String(total).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
          setSiteData((prev) => ({ ...prev, settings: { ...prev.settings, statStudents: shown } }));
        }
      })
      .catch(() => {});
  }, []);

  // অ্যাডমিন লগইন থাকলে প্রতিটি পরিবর্তন নিজে থেকে ক্লাউডে সংরক্ষিত হয় (সব ডিভাইসে যায়)
  useEffect(() => {
    if (!isAdminAuthenticated || !remoteReady) return;
    const json = publicJson(siteData);
    if (lastSaved.current === null) {
      lastSaved.current = json;
      return;
    }
    if (json === lastSaved.current) return;
    setSyncStatus({ state: 'saving', msg: '' });
    const id = setTimeout(async () => {
      try {
        await saveSiteContent(siteData);
        lastSaved.current = json;
        setSyncStatus({ state: 'saved', msg: new Date().toLocaleTimeString('bn-BD') });
      } catch (e) {
        setSyncStatus({ state: 'error', msg: (e && e.code) || (e && e.message) || 'error' });
      }
    }, 1500);
    return () => clearTimeout(id);
  }, [siteData, isAdminAuthenticated, remoteReady]);

  // UI Helper States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    try {
      await saveSiteContent(siteData);
      lastSaved.current = publicJson(siteData);
      setSyncStatus({ state: 'saved', msg: new Date().toLocaleTimeString('bn-BD') });
      showToast(lang === 'bn' ? 'ক্লাউডে সংরক্ষিত হয়েছে — সব ডিভাইসে দেখা যাবে!' : 'Saved to the cloud — visible on all devices!');
    } catch (e) {
      const c = (e && e.code) || (e && e.message) || 'error';
      setSyncStatus({ state: 'error', msg: c });
      showToast((lang === 'bn' ? 'সংরক্ষণ হয়নি: ' : 'Save failed: ') + c, 'error');
    }
  };

  // Global Search Results
  const globalSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results = [];

    // Search Notices
    siteData.notices.forEach((n) => {
      if (
        n.titleBn.toLowerCase().includes(q) ||
        n.titleEn.toLowerCase().includes(q) ||
        n.descriptionBn.toLowerCase().includes(q)
      ) {
        results.push({
          type: lang === 'bn' ? 'নোটিশ' : 'Notice',
          title: lang === 'bn' ? n.titleBn : n.titleEn,
          date: n.date,
          action: () => {
            setSearchModalOpen(false);
            setSelectedNotice(n);
          }
        });
      }
    });

    // Search News
    siteData.news.forEach((item) => {
      if (
        item.titleBn.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q)
      ) {
        results.push({
          type: lang === 'bn' ? 'সংবাদ' : 'News',
          title: lang === 'bn' ? item.titleBn : item.titleEn,
          date: item.date,
          action: () => {
            setSearchModalOpen(false);
            setSelectedNews(item);
          }
        });
      }
    });

    // Search Pages
    const pageList = [
      { id: 'about', label: t.navAbout },
      { id: 'history', label: t.navHistory },
      { id: 'headmaster', label: t.navHeadmaster },
      { id: 'mission', label: t.navMission },
      { id: 'teachers', label: t.navTeachers },
      { id: 'students', label: t.navStudents },
      { id: 'academic-info', label: t.navAcademicInfo },
      { id: 'class-routine', label: t.navClassRoutine },
      { id: 'exam-routine', label: t.navExamRoutine },
      { id: 'exam-results', label: t.navExamResults },
      { id: 'admission', label: t.navAdmission },
      { id: 'notice-board', label: t.navNotice },
      { id: 'news-events', label: t.navNews },
      { id: 'photo-gallery', label: t.navPhotoGallery },
      { id: 'video-gallery', label: t.navVideoGallery },
      { id: 'facilities', label: t.navFacilities },
      { id: 'contact', label: t.navContact },
    ];
    pageList.forEach((p) => {
      if (p.label.toLowerCase().includes(q) || p.id.includes(q)) {
        results.push({
          type: lang === 'bn' ? 'পেজ' : 'Page',
          title: p.label,
          date: '',
          action: () => {
            setSearchModalOpen(false);
            navigateTo(p.id);
          }
        });
      }
    });

    return results;
  }, [searchQuery, siteData, lang, t]);

  // ==========================================================================
  // RENDER ADMIN PORTAL IF SELECTED
  // ==========================================================================
  if (activePage === 'admin-login' && !isAdminAuthenticated) {
    return (
      <FirebaseAdminLogin
        lang={lang}
        setLang={setLang}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setActivePage('admin-dashboard');
          showToast(lang === 'bn' ? 'অ্যাডমিন প্যানেলে স্বাগতম!' : 'Welcome to Admin Panel!');
        }}
        onBack={() => navigateTo('home')}
      />
    );
  }

  if (activePage === 'admin-dashboard' && isAdminAuthenticated) {
    return (
      <AdminDashboard
        lang={lang}
        setLang={setLang}
        siteData={siteData}
        setSiteData={setSiteData}
        onLogout={() => {
          logoutUser();
          setIsAdminAuthenticated(false);
          navigateTo('home');
          showToast(lang === 'bn' ? 'সফলভাবে লগআউট হয়েছে' : 'Logged out successfully');
        }}
        onBackToSite={() => navigateTo('home')}
        showToast={showToast}
        onPublish={handlePublish}
        syncStatus={syncStatus}
        onOpenRoles={() => navigateTo('central-admin')}
      />
    );
  }

  if (activePage === 'central-admin' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="bg-[#0F2942] text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm">{lang === 'bn' ? 'ব্যবহারকারী ও রোল ব্যবস্থাপনা' : 'User & Role Management'}</span>
          <button onClick={() => navigateTo('admin-dashboard')} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold px-3.5 py-1.5 rounded-lg">
            ← {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}
          </button>
        </div>
        <CentralAdminPanel notices={[]} onNoticesUpdated={async () => {}} rolesOnly />
      </div>
    );
  }

  // ==========================================================================
  // PUBLIC SCHOOL WEBSITE LAYOUT
  // ==========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl bg-[#0F2942] text-white border border-emerald-500/40 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* TOP UTILITY BAR */}
      <div className="bg-[#091B2C] text-slate-200 text-xs py-2 px-4 border-b border-slate-700/60 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-emerald-400 font-medium">{t.govHeader}</span>
            <span className="text-slate-300">
              {t.eiinLabel} <strong className="text-white">{siteData.settings.eiin}</strong>
            </span>
            <span className="text-slate-300">
              {t.estdLabel} <strong className="text-white">{siteData.settings.estd}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Global Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md transition"
              title="Search"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{lang === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
            </button>

            {/* Bilingual Language Toggle */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded-md transition shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.switchLabel}</span>
            </button>

            {/* Admin Access Button */}
            <button
              onClick={() => navigateTo(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login')}
              className="flex items-center gap-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-700/60 px-2.5 py-1 rounded-md transition"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdminAuthenticated ? t.adminPanel : t.adminLogin}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BRAND HEADER */}
      <header className="bg-gradient-to-r from-[#0F2942] via-[#153B60] to-[#0F2942] text-white py-4 px-4 shadow-md print:bg-white print:text-black print:shadow-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {siteData.settings.logoUrl ? (
              <img
                src={siteData.settings.logoUrl}
                alt="School Logo"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-emerald-400 bg-white"
              />
            ) : (
              <SchoolCrest className="w-14 h-14 md:w-16 md:h-16 shrink-0 group-hover:scale-105 transition-transform" />
            )}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white print:text-slate-900">
                {lang === 'bn' ? siteData.settings.schoolNameBn : siteData.settings.schoolNameEn}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-0.5 print:text-slate-600">
                {lang === 'bn' ? siteData.settings.taglineBn : siteData.settings.taglineEn}
              </p>
            </div>
          </div>

          {/* Quick Contact Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-sm print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-emerald-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300">{lang === 'bn' ? 'ফোন নম্বর' : 'Call Us'}</p>
                <p className="font-semibold text-white">{siteData.settings.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-emerald-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300">{lang === 'bn' ? 'ইমেইল' : 'Email Us'}</p>
                <p className="font-semibold text-white">{siteData.settings.email}</p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white print:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* STICKY NAVIGATION BAR (DESKTOP) */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm hidden lg:block print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <li>
              <button
                onClick={() => navigateTo('home')}
                className={`py-3.5 px-3 border-b-2 transition ${
                  activePage === 'home'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-[#0F2942]'
                }`}
              >
                {t.navHome}
              </button>
            </li>

            {/* Dropdown: About School */}
            <NavDropdown
              label={t.navAboutGroup}
              active={['about', 'history', 'headmaster', 'mission', 'facilities'].includes(activePage)}
              items={[
                { id: 'about', label: t.navAbout },
                { id: 'history', label: t.navHistory },
                { id: 'headmaster', label: t.navHeadmaster },
                { id: 'mission', label: t.navMission },
                { id: 'facilities', label: t.navFacilities },
              ]}
              onSelect={navigateTo}
            />

            {/* Dropdown: Academics */}
            <NavDropdown
              label={t.navAcademicGroup}
              active={['academic-info', 'class-routine', 'exam-routine', 'exam-results', 'admission'].includes(activePage)}
              items={[
                { id: 'academic-info', label: t.navAcademicInfo },
                { id: 'class-routine', label: t.navClassRoutine },
                { id: 'exam-routine', label: t.navExamRoutine },
                { id: 'exam-results', label: t.navExamResults },
                { id: 'admission', label: t.navAdmission },
              ]}
              onSelect={navigateTo}
            />

            {/* Dropdown: Administration & Students */}
            <NavDropdown
              label={t.navAdminGroup}
              active={['teachers', 'students'].includes(activePage)}
              items={[
                { id: 'teachers', label: t.navTeachers },
                { id: 'students', label: t.navStudents },
              ]}
              onSelect={navigateTo}
            />

            <li>
              <button
                onClick={() => navigateTo('notice-board')}
                className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activePage === 'notice-board'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-[#0F2942]'
                }`}
              >
                <span>{t.navNotice}</span>
                {siteData.notices.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] px-1.5 py-0.5 rounded-full">
                    {siteData.notices.length}
                  </span>
                )}
              </button>
            </li>

            <li>
              <button
                onClick={() => navigateTo('news-events')}
                className={`py-3.5 px-3 border-b-2 transition ${
                  activePage === 'news-events'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-[#0F2942]'
                }`}
              >
                {t.navNews}
              </button>
            </li>

            {/* Dropdown: Gallery */}
            <NavDropdown
              label={t.navGalleryGroup}
              active={['photo-gallery', 'video-gallery'].includes(activePage)}
              items={[
                { id: 'photo-gallery', label: t.navPhotoGallery },
                { id: 'video-gallery', label: t.navVideoGallery },
              ]}
              onSelect={navigateTo}
            />

            <li>
              <button
                onClick={() => navigateTo('contact')}
                className={`py-3.5 px-3 border-b-2 transition ${
                  activePage === 'contact'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-[#0F2942]'
                }`}
              >
                {t.navContact}
              </button>
            </li>

            <li>
              <button
                onClick={() => navigateTo('online-services')}
                className={`py-3.5 px-3 border-b-2 transition ${
                  activePage === 'online-services'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-[#0F2942]'
                }`}
              >
                {lang === 'bn' ? 'অনলাইন সেবা' : 'Online Services'}
              </button>
            </li>

            <li>
              <button
                onClick={() => navigateTo('exam-results')}
                className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{t.navExamResults}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-lg px-4 py-4 space-y-2 print:hidden">
          {[
            { id: 'home', label: t.navHome },
            { id: 'about', label: t.navAbout },
            { id: 'history', label: t.navHistory },
            { id: 'headmaster', label: t.navHeadmaster },
            { id: 'mission', label: t.navMission },
            { id: 'teachers', label: t.navTeachers },
            { id: 'students', label: t.navStudents },
            { id: 'academic-info', label: t.navAcademicInfo },
            { id: 'class-routine', label: t.navClassRoutine },
            { id: 'exam-routine', label: t.navExamRoutine },
            { id: 'exam-results', label: t.navExamResults },
            { id: 'admission', label: t.navAdmission },
            { id: 'online-services', label: lang === 'bn' ? 'অনলাইন সেবা' : 'Online Services' },
            { id: 'notice-board', label: t.navNotice },
            { id: 'news-events', label: t.navNews },
            { id: 'photo-gallery', label: t.navPhotoGallery },
            { id: 'video-gallery', label: t.navVideoGallery },
            { id: 'facilities', label: t.navFacilities },
            { id: 'contact', label: t.navContact },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                activePage === item.id
                  ? 'bg-[#0F2942] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* LIVE NOTICE TICKER BAR */}
      <div className="bg-emerald-50 border-b border-emerald-200 py-2 px-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
          <span className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1.5 shrink-0">
            <Bell className="w-3.5 h-3.5 animate-pulse" />
            {t.latestNoticeTicker}
          </span>
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-6 text-sm text-slate-800">
            {siteData.notices.length === 0 ? (
              <span className="text-slate-500 italic">{t.noDataPlaceholder}</span>
            ) : (
              siteData.notices.slice(0, 4).map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="hover:text-emerald-700 font-medium inline-flex items-center gap-1.5 transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{lang === 'bn' ? notice.titleBn : notice.titleEn}</span>
                  <span className="text-xs text-slate-500">({notice.date})</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ======================================================================
          MAIN PAGE CONTENT ROUTER (ALL 18 PUBLIC PAGES)
      ====================================================================== */}
      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <HomePage
            lang={lang}
            t={t}
            siteData={siteData}
            navigateTo={navigateTo}
            setSelectedNotice={setSelectedNotice}
            setSelectedNews={setSelectedNews}
            setSelectedPhoto={setSelectedPhoto}
          />
            <AssistantHeadmasterSection lang={lang} settings={siteData.settings} />
            <OnlineServicesSection lang={lang} navigateTo={navigateTo} />
          </>
        )}

        {activePage === 'about' && (
          <TextContentPage
            title={t.navAbout}
            subtitle={lang === 'bn' ? siteData.settings.schoolNameBn : siteData.settings.schoolNameEn}
            content={lang === 'bn' ? siteData.settings.aboutTextBn : siteData.settings.aboutTextEn}
            icon={Building2}
            lang={lang}
            metaCards={[
              { label: lang === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Institution Name', value: lang === 'bn' ? siteData.settings.schoolNameBn : siteData.settings.schoolNameEn },
              { label: 'EIIN', value: siteData.settings.eiin },
              { label: lang === 'bn' ? 'স্থাপিত' : 'Established', value: siteData.settings.estd },
              { label: lang === 'bn' ? 'শিক্ষাক্রম' : 'Curriculum', value: lang === 'bn' ? 'জাতীয় শিক্ষাক্রম (NCTB)' : 'National Curriculum (NCTB)' },
            ]}
          />
        )}

        {activePage === 'history' && (
          <TextContentPage
            title={t.navHistory}
            subtitle={lang === 'bn' ? 'ঐতিহ্য ও পথচলা' : 'Heritage & Milestones'}
            content={lang === 'bn' ? siteData.settings.historyTextBn : siteData.settings.historyTextEn}
            icon={History}
            lang={lang}
          />
        )}

        {activePage === 'headmaster' && (
          <>
            <HeadmasterPage lang={lang} t={t} settings={siteData.settings} />
            <AssistantHeadmasterSection lang={lang} settings={siteData.settings} />
          </>
        )}

        {activePage === 'mission' && (
          <MissionVisionPage lang={lang} t={t} settings={siteData.settings} />
        )}

        {activePage === 'teachers' && (
          <TeachersPage lang={lang} t={t} teachers={siteData.teachers} />
        )}

        {activePage === 'students' && (
          <StudentInfoPage
            lang={lang}
            t={t}
            studentStats={siteData.studentStats}
            onAdminClick={() => navigateTo(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login')}
          />
        )}

        {activePage === 'academic-info' && (
          <TextContentPage
            title={t.navAcademicInfo}
            subtitle={lang === 'bn' ? 'পাঠ্যক্রম, শিফট ও একাডেমিক কাঠামো' : 'Curriculum, Shifts & Academic Structure'}
            content={lang === 'bn' ? siteData.settings.academicInfoBn : siteData.settings.academicInfoEn}
            icon={BookOpen}
            lang={lang}
            metaCards={[
              { label: lang === 'bn' ? 'শ্রেণিসমূহ' : 'Classes', value: lang === 'bn' ? '১ম - ১০ম শ্রেণি' : 'Class 1 to Class 10' },
              { label: lang === 'bn' ? 'বিভাগসমূহ (৯ম-১০ম)' : 'Groups (9-10)', value: lang === 'bn' ? 'বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা' : 'Science, Humanities, Business' },
              { label: lang === 'bn' ? 'শিক্ষাবোর্ড' : 'Education Board', value: lang === 'bn' ? 'মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড' : 'Secondary & Higher Secondary Board' },
              { label: lang === 'bn' ? 'মূল্যায়ন পদ্ধতি' : 'Grading System', value: 'NCTB GPA (5.00 Scale)' },
            ]}
          />
        )}

        {activePage === 'class-routine' && (
          <ClassRoutinePage lang={lang} t={t} routines={siteData.classRoutines} />
        )}

        {activePage === 'exam-routine' && (
          <ExamRoutinePage lang={lang} t={t} examRoutines={siteData.examRoutines} />
        )}

        {activePage === 'exam-results' && <ResultLookup />}

        {activePage === 'admission' && (
          <OnlineServicesSection lang={lang} navigateTo={navigateTo} mode="admission" />
        )}

        {activePage === 'online-services' && (
          <OnlineServicesSection lang={lang} navigateTo={navigateTo} />
        )}

        {activePage === 'notice-board' && (
          <NoticeBoardPage
            lang={lang}
            t={t}
            notices={siteData.notices}
            setSelectedNotice={setSelectedNotice}
          />
        )}

        {activePage === 'news-events' && (
          <NewsEventsPage
            lang={lang}
            t={t}
            news={siteData.news}
            setSelectedNews={setSelectedNews}
          />
        )}

        {activePage === 'photo-gallery' && (
          <PhotoGalleryPage
            lang={lang}
            t={t}
            photos={siteData.photos}
            setSelectedPhoto={setSelectedPhoto}
          />
        )}

        {activePage === 'video-gallery' && (
          <VideoGalleryPage
            lang={lang}
            t={t}
            videos={siteData.videos}
            setSelectedVideo={setSelectedVideo}
          />
        )}

        {activePage === 'facilities' && (
          <FacilitiesPage lang={lang} t={t} facilities={siteData.facilities} />
        )}

        {activePage === 'contact' && (
          <ContactPage lang={lang} t={t} settings={siteData.settings} showToast={showToast} />
        )}
      </main>

      {/* ======================================================================
          FOOTER SECTION
      ====================================================================== */}
      <footer className="bg-[#091B2C] text-slate-300 pt-12 pb-6 px-4 border-t-4 border-emerald-600 print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: School Identity */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SchoolCrest className="w-12 h-12 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'bn' ? siteData.settings.schoolNameBn : siteData.settings.schoolNameEn}
                </h3>
                <p className="text-xs text-emerald-400">
                  {t.eiinLabel} {siteData.settings.eiin}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {lang === 'bn' ? siteData.settings.taglineBn : siteData.settings.taglineEn}
            </p>
            <a
              href={siteData.settings.facebookUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition"
            >
              <Facebook className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অফিসিয়াল ফেসবুক পেজ' : 'Official Facebook Page'}</span>
            </a>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base border-l-4 border-emerald-500 pl-2.5">
              {t.quickLinksTitle}
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'about', label: t.navAbout },
                { id: 'teachers', label: t.navTeachers },
                { id: 'class-routine', label: t.navClassRoutine },
                { id: 'exam-results', label: t.navExamResults },
                { id: 'admission', label: t.navAdmission },
                { id: 'notice-board', label: t.navNotice },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => navigateTo(link.id)}
                    className="hover:text-emerald-400 transition flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Important Education Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base border-l-4 border-emerald-500 pl-2.5">
              {t.importantLinksTitle}
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { nameBn: 'শিক্ষা মন্ত্রণালয়', nameEn: 'Ministry of Education', url: 'https://moedu.gov.bd' },
                { nameBn: 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE)', nameEn: 'Directorate of Secondary & Higher Education', url: 'https://dshe.gov.bd' },
                { nameBn: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)', nameEn: 'National Curriculum & Textbook Board', url: 'https://nctb.gov.bd' },
                { nameBn: 'শিক্ষা বোর্ড ফলাফল পোর্টাল', nameEn: 'Education Board Results', url: 'http://www.educationboardresults.gov.bd' },
                { nameBn: 'শিক্ষক বাতায়ন', nameEn: 'Teachers Portal (Muktopaath)', url: 'https://www.teachers.gov.bd' },
              ].map((ext, idx) => (
                <li key={idx}>
                  <a
                    href={ext.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-400 transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{lang === 'bn' ? ext.nameBn : ext.nameEn}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base border-l-4 border-emerald-500 pl-2.5">
              {t.contactFooterTitle}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span>{lang === 'bn' ? siteData.settings.addressBn : siteData.settings.addressEn}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{siteData.settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{siteData.settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()}{' '}
            <strong className="text-white">
              {lang === 'bn' ? siteData.settings.schoolNameBn : siteData.settings.schoolNameEn}
            </strong>
            . {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All Rights Reserved.'}
          </p>
          <button
            onClick={() => navigateTo(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login')}
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.adminPanel}</span>
          </button>
        </div>
      </footer>

      {/* ======================================================================
          MODALS (SEARCH, NOTICE DETAILS, NEWS DETAILS, LIGHTBOX)
      ====================================================================== */}
      {/* Global Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-emerald-600" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 text-base outline-none text-slate-800"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {!searchQuery.trim() ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  {lang === 'bn'
                    ? 'নোটিশ, সংবাদ, রুটিন বা যেকোনো পেজ খুঁজতে টাইপ করুন...'
                    : 'Start typing to search across notices, news, routines, or pages...'}
                </p>
              ) : globalSearchResults.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  {lang === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি।' : 'No matching results found.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {globalSearchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={res.action}
                      className="w-full text-left p-3 rounded-xl hover:bg-emerald-50 border border-slate-100 flex items-center justify-between transition"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F2942] text-white mr-2">
                          {res.type}
                        </span>
                        <span className="font-semibold text-slate-800">{res.title}</span>
                      </div>
                      {res.date && <span className="text-xs text-slate-500">{res.date}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notice Detail & Printable Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0F2942] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">{t.noticeBoardTitle}</span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-b border-slate-100 pb-3">
                <span>
                  {lang === 'bn' ? 'প্রকাশের তারিখ:' : 'Published Date:'}{' '}
                  <strong className="text-slate-800">{selectedNotice.date}</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {selectedNotice.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0F2942]">
                {lang === 'bn' ? selectedNotice.titleBn : selectedNotice.titleEn}
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {lang === 'bn' ? selectedNotice.descriptionBn : selectedNotice.descriptionEn}
              </p>
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  {selectedNotice.attachmentName || 'Official_Notice.pdf'}
                </span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.downloadPdf}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0F2942] text-white px-6 py-4 flex items-center justify-between">
              <span className="font-bold">{t.newsEventsTitle}</span>
              <button onClick={() => setSelectedNews(null)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedNews.imageUrl && (
                <img
                  src={selectedNews.imageUrl}
                  alt="News"
                  className="w-full h-56 object-cover rounded-xl"
                />
              )}
              <p className="text-xs text-emerald-700 font-semibold">{selectedNews.date}</p>
              <h3 className="text-xl font-bold text-[#0F2942]">
                {lang === 'bn' ? selectedNews.titleBn : selectedNews.titleEn}
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {lang === 'bn' ? selectedNews.summaryBn : selectedNews.summaryEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.captionBn}
              className="w-full max-h-[70vh] object-contain bg-slate-950"
            />
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">
                  {lang === 'bn' ? selectedPhoto.captionBn : selectedPhoto.captionEn}
                </h4>
                <p className="text-xs text-slate-500">{selectedPhoto.category}</p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div
          onClick={() => setSelectedVideo(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="bg-[#0F2942] text-white px-5 py-3 flex items-center justify-between">
              <h4 className="font-bold">
                {lang === 'bn' ? selectedVideo.titleBn : selectedVideo.titleEn}
              </h4>
              <button onClick={() => setSelectedVideo(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
              <Video className="w-14 h-14 text-emerald-400 mb-3" />
              <p className="font-semibold mb-2">{selectedVideo.url}</p>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ভিডিও লিংক খুলুন' : 'Open Video Link'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NAVIGATION DROPDOWN COMPONENT
// ============================================================================
function NavDropdown({ label, items, active, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1 ${
          active
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent hover:text-[#0F2942]'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-75" />
      </button>

      {open && (
        <div className="absolute left-0 top-full w-56 bg-white rounded-b-xl shadow-xl border border-slate-200 py-1.5 z-50">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setOpen(false);
                onSelect(item.id);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

// ============================================================================
// 1. HOME PAGE COMPONENT
// ============================================================================
function HomePage({
  lang,
  t,
  siteData,
  navigateTo,
  setSelectedNotice,
  setSelectedNews,
  setSelectedPhoto
}) {
  const { settings, notices, news, teachers, achievements, photos } = siteData;

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0F2942] via-[#163E64] to-[#0A3A3A] text-white overflow-hidden">
        {settings.bannerUrl && (
          <img
            src={settings.bannerUrl}
            alt="Campus Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn'
                  ? 'জাতীয় শিক্ষাক্রম অনুমোদিত আদর্শ বিদ্যাপীঠ'
                  : 'National Curriculum Approved Secondary Institution'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              {lang === 'bn' ? settings.heroTitleBn : settings.heroTitleEn}
            </h2>

            <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
              {lang === 'bn' ? settings.heroSubtitleBn : settings.heroSubtitleEn}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => navigateTo('exam-results')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Award className="w-5 h-5" />
                <span>{t.checkResults}</span>
              </button>
              <button
                onClick={() => navigateTo('admission')}
                className="bg-white text-[#0F2942] hover:bg-slate-100 font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>{t.admissionOpen}</span>
              </button>
              <button
                onClick={() => navigateTo('academic-info')}
                className="border border-white/30 hover:bg-white/10 text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                {t.exploreAcademics}
              </button>
            </div>
          </div>

          {/* Hero Right: Live Notice Card */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-[#0F2942] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>{t.noticeBoardTitle}</span>
              </div>
              <button
                onClick={() => navigateTo('notice-board')}
                className="text-xs text-emerald-300 hover:underline font-semibold"
              >
                {t.viewAllNotices} →
              </button>
            </div>
            <div className="p-4 divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {notices.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">{t.noDataPlaceholder}</p>
              ) : (
                notices.slice(0, 4).map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="py-3 first:pt-1 last:pb-1 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        {notice.date}
                      </span>
                      {notice.isLatest && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                          {t.latestBadge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition line-clamp-2">
                      {lang === 'bn' ? notice.titleBn : notice.titleEn}
                    </h4>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t.statEstablished, value: settings.estd, icon: History, color: 'text-blue-600 bg-blue-50' },
            { label: t.statStudents, value: settings.statStudents, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
            { label: t.statTeachers, value: teachers.length > 0 ? teachers.length : settings.statTeachers, icon: UserCheck, color: 'text-indigo-600 bg-indigo-50' },
            { label: t.statPassRate, value: settings.statPassRate, icon: Award, color: 'text-amber-600 bg-amber-50' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-lg sm:text-xl font-extrabold text-[#0F2942] mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT & HEADMASTER MESSAGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* About School Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {t.navAbout}
            </span>
            <h3 className="text-2xl font-bold text-[#0F2942] mt-3 mb-4">
              {lang === 'bn' ? settings.schoolNameBn : settings.schoolNameEn}
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {lang === 'bn' ? settings.aboutTextBn : settings.aboutTextEn}
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap gap-3">
            <button
              onClick={() => navigateTo('about')}
              className="inline-flex items-center gap-2 bg-[#0F2942] hover:bg-[#183D61] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <span>{t.readMore}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('history')}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <span>{t.navHistory}</span>
            </button>
          </div>
        </div>

        {/* Headmaster Message Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0F2942] to-[#153B60] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-emerald-300 mb-5 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              <span>{t.headmasterTitle}</span>
            </h3>
            <div className="flex items-center gap-4 mb-5">
              {settings.headmasterPhoto ? (
                <img
                  src={settings.headmasterPhoto}
                  alt="Headmaster"
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-emerald-400/60 flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7 text-emerald-300" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-lg text-white">
                  {lang === 'bn' ? settings.headmasterNameBn : settings.headmasterNameEn}
                </h4>
                <p className="text-xs text-slate-300">{settings.headmasterQualification}</p>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed line-clamp-5">
              {lang === 'bn' ? settings.headmasterMessageBn : settings.headmasterMessageEn}
            </p>
          </div>
          <button
            onClick={() => navigateTo('headmaster')}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            {t.readMore}
          </button>
        </div>
      </section>

      {/* ACADEMIC QUICK ACCESS GRID */}
      <section className="bg-slate-100/80 py-12 px-4 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-[#0F2942] text-center mb-8">
            {lang === 'bn' ? 'প্রয়োজনীয় একাডেমিক ও প্রশাসনিক সেবাসমূহ' : 'Essential Academic & Administrative Services'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { id: 'class-routine', title: t.navClassRoutine, desc: lang === 'bn' ? 'শ্রেণি ও শাখাভিত্তিক দৈনিক ক্লাস রুটিন' : 'Class & section-wise daily schedule', icon: Clock, badge: '6-10' },
              { id: 'exam-routine', title: t.navExamRoutine, desc: lang === 'bn' ? 'অর্ধবার্ষিক ও বার্ষিক পরীক্ষার সময়সূচি' : 'Half-yearly & annual exam schedules', icon: Calendar, badge: 'Exam' },
              { id: 'exam-results', title: t.navExamResults, desc: lang === 'bn' ? 'রোল বা ID দিয়ে বিষয়ভিত্তিক নম্বর ও GPA' : 'Search marks & GPA by Roll or ID', icon: FileCheck, badge: 'GPA' },
              { id: 'admission', title: t.navAdmission, desc: lang === 'bn' ? 'ভর্তি যোগ্যতা, নিয়মাবলি ও আবেদন ফরম' : 'Admission eligibility & application form', icon: GraduationCap, badge: 'New' },
            ].map((card) => (
              <div
                key={card.id}
                onClick={() => navigateTo(card.id)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#0F2942]/5 text-[#0F2942] group-hover:bg-emerald-600 group-hover:text-white transition">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {card.badge}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition">
                  {card.title}
                </h4>
                <p className="text-sm text-slate-500 mt-1.5">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS & ACHIEVEMENTS */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latest News */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#0F2942]">{t.newsEventsTitle}</h3>
            <button
              onClick={() => navigateTo('news-events')}
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              {t.viewAllNews} →
            </button>
          </div>
          <div className="space-y-4">
            {news.length === 0 ? (
              <EmptyPlaceholderCard text={t.noDataPlaceholder} />
            ) : (
              news.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer flex flex-col sm:flex-row gap-4"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt="News"
                      className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-36 h-28 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-emerald-700">{item.date}</span>
                    <h4 className="font-bold text-slate-900 mt-1 mb-1.5">
                      {lang === 'bn' ? item.titleBn : item.titleEn}
                    </h4>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {lang === 'bn' ? item.summaryBn : item.summaryEn}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="lg:col-span-5">
          <h3 className="text-2xl font-bold text-[#0F2942] mb-6">{t.achievementsTitle}</h3>
          <div className="space-y-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Award className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#0F2942] text-white">
                    {ach.year}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900">
                  {lang === 'bn' ? ach.titleBn : ach.titleEn}
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  {lang === 'bn' ? ach.descBn : ach.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEACHERS & GALLERY PREVIEW */}
      <section className="bg-white py-14 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-14">
          {/* Teachers Preview */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#0F2942]">{t.teachersPreviewTitle}</h3>
              <button
                onClick={() => navigateTo('teachers')}
                className="text-sm font-semibold text-emerald-700 hover:underline"
              >
                {t.viewAllTeachers} →
              </button>
            </div>
            {teachers.length === 0 ? (
              <EmptyPlaceholderCard text={t.noDataPlaceholder} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {teachers.slice(0, 4).map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} lang={lang} />
                ))}
              </div>
            )}
          </div>

          {/* Photo Gallery Preview */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#0F2942]">{t.galleryPreviewTitle}</h3>
              <div className="flex gap-4 text-sm font-semibold">
                <button
                  onClick={() => navigateTo('photo-gallery')}
                  className="text-emerald-700 hover:underline"
                >
                  {t.navPhotoGallery} →
                </button>
                <button
                  onClick={() => navigateTo('video-gallery')}
                  className="text-[#0F2942] hover:underline"
                >
                  {t.navVideoGallery} →
                </button>
              </div>
            </div>
            {photos.length === 0 ? (
              <EmptyPlaceholderCard text={t.noDataPlaceholder} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-pointer border border-slate-200"
                  >
                    <img
                      src={photo.url}
                      alt={photo.captionBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                      <p className="text-white text-xs font-semibold line-clamp-1">
                        {lang === 'bn' ? photo.captionBn : photo.captionEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// REUSABLE SUB-PAGES (PAGES 2 TO 18)
// ============================================================================
function PageHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="bg-gradient-to-r from-[#0F2942] to-[#173E63] text-white py-10 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {Icon && (
          <div className="p-3.5 rounded-2xl bg-white/10 text-emerald-400">
            <Icon className="w-7 h-7" />
          </div>
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-emerald-300 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function EmptyPlaceholderCard({ text }) {
  return (
    <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
      <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

// Pages 2, 3, 8: Text Content Pages (About, History, Academic Info)
function TextContentPage({ title, subtitle, content, icon, lang, metaCards = [] }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} icon={icon} />
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {metaCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metaCards.map((m, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="text-base font-bold text-[#0F2942] mt-1">{m.value}</p>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

// Page 4: Message from Headmaster
function HeadmasterPage({ lang, t, settings }) {
  return (
    <div>
      <PageHeader title={t.navHeadmaster} subtitle={lang === 'bn' ? settings.schoolNameBn : settings.schoolNameEn} icon={UserCheck} />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 bg-[#0F2942] text-white p-8 flex flex-col items-center text-center justify-center">
            {settings.headmasterPhoto ? (
              <img
                src={settings.headmasterPhoto}
                alt="Headmaster"
                className="w-36 h-36 rounded-full object-cover border-4 border-emerald-400 mb-4"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-white/10 border-4 border-emerald-400/60 flex items-center justify-center mb-4">
                <Users className="w-14 h-14 text-emerald-300" />
              </div>
            )}
            <h3 className="text-xl font-bold">
              {lang === 'bn' ? settings.headmasterNameBn : settings.headmasterNameEn}
            </h3>
            <p className="text-xs text-emerald-300 mt-1">{settings.headmasterQualification}</p>
            <span className="mt-3 text-xs bg-white/10 px-3 py-1 rounded-full">
              {lang === 'bn' ? 'প্রধান শিক্ষক' : 'Headmaster'}
            </span>
          </div>
          <div className="md:col-span-8 p-8 sm:p-10">
            <h4 className="text-xl font-bold text-[#0F2942] mb-4 border-b border-slate-100 pb-3">
              {t.headmasterTitle}
            </h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
              {lang === 'bn' ? settings.headmasterMessageBn : settings.headmasterMessageEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page 5: Mission & Vision
function MissionVisionPage({ lang, t, settings }) {
  return (
    <div>
      <PageHeader title={t.navMission} subtitle={lang === 'bn' ? 'আমাদের আদর্শ ও ভবিষ্যৎ পরিকল্পনা' : 'Our Core Ideals & Future Roadmap'} icon={Target} />
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border-t-4 border-[#0F2942] shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0F2942] flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-[#0F2942] mb-3">
            {lang === 'bn' ? 'আমাদের লক্ষ্য (Mission)' : 'Our Mission'}
          </h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {lang === 'bn' ? settings.missionBn : settings.missionEn}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border-t-4 border-emerald-600 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-800 mb-3">
            {lang === 'bn' ? 'আমাদের উদ্দেশ্য (Vision)' : 'Our Vision'}
          </h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {lang === 'bn' ? settings.visionBn : settings.visionEn}
          </p>
        </div>
      </div>
    </div>
  );
}

// Page 6: Teachers & Staff
function TeacherCard({ teacher, lang }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
        {teacher.photoUrl ? (
          <img src={teacher.photoUrl} alt={teacher.nameBn} className="w-full h-full object-cover" />
        ) : (
          <Users className="w-14 h-14 text-slate-300" />
        )}
      </div>
      <div className="p-5">
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
          {lang === 'bn' ? teacher.designationBn : teacher.designationEn}
        </span>
        <h4 className="font-bold text-lg text-[#0F2942] mt-2">
          {lang === 'bn' ? teacher.nameBn : teacher.nameEn}
        </h4>
        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
          <p>
            <strong>{lang === 'bn' ? 'শিক্ষাগত যোগ্যতা:' : 'Qualification:'}</strong> {teacher.qualification}
          </p>
          <p>
            <strong>{lang === 'bn' ? 'বিষয়:' : 'Subject:'}</strong> {teacher.subject}
          </p>
          <p>
            <strong>{lang === 'bn' ? 'যোগাযোগ:' : 'Contact:'}</strong> {teacher.contact}
          </p>
        </div>
      </div>
    </div>
  );
}

function TeachersPage({ lang, t, teachers }) {
  return (
    <div>
      <PageHeader title={t.navTeachers} subtitle={lang === 'bn' ? 'সম্মানিত শিক্ষক ও কর্মচারীবৃন্দের তালিকা' : 'Directory of Faculty & Staff'} icon={Users} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {teachers.length === 0 ? (
          <EmptyPlaceholderCard text={t.noDataPlaceholder} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page 7: Student Information (Public Summary + Admin Privacy Notice)
function StudentInfoPage({ lang, t, studentStats, onAdminClick }) {
  return (
    <div>
      <PageHeader title={t.navStudents} subtitle={lang === 'bn' ? 'শ্রেণিভিত্তিক শিক্ষার্থী পরিসংখ্যান' : 'Class-wise Student Summary Statistics'} icon={GraduationCap} />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                {lang === 'bn' ? 'শিক্ষার্থীদের ব্যক্তিগত তথ্যের গোপনীয়তা সংরক্ষিত' : 'Student Personal Data Privacy Protected'}
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                {lang === 'bn'
                  ? 'নিরাপত্তার স্বার্থে শিক্ষার্থীদের ব্যক্তিগত রেকর্ড শুধুমাত্র অনুমোদিত অ্যাডমিন প্যানেলে সংরক্ষিত ও দৃশ্যমান।'
                  : 'For data protection, individual student personal records are strictly restricted to authorized Admin users.'}
              </p>
            </div>
          </div>
          <button
            onClick={onAdminClick}
            className="bg-[#0F2942] text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0"
          >
            {t.adminPanel}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0F2942] text-white">
                <tr>
                  <th className="py-3.5 px-5">{lang === 'bn' ? 'শ্রেণি' : 'Class'}</th>
                  <th className="py-3.5 px-5">{lang === 'bn' ? 'ছাত্র সংখ্যা' : 'Male Students'}</th>
                  <th className="py-3.5 px-5">{lang === 'bn' ? 'ছাত্রী সংখ্যা' : 'Female Students'}</th>
                  <th className="py-3.5 px-5">{lang === 'bn' ? 'মোট শিক্ষার্থী' : 'Total Students'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentStats.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      {lang === 'bn' ? `${row.className}ম/ষ্ঠ শ্রেণি` : `Class ${row.className}`}
                    </td>
                    <td className="py-3.5 px-5">{row.boys}</td>
                    <td className="py-3.5 px-5">{row.girls}</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- শ্রেণি ও পরীক্ষার কাঠামো: ১ম–৫ম = প্রান্তিক, ৬ষ্ঠ–৯ম = অর্ধবার্ষিক/বার্ষিক, ১০ম = প্রাক-নির্বাচনী/নির্বাচনী ----
const CLASS_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
function toBnDigits(v) {
  return String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
}
function classLabel(c, lang) {
  return lang === 'bn' ? `শ্রেণি ${toBnDigits(c)}` : `Class ${c}`;
}
function termOptions(cls) {
  const c = Number(cls);
  if (c <= 5) {
    return [
      { v: '1st Terminal Examination', bn: '১ম প্রান্তিক পরীক্ষা', en: '1st Terminal Examination' },
      { v: '2nd Terminal Examination', bn: '২য় প্রান্তিক পরীক্ষা', en: '2nd Terminal Examination' },
      { v: '3rd Terminal Examination', bn: '৩য় প্রান্তিক পরীক্ষা', en: '3rd Terminal Examination' }
    ];
  }
  if (c <= 9) {
    return [
      { v: 'Half-Yearly Examination', bn: 'অর্ধবার্ষিক পরীক্ষা', en: 'Half-Yearly Examination' },
      { v: 'Annual Examination', bn: 'বার্ষিক পরীক্ষা', en: 'Annual Examination' }
    ];
  }
  return [
    { v: 'Pre-Test Examination', bn: 'প্রাক-নির্বাচনী পরীক্ষা', en: 'Pre-Test Examination' },
    { v: 'Test Examination', bn: 'নির্বাচনী পরীক্ষা', en: 'Test Examination' }
  ];
}
function examLabel(name, lang) {
  const all = [...termOptions(1), ...termOptions(6), ...termOptions(10)];
  const o = all.find((x) => x.v === name);
  return o ? (lang === 'bn' ? o.bn : o.en) : name;
}
function ClassOptions({ lang, all }) {
  return (
    <>
      {all && <option value="ALL">{lang === 'bn' ? 'সব শ্রেণি' : 'All Classes'}</option>}
      {CLASS_IDS.map((c) => (
        <option key={c} value={c}>{classLabel(c, lang)}</option>
      ))}
    </>
  );
}

// Page 9: Class Routine
function ClassRoutinePage({ lang, t, routines }) {
  const [selectedClass, setSelectedClass] = useState('6');
  const filtered = routines.filter((r) => r.className === selectedClass);

  return (
    <div>
      <PageHeader title={t.navClassRoutine} subtitle={lang === 'bn' ? 'শ্রেণিভিত্তিক দৈনিক পাঠদান সময়সূচি' : 'Class-wise Daily Academic Schedule'} icon={Clock} />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-700">{t.selectClass}:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-600"
            >
              <ClassOptions lang={lang} />
            </select>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-[#0F2942] text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printSheet}</span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyPlaceholderCard text={t.noDataPlaceholder} />
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-emerald-700 text-white px-5 py-3 font-bold flex justify-between">
                  <span>{r.dayBn}</span>
                  <span>
                    {lang === 'bn' ? `শ্রেণি: ${r.className} | শাখা: ${r.section}` : `Class: ${r.className} | Section: ${r.section}`}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {r.periods.map((p, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-xs font-bold text-emerald-700">{p.time}</p>
                      <p className="font-bold text-slate-900 mt-1">{p.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.teacher}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page 10: Exam Routine
function ExamRoutinePage({ lang, t, examRoutines }) {
  const [selectedClass, setSelectedClass] = useState('ALL');
  const filtered =
    selectedClass === 'ALL'
      ? examRoutines
      : examRoutines.filter((e) => e.className === selectedClass);

  return (
    <div>
      <PageHeader title={t.navExamRoutine} subtitle={lang === 'bn' ? 'আসন্ন ও চলমান পরীক্ষার সময়সূচি' : 'Upcoming & Ongoing Examination Schedule'} icon={Calendar} />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-900 space-y-1 print:hidden">
          <p className="font-bold">{lang === 'bn' ? 'পরীক্ষা পদ্ধতি' : 'Examination System'}</p>
          <p>{lang === 'bn' ? '১ম–৫ম শ্রেণি: ১ম, ২য় ও ৩য় প্রান্তিক পরীক্ষা' : 'Classes 1–5: 1st, 2nd & 3rd Terminal Examinations'}</p>
          <p>{lang === 'bn' ? '৬ষ্ঠ–৯ম শ্রেণি: অর্ধবার্ষিক ও বার্ষিক পরীক্ষা' : 'Classes 6–9: Half-Yearly & Annual Examinations'}</p>
          <p>{lang === 'bn' ? '১০ম শ্রেণি: প্রাক-নির্বাচনী ও নির্বাচনী পরীক্ষা' : 'Class 10: Pre-Test & Test Examinations'}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-700">{t.selectClass}:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 outline-none"
            >
              <ClassOptions lang={lang} all />
            </select>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-[#0F2942] text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printSheet}</span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyPlaceholderCard text={t.noDataPlaceholder} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#0F2942] text-white">
                  <tr>
                    <th className="py-3.5 px-5">{lang === 'bn' ? 'পরীক্ষার নাম' : 'Exam Name'}</th>
                    <th className="py-3.5 px-5">{lang === 'bn' ? 'শ্রেণি' : 'Class'}</th>
                    <th className="py-3.5 px-5">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="py-3.5 px-5">{lang === 'bn' ? 'সময়' : 'Time'}</th>
                    <th className="py-3.5 px-5">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                    <th className="py-3.5 px-5">{lang === 'bn' ? 'কক্ষ' : 'Room'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-5 font-semibold text-emerald-700">{examLabel(item.examName, lang)}</td>
                      <td className="py-3.5 px-5 font-bold">{classLabel(item.className, lang)}</td>
                      <td className="py-3.5 px-5">{item.date}</td>
                      <td className="py-3.5 px-5">{item.time}</td>
                      <td className="py-3.5 px-5 font-semibold">{item.subjectBn}</td>
                      <td className="py-3.5 px-5">{item.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Page 11: Interactive Exam Results Portal (NCTB Grading + Printable Marksheet)
function ExamResultsPage({ lang, t, results, settings }) {
  const [examName, setExamName] = useState('Annual Examination');
  const [className, setClassName] = useState('6');
  const [queryId, setQueryId] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundResult, setFoundResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    const q = queryId.trim().toLowerCase();
    const match = results.find(
      (r) =>
        r.examName === examName &&
        r.className === className &&
        (r.rollNo.toLowerCase() === q || r.studentId.toLowerCase() === q)
    );
    setFoundResult(match || null);
  };

  return (
    <div>
      <PageHeader
        title={t.navExamResults}
        subtitle={lang === 'bn' ? 'অনলাইন ফলাফল ও একাডেমিক ট্রান্সক্রিপ্ট অনুসন্ধান' : 'Online Result & Academic Transcript Portal'}
        icon={Award}
      />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 print:hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.selectExam}</label>
              <select
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-emerald-600"
              >
                <option value="Half-Yearly Examination">{t.halfYearly}</option>
                <option value="Annual Examination">{t.annualExam}</option>
                <option value="Pre-Test Examination">{t.preTest}</option>
                <option value="Test Examination">{t.testExam}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.selectClass}</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-emerald-600"
              >
                <option value="6">{t.class6}</option>
                <option value="7">{t.class7}</option>
                <option value="8">{t.class8}</option>
                <option value="9">{t.class9}</option>
                <option value="10">{t.class10}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.enterRollOrId}</label>
              <input
                type="text"
                required
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="e.g. 101 or PZS-2026-01"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? `বর্তমানে প্রকাশিত ফলাফল সংখ্যা: ${results.length}টি (অ্যাডমিন প্যানেল থেকে নতুন ফলাফল প্রকাশ করা যাবে)`
                : `Currently published results: ${results.length} (Publish new results via Admin Panel)`}
            </p>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{t.searchResultBtn}</span>
            </button>
          </div>
        </form>

        {/* Result Output */}
        {searched && !foundResult && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
            <p className="font-bold">
              {lang === 'bn'
                ? 'প্রদত্ত তথ্যের বিপরীতে কোনো ফলাফল পাওয়া যায়নি।'
                : 'No published result found matching the entered credentials.'}
            </p>
            <p className="text-xs mt-1 text-rose-700">
              {lang === 'bn'
                ? 'সঠিক পরীক্ষা, শ্রেণি এবং রোল নম্বর/ID যাচাই করুন অথবা অ্যাডমিন প্যানেল থেকে ফলাফল প্রকাশ করুন।'
                : 'Please verify Exam Name, Class, and Roll/ID, or publish the result from the Admin Dashboard.'}
            </p>
          </div>
        )}

        {foundResult && (
          <MarksheetView
            result={foundResult}
            settings={settings}
            lang={lang}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

function MarksheetView({ result, settings, lang, t }) {
  const summary = calculateOverallResult(result.subjects);

  return (
    <div className="bg-white rounded-2xl border-2 border-[#0F2942] shadow-lg overflow-hidden">
      {/* Official Header */}
      <div className="bg-[#0F2942] text-white p-6 text-center">
        <h3 className="text-2xl font-extrabold">
          {lang === 'bn' ? settings.schoolNameBn : settings.schoolNameEn}
        </h3>
        <p className="text-xs text-emerald-300 mt-1">
          {lang === 'bn' ? settings.addressBn : settings.addressEn}
        </p>
        <div className="inline-block mt-3 px-4 py-1 rounded-full bg-white/15 text-sm font-bold">
          {result.examName} — {lang === 'bn' ? 'একাডেমিক ট্রান্সক্রিপ্ট' : 'Academic Transcript'}
        </div>
      </div>

      {/* Student Metadata */}
      <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-xs text-slate-500 block">{t.studentName}</span>
          <strong className="text-slate-900">{result.studentName}</strong>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">{t.studentId}</span>
          <strong className="text-slate-900">{result.studentId}</strong>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">{t.rollNo}</span>
          <strong className="text-slate-900">{result.rollNo}</strong>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">{lang === 'bn' ? 'শ্রেণি' : 'Class'}</span>
          <strong className="text-slate-900">Class {result.className}</strong>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">{t.group}</span>
          <strong className="text-slate-900">{result.group || 'General'}</strong>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">{t.academicYear}</span>
          <strong className="text-slate-900">{result.academicYear}</strong>
        </div>
      </div>

      {/* Subject-wise Marks Table */}
      <div className="p-6">
        <table className="w-full text-sm border border-slate-200">
          <thead className="bg-slate-100 text-slate-800">
            <tr>
              <th className="py-2.5 px-4 border border-slate-200 text-left">{t.subject}</th>
              <th className="py-2.5 px-4 border border-slate-200 text-center">{t.marks}</th>
              <th className="py-2.5 px-4 border border-slate-200 text-center">{t.grade}</th>
              <th className="py-2.5 px-4 border border-slate-200 text-center">{t.gpa}</th>
            </tr>
          </thead>
          <tbody>
            {result.subjects.map((sub, idx) => {
              const g = calculateSubjectGrade(sub.marks);
              return (
                <tr key={idx}>
                  <td className="py-2.5 px-4 border border-slate-200 font-medium">{sub.name}</td>
                  <td className="py-2.5 px-4 border border-slate-200 text-center font-bold">{sub.marks}</td>
                  <td className="py-2.5 px-4 border border-slate-200 text-center font-bold text-[#0F2942]">
                    {g.grade}
                  </td>
                  <td className="py-2.5 px-4 border border-slate-200 text-center">{g.gpa.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Box */}
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-600 block">{t.totalMarks}</span>
            <strong className="text-xl text-[#0F2942]">{summary.total}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-600 block">{t.gpa}</span>
            <strong className="text-xl text-emerald-700">{summary.gpa}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-600 block">{t.grade}</span>
            <strong className="text-xl text-[#0F2942]">{summary.grade}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-600 block">{t.resultStatus}</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                summary.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {summary.passed ? t.passed : t.failed}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-[#0F2942] hover:bg-[#183C5E] text-white font-semibold px-5 py-2.5 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printSheet}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Page 12: Admission Information
function AdmissionPage({ lang, t, settings, showToast }) {
  const [applicantName, setApplicantName] = useState('');
  const [targetClass, setTargetClass] = useState('6');
  const [guardianPhone, setGuardianPhone] = useState('');

  const handleInquiry = (e) => {
    e.preventDefault();
    showToast(
      lang === 'bn'
        ? 'ভর্তি তথ্য অনুসন্ধান সফলভাবে গৃহীত হয়েছে!'
        : 'Admission inquiry submitted successfully!'
    );
    setApplicantName('');
    setGuardianPhone('');
  };

  return (
    <div>
      <PageHeader title={t.navAdmission} subtitle={lang === 'bn' ? 'নতুন শিক্ষাবর্ষে ভর্তি নির্দেশিকা ও আবেদন' : 'Admission Guidelines & Application Inquiry'} icon={GraduationCap} />
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-[#0F2942]">
            {lang === 'bn' ? 'ভর্তি সংক্রান্ত প্রয়োজনীয় নির্দেশাবলি' : 'Admission Guidelines & Requirements'}
          </h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {lang === 'bn' ? settings.admissionInfoBn : settings.admissionInfoEn}
          </p>
        </div>

        <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-[#0F2942] mb-4">
            {lang === 'bn' ? 'অনলাইন ভর্তি তথ্য ফরম' : 'Admission Inquiry Form'}
          </h3>
          <form onSubmit={handleInquiry} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Applicant Name'}
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'ভর্তিচ্ছু শ্রেণি' : 'Applying for Class'}
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="6">{t.class6}</option>
                <option value="7">{t.class7}</option>
                <option value="8">{t.class8}</option>
                <option value="9">{t.class9}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'অভিভাবকের মোবাইল নম্বর' : 'Guardian Mobile Number'}
              </label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition"
            >
              {lang === 'bn' ? 'তথ্য পাঠান' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Page 13: Notice Board
function NoticeBoardPage({ lang, t, notices, setSelectedNotice }) {
  const [catFilter, setCatFilter] = useState('ALL');
  const filtered =
    catFilter === 'ALL' ? notices : notices.filter((n) => n.category === catFilter);

  return (
    <div>
      <PageHeader title={t.navNotice} subtitle={lang === 'bn' ? 'সকল অফিসিয়াল বিজ্ঞপ্তি ও নির্দেশনা' : 'All Official Circulars & Announcements'} icon={Bell} />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'Academic', 'Exam', 'Admission', 'General'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                catFilter === cat
                  ? 'bg-[#0F2942] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyPlaceholderCard text={t.noDataPlaceholder} />
        ) : (
          <div className="space-y-4">
            {filtered.map((notice) => (
              <div
                key={notice.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {notice.date}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {notice.category}
                    </span>
                    {notice.isLatest && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {t.latestBadge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2942]">
                    {lang === 'bn' ? notice.titleBn : notice.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {lang === 'bn' ? notice.descriptionBn : notice.descriptionEn}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'বিস্তারিত / PDF' : 'View / PDF'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page 14: News & Events
function NewsEventsPage({ lang, t, news, setSelectedNews }) {
  return (
    <div>
      <PageHeader title={t.navNews} subtitle={lang === 'bn' ? 'বিদ্যালয়ের সাম্প্রতিক কার্যক্রম ও অনুষ্ঠানমালা' : 'Recent School Activities & Events'} icon={ClipboardList} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {news.length === 0 ? (
          <EmptyPlaceholderCard text={t.noDataPlaceholder} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col"
              >
                <div className="h-48 bg-slate-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="News" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-700">{item.date}</span>
                    <h4 className="font-bold text-lg text-[#0F2942] mt-1 mb-2">
                      {lang === 'bn' ? item.titleBn : item.titleEn}
                    </h4>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {lang === 'bn' ? item.summaryBn : item.summaryEn}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 mt-4 inline-block">
                    {t.readMore} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page 15: Photo Gallery
function PhotoGalleryPage({ lang, t, photos, setSelectedPhoto }) {
  return (
    <div>
      <PageHeader title={t.navPhotoGallery} subtitle={lang === 'bn' ? 'স্মরণীয় মুহূর্ত ও ক্যাম্পাস আলোকচিত্র' : 'Memorable Moments & Campus Photography'} icon={ImageIcon} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {photos.length === 0 ? (
          <EmptyPlaceholderCard text={t.noDataPlaceholder} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-sm"
              >
                <img
                  src={photo.url}
                  alt={photo.captionBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <p className="text-white text-sm font-semibold">
                    {lang === 'bn' ? photo.captionBn : photo.captionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page 16: Video Gallery
function VideoGalleryPage({ lang, t, videos, setSelectedVideo }) {
  return (
    <div>
      <PageHeader title={t.navVideoGallery} subtitle={lang === 'bn' ? 'অনুষ্ঠান ও শিক্ষা কার্যক্রমের ভিডিওচিত্র' : 'Events & Educational Activity Videos'} icon={Video} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {videos.length === 0 ? (
          <EmptyPlaceholderCard text={t.noDataPlaceholder} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setSelectedVideo(vid)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="aspect-video bg-[#0F2942] flex items-center justify-center text-emerald-400">
                  <Video className="w-14 h-14" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-900">
                    {lang === 'bn' ? vid.titleBn : vid.titleEn}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 truncate">{vid.url}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page 17: Facilities
function FacilitiesPage({ lang, t, facilities }) {
  return (
    <div>
      <PageHeader title={t.navFacilities} subtitle={lang === 'bn' ? 'আধুনিক শিক্ষা সহায়ক অবকাঠামো ও সুবিধাসমূহ' : 'Modern Educational Infrastructure & Campus Facilities'} icon={Layers} />
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilities.map((fac) => (
          <div key={fac.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-[#0F2942] mb-2">
              {lang === 'bn' ? fac.titleBn : fac.titleEn}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'bn' ? fac.descBn : fac.descEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Page 18: Contact Us
function ContactPage({ lang, t, settings, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(
      lang === 'bn'
        ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে!'
        : 'Your message has been sent successfully!'
    );
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div>
      <PageHeader title={t.navContact} subtitle={lang === 'bn' ? 'যেকোনো তথ্যের জন্য সরাসরি যোগাযোগ করুন' : 'Get in Touch with School Administration'} icon={Phone} />
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-[#0F2942]">{t.contactFooterTitle}</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-500">{lang === 'bn' ? 'ঠিকানা' : 'Address'}</p>
                <p className="font-semibold text-slate-800">
                  {lang === 'bn' ? settings.addressBn : settings.addressEn}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-500">{lang === 'bn' ? 'ফোন' : 'Phone'}</p>
                <p className="font-semibold text-slate-800">{settings.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-500">{lang === 'bn' ? 'ইমেইল' : 'Email'}</p>
                <p className="font-semibold text-slate-800">{settings.email}</p>
              </div>
            </div>
          </div>

          {/* Google Maps Placeholder */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-sm text-[#0F2942] mb-2">
              {lang === 'bn' ? 'গুগল ম্যাপ লোকেশন' : 'Google Maps Location'}
            </h4>
            {settings.mapEmbedUrl ? (
              <iframe
                src={settings.mapEmbedUrl}
                title="School Location"
                className="w-full h-56 rounded-xl border-0"
                loading="lazy"
              />
            ) : (
              <div className="h-48 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                <MapPin className="w-8 h-8 text-emerald-600 mb-1" />
                <p className="text-xs font-medium">
                  {lang === 'bn'
                    ? '[অ্যাডমিন প্যানেল থেকে Google Maps Embed URL যুক্ত করুন]'
                    : '[Add Google Maps Embed URL from Admin Panel]'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-[#0F2942] mb-5">
            {lang === 'bn' ? 'সরাসরি বার্তা পাঠান' : 'Send Direct Message'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ইমেইল বা ফোন' : 'Email or Phone'}
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'বার্তার বিবরণ' : 'Message'}
              </label>
              <textarea
                rows="5"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#0F2942] hover:bg-[#173D61] text-white font-bold px-6 py-3 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'bn' ? 'বার্তা প্রেরণ করুন' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECURE ADMIN LOGIN SCREEN
// ============================================================================
function AdminDashboard({
  lang,
  setLang,
  siteData,
  setSiteData,
  onLogout,
  onBackToSite,
  showToast,
  onPublish,
  onOpenRoles,
  syncStatus
}) {
  const [tab, setTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: lang === 'bn' ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard Overview', icon: Layers },
    { id: 'notices', label: lang === 'bn' ? 'নোটিশ বোর্ড' : 'Manage Notices', icon: Bell },
    { id: 'news', label: lang === 'bn' ? 'সংবাদ ও ইভেন্ট' : 'News & Events', icon: ClipboardList },
    { id: 'teachers', label: lang === 'bn' ? 'শিক্ষক ও কর্মচারী' : 'Teachers & Staff', icon: Users },
    { id: 'routines', label: lang === 'bn' ? 'ক্লাস ও পরীক্ষার রুটিন' : 'Class & Exam Routines', icon: Calendar },
    { id: 'gallery', label: lang === 'bn' ? 'ছবি ও ভিডিও গ্যালারি' : 'Photo & Video Gallery', icon: ImageIcon },
    { id: 'settings', label: lang === 'bn' ? 'ওয়েবসাইট কন্টেন্ট ও সেটিংস' : 'Site Content & Settings', icon: Building2 },
    { id: 'system', label: lang === 'bn' ? 'সিস্টেম স্ট্যাটাস' : 'System Status', icon: Layers },
  ];

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(siteData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Panipur_Zila_School_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(lang === 'bn' ? 'ডাটাবেস ব্যাকআপ ডাউনলোড হয়েছে!' : 'Database JSON backup downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#0F2942] text-white px-4 py-3.5 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="font-bold text-base sm:text-lg">
              {lang === 'bn' ? 'অ্যাডমিন কন্ট্রোল প্যানেল — পানিপুর জেলা স্কুল' : 'Admin Control Panel — Panipur Zila School'}
            </h1>
            <p className="text-[11px] text-emerald-300">
              {lang === 'bn' ? 'পরিবর্তন নিজে থেকেই ক্লাউডে সংরক্ষিত হয় (সব ডিভাইসে যায়)' : 'Changes are saved to the cloud automatically'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="bg-white/10 hover:bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
          {syncStatus && syncStatus.state !== 'idle' && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${syncStatus.state === 'error' ? 'bg-rose-500/90 text-white' : 'bg-white/15 text-emerald-200'}`}>
              {syncStatus.state === 'saving' && '☁ সংরক্ষণ হচ্ছে…'}
              {syncStatus.state === 'saved' && `☁ সব ডিভাইসে সংরক্ষিত ✓ ${syncStatus.msg}`}
              {syncStatus.state === 'error' && `⚠ ক্লাউডে সংরক্ষণ হয়নি (${syncStatus.msg}) — সিস্টেম স্ট্যাটাস দেখুন`}
            </span>
          )}
          <button
            onClick={onPublish}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-lg"
          >
            {lang === 'bn' ? 'এখনই সংরক্ষণ করুন' : 'Save now'}
          </button>
          <button
            onClick={onOpenRoles}
            className="bg-white/10 hover:bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            {lang === 'bn' ? 'ব্যবহারকারী ও রোল' : 'Users & Roles'}
          </button>
          <button
            onClick={onBackToSite}
            className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'লাইভ ওয়েবসাইট দেখুন' : 'View Live Site'}</span>
          </button>
          <button
            onClick={onLogout}
            className="bg-rose-600 hover:bg-rose-500 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-1.5">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition ${
                tab === item.id
                  ? 'bg-[#0F2942] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/80'
              }`}
            >
              <item.icon className={`w-4 h-4 ${tab === item.id ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Workspace */}
        <section className="lg:col-span-9">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: lang === 'bn' ? 'মোট নোটিশ' : 'Total Notices', count: siteData.notices.length },
                  { label: lang === 'bn' ? 'সংবাদ ও ইভেন্ট' : 'News & Events', count: siteData.news.length },
                  { label: lang === 'bn' ? 'শিক্ষক ও কর্মচারী' : 'Teachers & Staff', count: siteData.teachers.length },
                  { label: lang === 'bn' ? 'সুরক্ষিত শিক্ষার্থী রেকর্ড' : 'Protected Students', count: siteData.students.length },
                  { label: lang === 'bn' ? 'প্রকাশিত ফলাফল' : 'Published Results', count: siteData.results.length },
                  { label: lang === 'bn' ? 'গ্যালারি মিডিয়া' : 'Gallery Media', count: siteData.photos.length + siteData.videos.length },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
                    <p className="text-3xl font-extrabold text-[#0F2942] mt-1">{stat.count}</p>
                  </div>
                ))}
              </div>

              {/* Backup & System Security Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-[#0F2942] flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>{lang === 'bn' ? 'ডাটাবেস ব্যাকআপ ও নিরাপত্তা' : 'Database Backup & Security'}</span>
                </h3>
                <p className="text-sm text-slate-600">
                  {lang === 'bn'
                    ? 'নিয়মিত ব্যাকআপ সংরক্ষণের জন্য নিচের বাটনে ক্লিক করে সম্পূর্ণ ওয়েবসাইটের JSON ব্যাকআপ ডাউনলোড করুন।'
                    : 'Download a full JSON backup of all notices, teacher records, student records, and results for safekeeping.'}
                </p>
                <button
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'সম্পূর্ণ ব্যাকআপ ডাউনলোড (JSON)' : 'Download Full Backup (JSON)'}</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'notices' && (
            <AdminNoticesManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}

          {tab === 'news' && (
            <AdminNewsManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}

          {tab === 'teachers' && (
            <AdminTeachersManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}

          {tab === 'students' && (
            <AdminStudentsManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}

          {tab === 'routines' && (
            <AdminRoutinesManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}

          {tab === 'results' && (
            <AdminResultsManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}

          {tab === 'gallery' && (
            <AdminGalleryManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}

          {tab === 'system' && <SystemCheck lang={lang} />}

          {tab === 'settings' && (
            <AdminSettingsManager lang={lang} siteData={siteData} setSiteData={setSiteData} showToast={showToast} />
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// ADMIN SUB-MANAGERS (CRUD OPERATIONS)
// ============================================================================

// 1. Notices Manager (Add, Edit, Delete)
function AdminNoticesManager({ lang, siteData, setSiteData, showToast }) {
  const [editingId, setEditingId] = useState(null);
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('Academic');
  const [isLatest, setIsLatest] = useState(true);
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitleBn('');
    setTitleEn('');
    setDescriptionBn('');
    setDescriptionEn('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const entry = {
      id: editingId || `notice-${Date.now()}`,
      titleBn,
      titleEn: titleEn || titleBn,
      date,
      category,
      isLatest,
      descriptionBn,
      descriptionEn: descriptionEn || descriptionBn,
      attachmentName: 'Official_Circular.pdf'
    };

    if (editingId) {
      setSiteData({
        ...siteData,
        notices: siteData.notices.map((n) => (n.id === editingId ? entry : n))
      });
      showToast(lang === 'bn' ? 'নোটিশ আপডেট হয়েছে!' : 'Notice updated!');
    } else {
      setSiteData({
        ...siteData,
        notices: [entry, ...siteData.notices]
      });
      showToast(lang === 'bn' ? 'নতুন নোটিশ প্রকাশিত হয়েছে!' : 'New notice published!');
    }
    resetForm();
  };

  const handleEdit = (n) => {
    setEditingId(n.id);
    setTitleBn(n.titleBn);
    setTitleEn(n.titleEn);
    setDate(n.date);
    setCategory(n.category);
    setIsLatest(n.isLatest);
    setDescriptionBn(n.descriptionBn);
    setDescriptionEn(n.descriptionEn);
  };

  const handleDelete = (id) => {
    setSiteData({
      ...siteData,
      notices: siteData.notices.filter((n) => n.id !== id)
    });
    showToast(lang === 'bn' ? 'নোটিশ মুছে ফেলা হয়েছে' : 'Notice deleted');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {editingId
            ? (lang === 'bn' ? 'নোটিশ সম্পাদনা করুন' : 'Edit Notice')
            : (lang === 'bn' ? 'নতুন নোটিশ প্রকাশ করুন' : 'Publish New Notice')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="নোটিশের শিরোনাম (বাংলা)"
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Notice Title (English)"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          >
            <option value="Academic">Academic</option>
            <option value="Exam">Exam</option>
            <option value="Admission">Admission</option>
            <option value="General">General</option>
          </select>
        </div>
        <textarea
          rows="3"
          required
          placeholder="বিস্তারিত বিবরণ (বাংলা)..."
          value={descriptionBn}
          onChange={(e) => setDescriptionBn(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
        />
        <textarea
          rows="2"
          placeholder="Detailed Description (English)..."
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isLatest}
              onChange={(e) => setIsLatest(e.target.checked)}
            />
            <span>Highlight as Latest Notice</span>
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
            >
              {editingId ? 'Update Notice' : 'Publish Notice'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {siteData.notices.map((n) => (
          <div key={n.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">{n.date} • {n.category}</p>
              <h4 className="font-bold text-slate-900 text-sm">{n.titleBn}</h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(n)}
                className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(n.id)}
                className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. News Manager
function AdminNewsManager({ lang, siteData, setSiteData, showToast }) {
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summaryBn, setSummaryBn] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const item = {
      id: `news-${Date.now()}`,
      titleBn,
      titleEn: titleEn || titleBn,
      date,
      summaryBn,
      summaryEn: summaryEn || summaryBn,
      imageUrl
    };
    setSiteData({ ...siteData, news: [item, ...siteData.news] });
    setTitleBn('');
    setTitleEn('');
    setSummaryBn('');
    setSummaryEn('');
    setImageUrl('');
    showToast(lang === 'bn' ? 'সংবাদ প্রকাশিত হয়েছে!' : 'News published!');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {lang === 'bn' ? 'নতুন সংবাদ ও ইভেন্ট যুক্ত করুন' : 'Add News & Event'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="সংবাদের শিরোনাম (বাংলা)"
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="News Title (English)"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <ImageUploadField label={lang === 'bn' ? 'সংবাদের ছবি (ঐচ্ছিক)' : 'News Image (Optional)'} value={imageUrl} onChange={setImageUrl} maxDim={900} quality={0.72} />
        </div>
        <textarea
          rows="3"
          required
          placeholder="বিস্তারিত সংবাদ (বাংলা)..."
          value={summaryBn}
          onChange={(e) => setSummaryBn(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
        />
        <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Publish News
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {siteData.news.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">{item.date}</p>
              <h4 className="font-bold text-sm">{item.titleBn}</h4>
            </div>
            <button
              onClick={() =>
                setSiteData({ ...siteData, news: siteData.news.filter((x) => x.id !== item.id) })
              }
              className="p-2 rounded-lg bg-rose-50 text-rose-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Teachers & Staff Manager
function AdminTeachersManager({ lang, siteData, setSiteData, showToast }) {
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [designationBn, setDesignationBn] = useState('');
  const [designationEn, setDesignationEn] = useState('');
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState('');
  const [contact, setContact] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const importFromPortal = async () => {
    try {
      const m = await fetchSchoolMeta();
      if (!m) {
        showToast(lang === 'bn' ? 'পোর্টালে এখনো তথ্য প্রকাশিত হয়নি। ফলাফল পোর্টালে একবার লগইন করুন।' : 'No data from the result portal yet. Log in there once.', 'error');
        return;
      }
      const bnD = (v) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
      const have = new Set(siteData.teachers.map((x) => (x.nameBn || '').trim()));
      const byName = new Map();
      const note = (name, key) => {
        const n = (name || '').trim();
        if (!n || have.has(n)) return;
        if (!byName.has(n)) byName.set(n, { head: false, asst: false, classes: [] });
        const o = byName.get(n);
        if (key === 'head') o.head = true;
        else if (key === 'asst') o.asst = true;
        else o.classes.push(key);
      };
      note(m.head, 'head');
      note(m.asst, 'asst');
      Object.keys(m.classTeachers || {}).sort((a, b) => Number(a) - Number(b)).forEach((c) => note(m.classTeachers[c].name, c));
      const added = [];
      byName.forEach((o, n) => {
        const bnParts = [];
        const enParts = [];
        if (o.head) { bnParts.push('প্রধান শিক্ষক'); enParts.push('Headmaster'); }
        if (o.asst) { bnParts.push('সহকারী প্রধান শিক্ষক'); enParts.push('Assistant Headmaster'); }
        if (o.classes.length) {
          bnParts.push('শ্রেণি শিক্ষক – শ্রেণি ' + o.classes.map(bnD).join(', '));
          enParts.push('Class Teacher – Class ' + o.classes.join(', '));
        }
        added.push({ id: `teacher-${Date.now()}-${added.length}`, nameBn: n, nameEn: n, designationBn: bnParts.join(' ও '), designationEn: enParts.join(' & '), qualification: '', subject: '', contact: '', photoUrl: '', source: 'portal' });
      });
      const s = { ...siteData.settings };
      if (m.eiin && String(s.eiin || '').startsWith('[')) s.eiin = m.eiin;
      if (m.head && String(s.headmasterNameBn || '').startsWith('[')) s.headmasterNameBn = m.head;
      setSiteData({ ...siteData, settings: s, teachers: [...siteData.teachers, ...added] });
      showToast(lang === 'bn' ? `ফলাফল পোর্টাল থেকে ${bnD(added.length)} জন যুক্ত হয়েছে। এবার ছবি ও বিস্তারিত যোগ করুন।` : `${added.length} imported from the result portal. Now add photos and details.`);
    } catch {
      showToast(lang === 'bn' ? 'পোর্টাল থেকে তথ্য আনা যায়নি' : 'Could not import from the portal', 'error');
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const teacher = {
      id: `teacher-${Date.now()}`,
      nameBn,
      nameEn: nameEn || nameBn,
      designationBn,
      designationEn: designationEn || designationBn,
      qualification,
      subject,
      contact,
      photoUrl
    };
    setSiteData({ ...siteData, teachers: [...siteData.teachers, teacher] });
    setNameBn('');
    setNameEn('');
    setDesignationBn('');
    setDesignationEn('');
    setQualification('');
    setSubject('');
    setContact('');
    setPhotoUrl('');
    showToast(lang === 'bn' ? 'শিক্ষকের তথ্য সংযুক্ত হয়েছে!' : 'Teacher profile added!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-emerald-900 max-w-xl">
          {lang === 'bn'
            ? 'ফলাফল পোর্টালে দেওয়া প্রধান শিক্ষক, সহকারী প্রধান শিক্ষক ও শ্রেণি শিক্ষকদের নাম এখানে আনুন। এরপর শুধু ছবি ও বিস্তারিত যোগ করলেই হবে।'
            : 'Import the headmaster, assistant headmaster and class teachers entered in the result portal, then just add photos and details.'}
        </p>
        <button type="button" onClick={importFromPortal} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
          {lang === 'bn' ? 'ফলাফল পোর্টাল থেকে আনুন' : 'Import from Result Portal'}
        </button>
      </div>
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {lang === 'bn' ? 'শিক্ষক ও কর্মচারী সংযোজন' : 'Add Teacher / Staff Profile'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" required placeholder="নাম (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Full Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="পদবি (বাংলা, যেমন: সহকারী শিক্ষক)" value={designationBn} onChange={(e) => setDesignationBn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Designation (English)" value={designationEn} onChange={(e) => setDesignationEn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="শিক্ষাগত যোগ্যতা (Qualification)" value={qualification} onChange={(e) => setQualification(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="পাঠদানের বিষয় (Subject)" value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="যোগাযোগের নম্বর / ইমেইল" value={contact} onChange={(e) => setContact(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <ImageUploadField label={lang === 'bn' ? 'শিক্ষকের ছবি' : 'Teacher Photo'} value={photoUrl} onChange={setPhotoUrl} maxDim={360} className="sm:col-span-2" />
        </div>
        <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Save Teacher Profile
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {siteData.teachers.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">No teachers added yet.</p>
        ) : (
          siteData.teachers.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{t.nameBn} ({t.designationBn})</h4>
                <p className="text-xs text-slate-500">{t.qualification} • {t.subject} • {t.contact}</p>
              </div>
              <button
                onClick={() =>
                  setSiteData({ ...siteData, teachers: siteData.teachers.filter((x) => x.id !== t.id) })
                }
                className="p-2 rounded-lg bg-rose-50 text-rose-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 4. Protected Students Manager (Strictly Visible Only to Admin)
function AdminStudentsManager({ lang, siteData, setSiteData, showToast }) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('6');
  const [rollNo, setRollNo] = useState('');
  const [group, setGroup] = useState('General');
  const [academicYear, setAcademicYear] = useState('2026');

  const handleAdd = (e) => {
    e.preventDefault();
    const student = {
      id: `std-${Date.now()}`,
      studentId,
      name,
      className,
      rollNo,
      group,
      academicYear
    };
    setSiteData({ ...siteData, students: [student, ...siteData.students] });
    setStudentId('');
    setName('');
    setRollNo('');
    showToast(lang === 'bn' ? 'শিক্ষার্থীর রেকর্ড সংরক্ষিত হয়েছে!' : 'Student record saved securely!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          {lang === 'bn'
            ? 'এই সেকশনটি পাসওয়ার্ড সুরক্ষিত। সাধারণ ভিজিটররা শিক্ষার্থীদের ব্যক্তিগত তথ্য দেখতে পারবেন না।'
            : 'This database section is strictly protected. Public visitors cannot access personal student records.'}
        </span>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {lang === 'bn' ? 'নতুন শিক্ষার্থী তথ্য যুক্ত করুন' : 'Add Student Record'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input type="text" required placeholder="Student ID (e.g. PZS-2026-01)" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="শিক্ষার্থীর পূর্ণ নাম" value={name} onChange={(e) => setName(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <select value={className} onChange={(e) => setClassName(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm">
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
          <input type="text" required placeholder="রোল নম্বর (Roll No)" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <select value={group} onChange={(e) => setGroup(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm">
            <option value="General">General (6-8)</option>
            <option value="Science">Science</option>
            <option value="Humanities">Humanities</option>
            <option value="Business Studies">Business Studies</option>
          </select>
          <input type="text" required placeholder="শিক্ষাবর্ষ (Academic Year)" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-[#0F2942] text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Save Student Record
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-800">
            <tr>
              <th className="p-3">Student ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Roll</th>
              <th className="p-3">Group</th>
              <th className="p-3">Session</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {siteData.students.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500">No student records added yet.</td>
              </tr>
            ) : (
              siteData.students.map((s) => (
                <tr key={s.id}>
                  <td className="p-3 font-bold">{s.studentId}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">Class {s.className}</td>
                  <td className="p-3">{s.rollNo}</td>
                  <td className="p-3">{s.group}</td>
                  <td className="p-3">{s.academicYear}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        setSiteData({ ...siteData, students: siteData.students.filter((x) => x.id !== s.id) })
                      }
                      className="text-rose-600 hover:underline font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5. Exam & Class Routines Manager
function AdminRoutinesManager({ lang, siteData, setSiteData, showToast }) {
  const [examName, setExamName] = useState('Annual Examination');
  const [className, setClassName] = useState('6');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 01:00 PM');
  const [subjectBn, setSubjectBn] = useState('');
  const [room, setRoom] = useState('');

  const handleAddExam = (e) => {
    e.preventDefault();
    const item = {
      id: `er-${Date.now()}`,
      examName,
      className,
      date,
      time,
      subjectBn,
      room
    };
    setSiteData({ ...siteData, examRoutines: [item, ...siteData.examRoutines] });
    setDate('');
    setSubjectBn('');
    setRoom('');
    showToast(lang === 'bn' ? 'পরীক্ষার রুটিন প্রকাশিত হয়েছে!' : 'Exam routine entry published!');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddExam} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {lang === 'bn' ? 'পরীক্ষার রুটিন প্রকাশ করুন' : 'Publish Exam Routine Entry'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select value={className} onChange={(e) => { setClassName(e.target.value); setExamName(termOptions(e.target.value)[0].v); }} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm">
            <ClassOptions lang={lang} />
          </select>
          <select value={examName} onChange={(e) => setExamName(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm">
            {termOptions(className).map((o) => (
              <option key={o.v} value={o.v}>{lang === 'bn' ? o.bn : o.en}</option>
            ))}
          </select>
          <input type="text" required placeholder="তারিখ (e.g. 2026-12-05)" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="সময় (10:00 AM - 01:00 PM)" value={time} onChange={(e) => setTime(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="বিষয় (Subject)" value={subjectBn} onChange={(e) => setSubjectBn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="কক্ষ নং (Room No)" value={room} onChange={(e) => setRoom(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Publish Exam Routine
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {siteData.examRoutines.map((er) => (
          <div key={er.id} className="p-4 flex items-center justify-between text-sm">
            <div>
              <strong>{examLabel(er.examName, lang)} ({classLabel(er.className, lang)})</strong> — {er.subjectBn} ({er.date}, {er.time})
            </div>
            <button
              onClick={() =>
                setSiteData({ ...siteData, examRoutines: siteData.examRoutines.filter((x) => x.id !== er.id) })
              }
              className="text-rose-600 font-bold text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Exam Results Publisher (Auto-calculates GPA & Grade)
function AdminResultsManager({ lang, siteData, setSiteData, showToast }) {
  const [examName, setExamName] = useState('Annual Examination');
  const [className, setClassName] = useState('6');
  const [studentId, setStudentId] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [group, setGroup] = useState('General');
  const [academicYear, setAcademicYear] = useState('2026');
  const [subjects, setSubjects] = useState([
    { name: 'বাংলা (Bengali)', marks: '' },
    { name: 'ইংরেজি (English)', marks: '' },
    { name: 'গণিত (Mathematics)', marks: '' },
    { name: 'বিজ্ঞান (General Science)', marks: '' },
    { name: 'বাংলাদেশ ও বিশ্বপরিচয় (BGS)', marks: '' },
    { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', marks: '' },
  ]);

  const handleSubjectMarkChange = (idx, val) => {
    const updated = [...subjects];
    updated[idx].marks = val;
    setSubjects(updated);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    const cleanSubjects = subjects
      .filter((s) => s.name.trim() && s.marks !== '')
      .map((s) => ({ name: s.name, marks: Number(s.marks) }));

    if (cleanSubjects.length === 0) return;

    const newResult = {
      id: `res-${Date.now()}`,
      examName,
      className,
      studentId,
      rollNo,
      studentName,
      group,
      academicYear,
      subjects: cleanSubjects
    };

    setSiteData({ ...siteData, results: [newResult, ...siteData.results] });
    setStudentId('');
    setRollNo('');
    setStudentName('');
    setSubjects(subjects.map((s) => ({ ...s, marks: '' })));
    showToast(
      lang === 'bn'
        ? 'পরীক্ষার ফলাফল প্রকাশিত হয়েছে! এখন ওয়েবসাইট থেকে সার্চ করা যাবে।'
        : 'Exam result published! Immediately searchable on the public Results page.'
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePublish} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {lang === 'bn' ? 'পরীক্ষার ফলাফল প্রকাশ করুন (স্বয়ংক্রিয় GPA গণনা)' : 'Publish Exam Result (Auto GPA Calculation)'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select value={examName} onChange={(e) => setExamName(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm">
            <option value="Half-Yearly Examination">Half-Yearly Examination</option>
            <option value="Annual Examination">Annual Examination</option>
            <option value="Pre-Test Examination">Pre-Test Examination</option>
            <option value="Test Examination">Test Examination</option>
          </select>
          <select value={className} onChange={(e) => setClassName(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm">
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
          <input type="text" required placeholder="শিক্ষাবর্ষ (2026)" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="Student ID (e.g. PZS-101)" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="Roll Number (e.g. 101)" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="শিক্ষার্থীর নাম (Student Name)" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-700">
            {lang === 'bn' ? 'বিষয়ভিত্তিক প্রাপ্ত নম্বর লিখুন (০ - ১০০):' : 'Enter Subject-wise Marks (0 - 100):'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((sub, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => {
                    const updated = [...subjects];
                    updated[idx].name = e.target.value;
                    setSubjects(updated);
                  }}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Marks"
                  value={sub.marks}
                  onChange={(e) => handleSubjectMarkChange(idx, e.target.value)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl">
          Publish Student Marksheet
        </button>
      </form>

      {/* Published Results List */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {siteData.results.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">No results published yet.</p>
        ) : (
          siteData.results.map((r) => {
            const sum = calculateOverallResult(r.subjects);
            return (
              <div key={r.id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <strong>{r.studentName}</strong> (Roll: {r.rollNo}, ID: {r.studentId}) — Class {r.className} • {r.examName}
                  <span className="ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                    GPA: {sum.gpa} ({sum.grade})
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSiteData({ ...siteData, results: siteData.results.filter((x) => x.id !== r.id) })
                  }
                  className="text-rose-600 font-bold text-xs"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 7. Photo & Video Gallery Manager
function AdminGalleryManager({ lang, siteData, setSiteData, showToast }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [captionBn, setCaptionBn] = useState('');
  const [captionEn, setCaptionEn] = useState('');

  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitleBn, setVideoTitleBn] = useState('');
  const [videoTitleEn, setVideoTitleEn] = useState('');

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!photoUrl) {
      showToast(lang === 'bn' ? 'আগে একটি ছবি বাছুন' : 'Please choose a photo first', 'error');
      return;
    }
    const item = {
      id: `photo-${Date.now()}`,
      url: photoUrl,
      captionBn,
      captionEn: captionEn || captionBn,
      category: 'Campus'
    };
    setSiteData({ ...siteData, photos: [item, ...siteData.photos] });
    setPhotoUrl('');
    setCaptionBn('');
    setCaptionEn('');
    showToast(lang === 'bn' ? 'ছবি গ্যালারিতে যুক্ত হয়েছে!' : 'Photo added to gallery!');
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    const item = {
      id: `vid-${Date.now()}`,
      url: videoUrl,
      titleBn: videoTitleBn,
      titleEn: videoTitleEn || videoTitleBn
    };
    setSiteData({ ...siteData, videos: [item, ...siteData.videos] });
    setVideoUrl('');
    setVideoTitleBn('');
    setVideoTitleEn('');
    showToast(lang === 'bn' ? 'ভিডিও গ্যালারিতে যুক্ত হয়েছে!' : 'Video added to gallery!');
  };

  return (
    <div className="space-y-6">
      {/* Add Photo */}
      <form onSubmit={handleAddPhoto} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {lang === 'bn' ? 'ফটো গ্যালারিতে ছবি যুক্ত করুন' : 'Add Photo to Gallery'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ImageUploadField label={lang === 'bn' ? 'গ্যালারির ছবি' : 'Gallery Photo'} value={photoUrl} onChange={setPhotoUrl} maxDim={900} quality={0.72} />
          <input type="text" required placeholder="ক্যাপশন (বাংলা)" value={captionBn} onChange={(e) => setCaptionBn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Caption (English)" value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Add Photo
        </button>
      </form>

      {/* Add Video */}
      <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-lg text-[#0F2942]">
          {lang === 'bn' ? 'ভিডিও গ্যালারিতে ভিডিও যুক্ত করুন' : 'Add Video to Gallery'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input type="url" required placeholder="YouTube / Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" required placeholder="ভিডিও শিরোনাম (বাংলা)" value={videoTitleBn} onChange={(e) => setVideoTitleBn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Video Title (English)" value={videoTitleEn} onChange={(e) => setVideoTitleEn(e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-[#0F2942] text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Add Video
        </button>
      </form>
    </div>
  );
}

// 8. Site Content & Settings Editor (Updates All Editable Placeholders)
function AdminSettingsManager({ lang, siteData, setSiteData, showToast }) {
  const [form, setForm] = useState(siteData.settings);

  const handleChange = (key, val) => {
    setForm({ ...form, [key]: val });
  };

  const importAll = async () => {
    const next = { ...form };
    const filled = [];
    const problems = [];
    const blank = (v) => !v || String(v).trim().startsWith('[');
    const put = (k, v, label) => {
      if (v && blank(next[k])) {
        next[k] = v;
        filled.push(label);
      }
    };
    try {
      const m = await fetchSchoolMeta();
      if (m) {
        put('eiin', m.eiin, 'EIIN');
        put('headmasterNameBn', m.head, 'প্রধান শিক্ষকের নাম');
        put('asstNameBn', m.asst, 'সহকারী প্রধান শিক্ষকের নাম');
        put('addressBn', [m.addr, m.upazila, m.district].filter(Boolean).join(', '), 'ঠিকানা');
      } else problems.push('ফলাফল পোর্টাল এখনো তথ্য পাঠায়নি');
    } catch (e) {
      problems.push('ফলাফল পোর্টাল: ' + (e.code || e.message));
    }
    try {
      const a = await fetchAdmissionData();
      put('headmasterNameBn', a.head.name, 'প্রধান শিক্ষকের নাম');
      put('headmasterQualification', a.head.desig, 'প্রধান শিক্ষকের পদবি');
      put('headmasterMessageBn', a.head.text, 'প্রধান শিক্ষকের বাণী');
      put('headmasterPhoto', a.head.photo, 'প্রধান শিক্ষকের ছবি');
      put('asstNameBn', a.asst.name, 'সহকারী প্রধান শিক্ষকের নাম');
      put('asstQualification', a.asst.desig, 'সহকারী প্রধান শিক্ষকের পদবি');
      put('asstMessageBn', a.asst.text, 'সহকারী প্রধান শিক্ষকের বাণী');
      put('asstPhoto', a.asst.photo, 'সহকারী প্রধান শিক্ষকের ছবি');
      put('logoUrl', a.logo, 'লোগো');
    } catch (e) {
      problems.push('ভর্তি ওয়েবসাইট: ' + (e.code || e.message));
    }
    setForm(next);
    setSiteData({ ...siteData, settings: next });
    const uniq = [...new Set(filled)];
    showToast(
      (uniq.length ? `আনা হয়েছে (${uniq.length}টি): ${uniq.join(', ')}` : 'নতুন কিছু আনার মতো ফাঁকা ঘর পাওয়া যায়নি') +
        (problems.length ? ' | সমস্যা: ' + problems.join('; ') : ''),
      problems.length && !uniq.length ? 'error' : 'success'
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSiteData({ ...siteData, settings: form });
    showToast(
      lang === 'bn'
        ? 'ওয়েবসাইটের সকল তথ্য সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!'
        : 'All website content & settings updated successfully!'
    );
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-emerald-900 max-w-xl">
          {lang === 'bn'
            ? 'ফাঁকা ঘরগুলো ভর্তি ওয়েবসাইট (বাণী, ছবি, লোগো) ও ফলাফল পোর্টাল (ঠিকানা, EIIN, শিক্ষকের নাম) থেকে নিজে থেকে ভরে নিন। আপনার লেখা তথ্য বদলানো হয় না।'
            : 'Fill the empty fields from the admission site (messages, photos, logo) and the result portal (address, EIIN, names). Your own entries are never overwritten.'}
        </p>
        <button type="button" onClick={importAll} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
          {lang === 'bn' ? 'অন্য ওয়েবসাইট থেকে তথ্য আনুন' : 'Import from other sites'}
        </button>
      </div>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-bold text-xl text-[#0F2942]">
          {lang === 'bn' ? 'ওয়েবসাইট কন্টেন্ট, লোগো, ব্যানার ও যোগাযোগ সম্পাদনা' : 'Edit Site Content, Banner & Contact Info'}
        </h3>
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow">
          {lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save All Changes'}
        </button>
      </div>

      {/* Basic Identity & Logo/Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">স্কুলের নাম (বাংলা)</label>
          <input type="text" value={form.schoolNameBn} onChange={(e) => handleChange('schoolNameBn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">School Name (English)</label>
          <input type="text" value={form.schoolNameEn} onChange={(e) => handleChange('schoolNameEn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">স্লোগান (বাংলা)</label>
          <input type="text" value={form.taglineBn || ''} onChange={(e) => handleChange('taglineBn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Slogan (English)</label>
          <input type="text" value={form.taglineEn || ''} onChange={(e) => handleChange('taglineEn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">EIIN Number</label>
          <input type="text" value={form.eiin} onChange={(e) => handleChange('eiin', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Established Year (স্থাপিত)</label>
          <input type="text" value={form.estd} onChange={(e) => handleChange('estd', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
        <div>
          <ImageUploadField label={lang === 'bn' ? 'স্কুলের লোগো (ঐচ্ছিক)' : 'School Logo (Optional)'} value={form.logoUrl} onChange={(v) => handleChange('logoUrl', v)} maxDim={256} quality={0.9} />
        </div>
        <div>
          <ImageUploadField label={lang === 'bn' ? 'হোম পেজের ব্যানার ছবি (ঐচ্ছিক)' : 'Hero Banner Image (Optional)'} value={form.bannerUrl} onChange={(v) => handleChange('bannerUrl', v)} maxDim={1400} quality={0.7} />
        </div>
      </div>

      {/* Headmaster Info */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h4 className="font-bold text-sm text-emerald-800">প্রধান শিক্ষকের তথ্য ও বাণী (Headmaster Details)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="প্রধান শিক্ষকের নাম (বাংলা)" value={form.headmasterNameBn} onChange={(e) => handleChange('headmasterNameBn', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Headmaster Name (English)" value={form.headmasterNameEn} onChange={(e) => handleChange('headmasterNameEn', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Qualification" value={form.headmasterQualification} onChange={(e) => handleChange('headmasterQualification', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <ImageUploadField label={lang === 'bn' ? 'প্রধান শিক্ষকের ছবি' : 'Headmaster Photo'} value={form.headmasterPhoto} onChange={(v) => handleChange('headmasterPhoto', v)} maxDim={360} />
        </div>
        <textarea rows="3" placeholder="প্রধান শিক্ষকের বাণী (বাংলা)" value={form.headmasterMessageBn} onChange={(e) => handleChange('headmasterMessageBn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        <textarea rows="2" placeholder="Headmaster Message (English)" value={form.headmasterMessageEn} onChange={(e) => handleChange('headmasterMessageEn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        <h4 className="font-bold text-sm text-[#0F2942] pt-3">{lang === 'bn' ? 'সহকারী প্রধান শিক্ষকের তথ্য ও বাণী' : 'Assistant Headmaster Info & Message'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="সহকারী প্রধান শিক্ষকের নাম (বাংলা)" value={form.asstNameBn || ''} onChange={(e) => handleChange('asstNameBn', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Assistant Headmaster Name (English)" value={form.asstNameEn || ''} onChange={(e) => handleChange('asstNameEn', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="পদবি / শিক্ষাগত যোগ্যতা" value={form.asstQualification || ''} onChange={(e) => handleChange('asstQualification', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <ImageUploadField label={lang === 'bn' ? 'সহকারী প্রধান শিক্ষকের ছবি' : 'Assistant Headmaster Photo'} value={form.asstPhoto || ''} onChange={(v) => handleChange('asstPhoto', v)} maxDim={360} />
        </div>
        <textarea rows="3" placeholder="সহকারী প্রধান শিক্ষকের বাণী (বাংলা)" value={form.asstMessageBn || ''} onChange={(e) => handleChange('asstMessageBn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        <textarea rows="2" placeholder="Assistant Headmaster Message (English)" value={form.asstMessageEn || ''} onChange={(e) => handleChange('asstMessageEn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
      </div>

      {/* School History & About */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h4 className="font-bold text-sm text-emerald-800">স্কুল পরিচিতি ও ইতিহাস (About & History)</h4>
        <textarea rows="3" placeholder="স্কুল পরিচিতি (বাংলা)" value={form.aboutTextBn} onChange={(e) => handleChange('aboutTextBn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        <textarea rows="3" placeholder="প্রতিষ্ঠানের ইতিহাস (বাংলা)" value={form.historyTextBn} onChange={(e) => handleChange('historyTextBn', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
      </div>

      {/* Contact & Social */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h4 className="font-bold text-sm text-emerald-800">যোগাযোগ ও সোশ্যাল মিডিয়া (Contact & Maps)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="ঠিকানা (বাংলা)" value={form.addressBn} onChange={(e) => handleChange('addressBn', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Address (English)" value={form.addressEn} onChange={(e) => handleChange('addressEn', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Phone Number" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="text" placeholder="Email Address" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="url" placeholder="Facebook Page URL" value={form.facebookUrl} onChange={(e) => handleChange('facebookUrl', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
          <input type="url" placeholder="Google Maps Embed URL" value={form.mapEmbedUrl} onChange={(e) => handleChange('mapEmbedUrl', e.target.value)} className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm" />
        </div>
      </div>
    </form>
  );
}