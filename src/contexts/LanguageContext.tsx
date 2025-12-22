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
    en: 'Nujoom Invoices',
    ar: 'فواتير نجوم',
    ku: 'پسوولەکانی نوژووم',
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
    en: 'Dashboards',
    ar: 'لوحات التحكم',
    ku: 'داشبۆردەکان',
  },
  selectDashboard: {
    en: 'Select Dashboard',
    ar: 'اختر لوحة التحكم',
    ku: 'داشبۆرد هەڵبژێرە',
  },
  addDashboard: {
    en: 'Add Dashboard',
    ar: 'إضافة لوحة تحكم',
    ku: 'زیادکردنی داشبۆرد',
  },
  editDashboardName: {
    en: 'Edit Dashboard Name',
    ar: 'تعديل اسم لوحة التحكم',
    ku: 'دەستکاری ناوی داشبۆرد',
  },
  dashboardName: {
    en: 'Dashboard Name',
    ar: 'اسم لوحة التحكم',
    ku: 'ناوی داشبۆرد',
  },
  deleteDashboard: {
    en: 'Delete Dashboard',
    ar: 'حذف لوحة التحكم',
    ku: 'سڕینەوەی داشبۆرد',
  },
  dashboardDeleted: {
    en: 'Dashboard deleted successfully!',
    ar: 'تم حذف لوحة التحكم بنجاح!',
    ku: 'داشبۆرد بە سەرکەوتوویی سڕایەوە!',
  },
  dashboardAdded: {
    en: 'Dashboard added successfully!',
    ar: 'تمت إضافة لوحة التحكم بنجاح!',
    ku: 'داشبۆرد بە سەرکەوتوویی زیادکرا!',
  },
  dashboardUpdated: {
    en: 'Dashboard updated successfully!',
    ar: 'تم تحديث لوحة التحكم بنجاح!',
    ku: 'داشبۆرد بە سەرکەوتوویی نوێکرایەوە!',
  },
  manageDashboards: {
    en: 'Manage Dashboards',
    ar: 'إدارة لوحات التحكم',
    ku: 'بەڕێوەبردنی داشبۆردەکان',
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
  invoicesByBank: {
    en: 'Invoices by Bank',
    ar: 'الفواتير حسب البنك',
    ku: 'پسوولەکان بە پێی بانک',
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
  // Insights
  insights: {
    en: 'Insights',
    ar: 'التحليلات',
    ku: 'شیکاری',
  },
  totalAmount: {
    en: 'Total Amount',
    ar: 'المبلغ الإجمالي',
    ku: 'کۆی گشتی',
  },
  totalInvoices: {
    en: 'Total Invoices',
    ar: 'إجمالي الفواتير',
    ku: 'کۆی پسوولەکان',
  },
  monthlyTrend: {
    en: 'Monthly Trend',
    ar: 'الاتجاه الشهري',
    ku: 'ڕەوتی مانگانە',
  },
  statusDistribution: {
    en: 'Status Distribution',
    ar: 'توزيع الحالة',
    ku: 'دابەشکردنی دۆخ',
  },
  bankDistribution: {
    en: 'Bank Distribution',
    ar: 'توزيع البنوك',
    ku: 'دابەشکردنی بانک',
  },
  invoicesByMonth: {
    en: 'Invoices by Month',
    ar: 'الفواتير حسب الشهر',
    ku: 'پسوولەکان بە مانگ',
  },
  invoiceCount: {
    en: 'Invoice Count',
    ar: 'عدد الفواتير',
    ku: 'ژمارەی پسوولە',
  },
  // Contact
  contact: {
    en: 'Contact',
    ar: 'اتصل بنا',
    ku: 'پەیوەندی',
  },
  getInTouch: {
    en: 'Get in Touch',
    ar: 'تواصل معنا',
    ku: 'پەیوەندیمان پێوە بکە',
  },
  getInTouchDesc: {
    en: 'Have questions? We would love to hear from you.',
    ar: 'لديك أسئلة؟ نحب أن نسمع منك.',
    ku: 'پرسیارت هەیە؟ حەز دەکەین گوێت لێ بگرین.',
  },
  emailUs: {
    en: 'Email Us',
    ar: 'راسلنا',
    ku: 'ئیمەیلمان بۆ بنێرە',
  },
  callUs: {
    en: 'Call Us',
    ar: 'اتصل بنا',
    ku: 'پەیوەندیمان پێوە بکە',
  },
  visitUs: {
    en: 'Visit Us',
    ar: 'قم بزيارتنا',
    ku: 'سەردانمان بکە',
  },
  sendMessage: {
    en: 'Send Message',
    ar: 'إرسال رسالة',
    ku: 'ناردنی نامە',
  },
  editContactInfo: {
    en: 'Edit Contact Info',
    ar: 'تعديل معلومات الاتصال',
    ku: 'دەستکاری زانیاری پەیوەندی',
  },
  contactEmail: {
    en: 'Contact Email',
    ar: 'البريد الإلكتروني للتواصل',
    ku: 'ئیمەیلی پەیوەندی',
  },
  contactPhone: {
    en: 'Contact Phone',
    ar: 'هاتف الاتصال',
    ku: 'ژمارەی تەلەفۆن',
  },
  contactAddress: {
    en: 'Contact Address',
    ar: 'عنوان الاتصال',
    ku: 'ناونیشانی پەیوەندی',
  },
  contactInfoUpdated: {
    en: 'Contact info updated successfully!',
    ar: 'تم تحديث معلومات الاتصال بنجاح!',
    ku: 'زانیاری پەیوەندی بە سەرکەوتوویی نوێکرایەوە!',
  },
  sendMessageDesc: {
    en: 'Fill out the form and we will get back to you shortly.',
    ar: 'املأ النموذج وسنعود إليك قريباً.',
    ku: 'فۆڕمەکە پڕ بکەرەوە و بەم زووانە وەڵامت دەدەینەوە.',
  },
  yourName: {
    en: 'Your Name',
    ar: 'اسمك',
    ku: 'ناوت',
  },
  enterYourName: {
    en: 'Enter your name',
    ar: 'أدخل اسمك',
    ku: 'ناوت بنووسە',
  },
  yourEmail: {
    en: 'Your Email',
    ar: 'بريدك الإلكتروني',
    ku: 'ئیمەیلەکەت',
  },
  enterYourEmail: {
    en: 'Enter your email',
    ar: 'أدخل بريدك الإلكتروني',
    ku: 'ئیمەیلەکەت بنووسە',
  },
  subject: {
    en: 'Subject',
    ar: 'الموضوع',
    ku: 'بابەت',
  },
  enterSubject: {
    en: 'Enter subject',
    ar: 'أدخل الموضوع',
    ku: 'بابەت بنووسە',
  },
  message: {
    en: 'Message',
    ar: 'الرسالة',
    ku: 'نامە',
  },
  enterMessage: {
    en: 'Enter your message',
    ar: 'أدخل رسالتك',
    ku: 'نامەکەت بنووسە',
  },
  sending: {
    en: 'Sending...',
    ar: 'جاري الإرسال...',
    ku: 'دەنێردرێت...',
  },
  messageSent: {
    en: 'Message Sent',
    ar: 'تم إرسال الرسالة',
    ku: 'نامە نێردرا',
  },
  messageSentDesc: {
    en: 'Thank you for contacting us. We will get back to you soon.',
    ar: 'شكراً للتواصل معنا. سنعود إليك قريباً.',
    ku: 'سوپاس بۆ پەیوەندیکردن. بەم زووانە وەڵامت دەدەینەوە.',
  },
  // Dashboard extras
  deleteSelected: {
    en: 'Delete Selected',
    ar: 'حذف المحدد',
    ku: 'سڕینەوەی هەڵبژێردراو',
  },
  print: {
    en: 'Print',
    ar: 'طباعة',
    ku: 'چاپ',
  },
  printDate: {
    en: 'Print Date',
    ar: 'تاريخ الطباعة',
    ku: 'بەرواری چاپ',
  },
  editInvoice: {
    en: 'Edit Invoice',
    ar: 'تعديل الفاتورة',
    ku: 'دەستکاری پسوولە',
  },
  invoiceUpdated: {
    en: 'Invoice updated successfully!',
    ar: 'تم تحديث الفاتورة بنجاح!',
    ku: 'پسوولە بە سەرکەوتوویی نوێکرایەوە!',
  },
  invoicesDeleted: {
    en: 'Invoices deleted successfully!',
    ar: 'تم حذف الفواتير بنجاح!',
    ku: 'پسوولەکان بە سەرکەوتوویی سڕانەوە!',
  },
  confirmDelete: {
    en: 'Confirm Delete',
    ar: 'تأكيد الحذف',
    ku: 'دڵنیاکردنەوەی سڕینەوە',
  },
  confirmDeleteMultiple: {
    en: 'Are you sure you want to delete {count} selected invoices? This action cannot be undone.',
    ar: 'هل أنت متأكد من حذف {count} فواتير محددة؟ لا يمكن التراجع عن هذا الإجراء.',
    ku: 'دڵنیایت لە سڕینەوەی {count} پسوولەی هەڵبژێردراو؟ ناتوانرێت ئەم کردارە هەڵوەشێندرێتەوە.',
  },
  containerNumber: {
    en: 'Container Number',
    ar: 'رقم الحاوية',
    ku: 'ژمارەی کۆنتەینەر',
  },
  optional: {
    en: 'Optional',
    ar: 'اختياري',
    ku: 'هەڵبژاردەیی',
  },
  searchInvoices: {
    en: 'Search invoices...',
    ar: 'البحث في الفواتير...',
    ku: 'گەڕان لە پسوولەکان...',
  },
  currency: {
    en: 'Currency',
    ar: 'العملة',
    ku: 'دراو',
  },
  selectCurrency: {
    en: 'Select Currency',
    ar: 'اختر العملة',
    ku: 'دراو هەڵبژێرە',
  },
  importCSV: {
    en: 'Import CSV',
    ar: 'استيراد CSV',
    ku: 'هاوردەکردنی CSV',
  },
  csvImported: {
    en: 'CSV imported successfully!',
    ar: 'تم استيراد CSV بنجاح!',
    ku: 'CSV بە سەرکەوتوویی هاوردە کرا!',
  },
  csvImportError: {
    en: 'Error importing CSV. Please check the format.',
    ar: 'خطأ في استيراد CSV. يرجى التحقق من التنسيق.',
    ku: 'هەڵە لە هاوردەکردنی CSV. تکایە فۆرماتەکە بپشکنە.',
  },
  exportCSV: {
    en: 'Export CSV',
    ar: 'تصدير CSV',
    ku: 'هەناردەکردنی CSV',
  },
  csvExported: {
    en: 'CSV exported successfully!',
    ar: 'تم تصدير CSV بنجاح!',
    ku: 'CSV بە سەرکەوتوویی هەناردە کرا!',
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
