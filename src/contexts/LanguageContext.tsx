import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'ku';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    ku: string;
  };
}

export const translations: Translations = {
  // Header
  appTitle: {
    en: 'طلب اوراق حوالات',
    ar: 'طلب اوراق حوالات',
    ku: 'طلب اوراق حوالات',
  },
  // Auth
  login: {
    en: 'Login',
    ar: 'تسجيل الدخول',
    ku: 'چوونەژوورەوە',
  },
  signup: {
    en: 'Sign Up',
    ar: 'إنشاء حساب',
    ku: 'تۆمارکردن',
  },
  logout: {
    en: 'Logout',
    ar: 'تسجيل الخروج',
    ku: 'چوونەدەرەوە',
  },
  email: {
    en: 'Email',
    ar: 'البريد الإلكتروني',
    ku: 'ئیمەیل',
  },
  password: {
    en: 'Password',
    ar: 'كلمة المرور',
    ku: 'وشەی نهێنی',
  },
  confirmPassword: {
    en: 'Confirm Password',
    ar: 'تأكيد كلمة المرور',
    ku: 'دووپاتکردنەوەی وشەی نهێنی',
  },
  fullName: {
    en: 'Full Name',
    ar: 'الاسم الكامل',
    ku: 'ناوی تەواو',
  },
  noAccount: {
    en: "Don't have an account?",
    ar: 'ليس لديك حساب؟',
    ku: 'هەژمارت نییە؟',
  },
  hasAccount: {
    en: 'Already have an account?',
    ar: 'لديك حساب بالفعل؟',
    ku: 'هەژمارت هەیە؟',
  },
  // Navigation
  dashboard: {
    en: 'Dashboard',
    ar: 'لوحة التحكم',
    ku: 'داشبۆرد',
  },
  newInvoice: {
    en: 'New Invoice',
    ar: 'فاتورة جديدة',
    ku: 'پسوولەی نوێ',
  },
  settings: {
    en: 'Settings',
    ar: 'الإعدادات',
    ku: 'ڕێکخستنەکان',
  },
  // Invoice Form
  invoiceAmount: {
    en: 'Invoice Amount',
    ar: 'مبلغ الفاتورة',
    ku: 'بڕی پسوولە',
  },
  invoiceDate: {
    en: 'Invoice Date',
    ar: 'تاريخ الفاتورة',
    ku: 'بەرواری پسوولە',
  },
  invoiceNumber: {
    en: 'Invoice Number',
    ar: 'رقم الفاتورة',
    ku: 'ژمارەی پسوولە',
  },
  beneficiary: {
    en: 'Beneficiary',
    ar: 'المستفيد',
    ku: 'سوودمەند',
  },
  bank: {
    en: 'Bank',
    ar: 'البنك',
    ku: 'بانک',
  },
  selectBank: {
    en: 'Select Bank',
    ar: 'اختر البنك',
    ku: 'بانک هەڵبژێرە',
  },
  addBank: {
    en: 'Add Bank',
    ar: 'إضافة بنك',
    ku: 'زیادکردنی بانک',
  },
  editBank: {
    en: 'Edit Bank',
    ar: 'تعديل البنك',
    ku: 'دەستکاری بانک',
  },
  deleteBank: {
    en: 'Delete Bank',
    ar: 'حذف البنك',
    ku: 'سڕینەوەی بانک',
  },
  bankName: {
    en: 'Bank Name',
    ar: 'اسم البنك',
    ku: 'ناوی بانک',
  },
  submitInvoice: {
    en: 'Submit Invoice',
    ar: 'إرسال الفاتورة',
    ku: 'ناردنی پسوولە',
  },
  // Dashboard
  allInvoices: {
    en: 'All Invoices',
    ar: 'جميع الفواتير',
    ku: 'هەموو پسوولەکان',
  },
  status: {
    en: 'Status',
    ar: 'الحالة',
    ku: 'دۆخ',
  },
  pending: {
    en: 'Pending',
    ar: 'قيد الانتظار',
    ku: 'چاوەڕوانی',
  },
  received: {
    en: 'Received',
    ar: 'تم الاستلام',
    ku: 'وەرگیرا',
  },
  copyTable: {
    en: 'Copy Table',
    ar: 'نسخ الجدول',
    ku: 'کۆپی کردنی خشتە',
  },
  tableCopied: {
    en: 'Table copied to clipboard!',
    ar: 'تم نسخ الجدول!',
    ku: 'خشتە کۆپی کرا!',
  },
  noInvoices: {
    en: 'No invoices yet',
    ar: 'لا توجد فواتير بعد',
    ku: 'هیچ پسوولەیەک نییە',
  },
  // Settings
  language: {
    en: 'Language',
    ar: 'اللغة',
    ku: 'زمان',
  },
  english: {
    en: 'English',
    ar: 'الإنجليزية',
    ku: 'ئینگلیزی',
  },
  arabic: {
    en: 'Arabic (Iraq)',
    ar: 'العربية (العراق)',
    ku: 'عەرەبی (عێراق)',
  },
  kurdish: {
    en: 'Kurdish (Central)',
    ar: 'الكردية (السورانية)',
    ku: 'کوردی (ناوەندی)',
  },
  uploadLogo: {
    en: 'Upload Logo',
    ar: 'رفع الشعار',
    ku: 'بارکردنی لۆگۆ',
  },
  manageBanks: {
    en: 'Manage Banks',
    ar: 'إدارة البنوك',
    ku: 'بەڕێوەبردنی بانکەکان',
  },
  // Actions
  save: {
    en: 'Save',
    ar: 'حفظ',
    ku: 'هەڵگرتن',
  },
  cancel: {
    en: 'Cancel',
    ar: 'إلغاء',
    ku: 'هەڵوەشاندنەوە',
  },
  delete: {
    en: 'Delete',
    ar: 'حذف',
    ku: 'سڕینەوە',
  },
  edit: {
    en: 'Edit',
    ar: 'تعديل',
    ku: 'دەستکاری',
  },
  actions: {
    en: 'Actions',
    ar: 'الإجراءات',
    ku: 'کردارەکان',
  },
  // Messages
  invoiceAdded: {
    en: 'Invoice added successfully!',
    ar: 'تمت إضافة الفاتورة بنجاح!',
    ku: 'پسوولە بە سەرکەوتوویی زیادکرا!',
  },
  invoiceDeleted: {
    en: 'Invoice deleted successfully!',
    ar: 'تم حذف الفاتورة بنجاح!',
    ku: 'پسوولە بە سەرکەوتوویی سڕایەوە!',
  },
  bankAdded: {
    en: 'Bank added successfully!',
    ar: 'تمت إضافة البنك بنجاح!',
    ku: 'بانک بە سەرکەوتوویی زیادکرا!',
  },
  bankDeleted: {
    en: 'Bank deleted successfully!',
    ar: 'تم حذف البنك بنجاح!',
    ku: 'بانک بە سەرکەوتوویی سڕایەوە!',
  },
  logoUpdated: {
    en: 'Logo updated successfully!',
    ar: 'تم تحديث الشعار بنجاح!',
    ku: 'لۆگۆ بە سەرکەوتوویی نوێکرایەوە!',
  },
  loginSuccess: {
    en: 'Login successful!',
    ar: 'تم تسجيل الدخول بنجاح!',
    ku: 'چوونەژوورەوە سەرکەوتوو بوو!',
  },
  signupSuccess: {
    en: 'Account created successfully!',
    ar: 'تم إنشاء الحساب بنجاح!',
    ku: 'هەژمار بە سەرکەوتوویی دروستکرا!',
  },
  invalidCredentials: {
    en: 'Invalid email or password',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    ku: 'ئیمەیل یان وشەی نهێنی هەڵەیە',
  },
  emailExists: {
    en: 'Email already exists',
    ar: 'البريد الإلكتروني موجود بالفعل',
    ku: 'ئیمەیل پێشتر هەیە',
  },
  passwordMismatch: {
    en: 'Passwords do not match',
    ar: 'كلمات المرور غير متطابقة',
    ku: 'وشەی نهێنی یەک ناگرنەوە',
  },
  requiredField: {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
    ku: 'ئەم خانەیە پێویستە',
  },
  // Welcome
  welcome: {
    en: 'Welcome',
    ar: 'مرحباً',
    ku: 'بەخێربێیت',
  },
  welcomeBack: {
    en: 'Welcome back',
    ar: 'مرحباً بعودتك',
    ku: 'بەخێربێیتەوە',
  },
  getStarted: {
    en: 'Get Started',
    ar: 'ابدأ الآن',
    ku: 'دەست پێبکە',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const dir = language === 'en' ? 'ltr' : 'rtl';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
