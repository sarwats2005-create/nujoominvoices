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
  swiftDate: {
    en: 'Swift Date',
    ar: 'تاريخ سويفت',
    ku: 'بەرواری سویفت',
  },
  expiringIn60Days: {
    en: 'Expiring soon',
    ar: 'ينتهي قريباً',
    ku: 'بەزوویی تەواو دەبێت',
  },
  daysLeft: {
    en: 'days left',
    ar: 'أيام متبقية',
    ku: 'ڕۆژ ماوە',
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
  soundVolume: {
    en: 'Sound Effects Volume',
    ar: 'مستوى صوت المؤثرات',
    ku: 'ئاستی دەنگی کاریگەرییەکان',
  },
  soundVolumeDescription: {
    en: 'Adjust the volume for success and delete sounds',
    ar: 'ضبط مستوى صوت تأثيرات النجاح والحذف',
    ku: 'ڕێکخستنی ئاستی دەنگ بۆ کاریگەرییەکانی سەرکەوتن و سڕینەوە',
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
  appName: {
    en: 'Invoice Manager',
    ar: 'مدير الفواتير',
    ku: 'بەڕێوەبەری پسوولە',
  },
  loginDescription: {
    en: 'Sign in to manage your invoices',
    ar: 'سجل دخولك لإدارة فواتيرك',
    ku: 'بچۆرە ژوورەوە بۆ بەڕێوەبردنی پسوولەکانت',
  },
  signupDescription: {
    en: 'Create an account to get started',
    ar: 'أنشئ حساباً للبدء',
    ku: 'هەژمارێک دروست بکە بۆ دەستپێکردن',
  },
  loginFailed: {
    en: 'Login failed',
    ar: 'فشل تسجيل الدخول',
    ku: 'چوونەژوورەوە سەرکەوتوو نەبوو',
  },
  signupFailed: {
    en: 'Signup failed',
    ar: 'فشل إنشاء الحساب',
    ku: 'تۆمارکردن سەرکەوتوو نەبوو',
  },
  loading: {
    en: 'Loading...',
    ar: 'جاري التحميل...',
    ku: 'چاوەڕوان بە...',
  },
  passwordRequirement: {
    en: 'Password must be at least 6 characters',
    ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    ku: 'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت',
  },
  // Zapier Sync
  syncToGoogleSheets: {
    en: 'Sync to Google Sheets',
    ar: 'مزامنة مع جوجل شيت',
    ku: 'هاوکاتکردن لەگەڵ گووگڵ شیت',
  },
  syncToGoogleSheetsDesc: {
    en: 'Connect your dashboard to Google Sheets via Zapier to keep your data synchronized.',
    ar: 'اربط لوحة التحكم بجوجل شيت عبر Zapier للحفاظ على مزامنة البيانات.',
    ku: 'داشبۆردەکەت بە گووگڵ شیتەوە ببەستە لە ڕێگەی Zapier بۆ هاوکاتکردنی داتا.',
  },
  zapierWebhookUrl: {
    en: 'Zapier Webhook URL',
    ar: 'رابط Webhook الخاص بـ Zapier',
    ku: 'لینکی Webhook ی Zapier',
  },
  zapierWebhookRequired: {
    en: 'Please enter your Zapier webhook URL',
    ar: 'يرجى إدخال رابط Webhook الخاص بـ Zapier',
    ku: 'تکایە لینکی Webhook ی Zapier بنووسە',
  },
  zapierWebhookHelp: {
    en: 'Paste your Zapier webhook URL here. Create a Zap with "Webhooks by Zapier" trigger.',
    ar: 'الصق رابط Zapier webhook هنا. أنشئ Zap باستخدام مشغل "Webhooks by Zapier".',
    ku: 'لینکی Zapier webhook لێرە بلکێنە. Zap دروست بکە بە بەکارهێنانی "Webhooks by Zapier".',
  },
  howToSetupZapier: {
    en: 'How to set up:',
    ar: 'كيفية الإعداد:',
    ku: 'چۆنیەتی دامەزراندن:',
  },
  zapierStep1: {
    en: 'Go to Zapier.com and create a new Zap',
    ar: 'اذهب إلى Zapier.com وأنشئ Zap جديد',
    ku: 'بڕۆ بۆ Zapier.com و Zap ی نوێ دروست بکە',
  },
  zapierStep2: {
    en: 'Choose "Webhooks by Zapier" as trigger, then "Catch Hook"',
    ar: 'اختر "Webhooks by Zapier" كمشغل، ثم "Catch Hook"',
    ku: '"Webhooks by Zapier" وەک تریگەر هەڵبژێرە، پاشان "Catch Hook"',
  },
  zapierStep3: {
    en: 'Copy the webhook URL and paste it above',
    ar: 'انسخ رابط webhook والصقه أعلاه',
    ku: 'لینکی webhook کۆپی بکە و لە سەرەوە بیلکێنە',
  },
  zapierStep4: {
    en: 'Add "Google Sheets" action to create/update rows',
    ar: 'أضف إجراء "Google Sheets" لإنشاء/تحديث الصفوف',
    ku: 'کرداری "Google Sheets" زیاد بکە بۆ دروستکردن/نوێکردنەوەی ڕیزەکان',
  },
  willSync: {
    en: 'Will sync',
    ar: 'سيتم مزامنة',
    ku: 'هاوکات دەکرێت',
  },
  invoicesFromDashboard: {
    en: 'invoices from dashboard',
    ar: 'فواتير من لوحة التحكم',
    ku: 'پسوولە لە داشبۆرد',
  },
  syncSuccess: {
    en: 'Sync Request Sent',
    ar: 'تم إرسال طلب المزامنة',
    ku: 'داواکاری هاوکاتکردن نێردرا',
  },
  syncSuccessDesc: {
    en: 'Data was sent to Zapier. Check your Zap history to confirm.',
    ar: 'تم إرسال البيانات إلى Zapier. تحقق من سجل Zap للتأكيد.',
    ku: 'داتا بۆ Zapier نێردرا. مێژووی Zap بپشکنە بۆ دڵنیابوون.',
  },
  syncError: {
    en: 'Failed to sync. Please check the webhook URL and try again.',
    ar: 'فشلت المزامنة. يرجى التحقق من رابط webhook والمحاولة مرة أخرى.',
    ku: 'هاوکاتکردن سەرکەوتوو نەبوو. تکایە لینکی webhook بپشکنە و دووبارە هەوڵ بدە.',
  },
  syncing: {
    en: 'Syncing...',
    ar: 'جاري المزامنة...',
    ku: 'هاوکات دەکرێت...',
  },
  syncNow: {
    en: 'Sync Now',
    ar: 'مزامنة الآن',
    ku: 'ئێستا هاوکات بکە',
  },
  lastSyncSuccess: {
    en: 'Data sent successfully! Check your Google Sheet.',
    ar: 'تم إرسال البيانات بنجاح! تحقق من جوجل شيت الخاص بك.',
    ku: 'داتا بە سەرکەوتوویی نێردرا! گووگڵ شیتەکەت بپشکنە.',
  },
  googleSheetsSync: {
    en: 'Google Sheets',
    ar: 'جوجل شيت',
    ku: 'گووگڵ شیت',
  },
  error: {
    en: 'Error',
    ar: 'خطأ',
    ku: 'هەڵە',
  },
  expired: {
    en: 'Expired',
    ar: 'منتهي الصلاحية',
    ku: 'بەسەرچوو',
  },
  forgotPassword: {
    en: 'Forgot Password?',
    ar: 'نسيت كلمة المرور؟',
    ku: 'وشەی نهێنی لەبیرچوو؟',
  },
  forgotPasswordDescription: {
    en: 'Enter your email and we\'ll send you a link to reset your password.',
    ar: 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.',
    ku: 'ئیمەیڵەکەت بنووسە و بەستەرێکت بۆ دەنێرین بۆ ڕێکخستنەوەی وشەی نهێنی.',
  },
  sendResetLink: {
    en: 'Send Reset Link',
    ar: 'إرسال رابط إعادة التعيين',
    ku: 'بەستەری ڕێکخستنەوە بنێرە',
  },
  backToLogin: {
    en: 'Back to Login',
    ar: 'العودة إلى تسجيل الدخول',
    ku: 'بگەڕێوە بۆ چوونەژوورەوە',
  },
  passwordResetSent: {
    en: 'Password Reset Email Sent',
    ar: 'تم إرسال بريد إعادة تعيين كلمة المرور',
    ku: 'ئیمەیڵی ڕێکخستنەوەی وشەی نهێنی نێردرا',
  },
  checkEmailForReset: {
    en: 'Check your email for a link to reset your password.',
    ar: 'تحقق من بريدك الإلكتروني للحصول على رابط لإعادة تعيين كلمة المرور.',
    ku: 'ئیمەیڵەکەت بپشکنە بۆ بەستەری ڕێکخستنەوەی وشەی نهێنی.',
  },
  maxUsersReached: {
    en: 'Maximum number of users reached. New registrations are closed.',
    ar: 'تم الوصول إلى الحد الأقصى لعدد المستخدمين. التسجيلات الجديدة مغلقة.',
    ku: 'ژمارەی بەکارهێنەران گەیشتە ئەوپەڕی. تۆمارکردنی نوێ داخراوە.',
  },
  installApp: {
    en: 'Install App',
    ar: 'تثبيت التطبيق',
    ku: 'دامەزراندنی ئەپ',
  },
  appAlreadyInstalled: {
    en: 'App is already installed on your device',
    ar: 'التطبيق مثبت بالفعل على جهازك',
    ku: 'ئەپ پێشتر لە ئامێرەکەتدا دامەزراوە',
  },
  installNow: {
    en: 'Install Now',
    ar: 'ثبّت الآن',
    ku: 'ئێستا دابمەزرێنە',
  },
  howToInstall: {
    en: 'How to Install',
    ar: 'كيفية التثبيت',
    ku: 'چۆن دایبمەزرێنم',
  },
  iosInstallInstructions: {
    en: 'Tap the Share button in Safari, then tap "Add to Home Screen"',
    ar: 'اضغط على زر المشاركة في Safari، ثم اضغط على "إضافة إلى الشاشة الرئيسية"',
    ku: 'لە Safari دوگمەی هاوبەشکردن بپەنجێنە، پاشان "زیادکردن بۆ شاشەی سەرەکی" بپەنجێنە',
  },
  appInstalled: {
    en: 'App installed successfully!',
    ar: 'تم تثبيت التطبيق بنجاح!',
    ku: 'ئەپ بە سەرکەوتوویی دامەزرا!',
  },
  updateAvailable: {
    en: 'Update Available',
    ar: 'تحديث متاح',
    ku: 'نوێکردنەوە بەردەستە',
  },
  updateDescription: {
    en: 'A new version of the app is ready. Reload to update.',
    ar: 'إصدار جديد من التطبيق جاهز. أعد التحميل للتحديث.',
    ku: 'وەشانێکی نوێی ئەپ ئامادەیە. دووبارە باربکەوە بۆ نوێکردنەوە.',
  },
  updateNow: {
    en: 'Update Now',
    ar: 'تحديث الآن',
    ku: 'ئێستا نوێبکەوە',
  },
  later: {
    en: 'Later',
    ar: 'لاحقاً',
    ku: 'دواتر',
  },
  // Admin Panel
  adminPanel: {
    en: 'Admin Panel',
    ar: 'لوحة الإدارة',
    ku: 'پانێلی بەڕێوەبەر',
  },
  adminPanelDescription: {
    en: 'Manage users and view registered accounts',
    ar: 'إدارة المستخدمين وعرض الحسابات المسجلة',
    ku: 'بەڕێوەبردنی بەکارهێنەران و بینینی هەژمارە تۆمارکراوەکان',
  },
  totalUsers: {
    en: 'Total Users',
    ar: 'إجمالي المستخدمين',
    ku: 'کۆی بەکارهێنەران',
  },
  role: {
    en: 'Role',
    ar: 'الدور',
    ku: 'ڕۆڵ',
  },
  admin: {
    en: 'Admin',
    ar: 'مدير',
    ku: 'بەڕێوەبەر',
  },
  user: {
    en: 'User',
    ar: 'مستخدم',
    ku: 'بەکارهێنەر',
  },
  registeredOn: {
    en: 'Registered On',
    ar: 'تاريخ التسجيل',
    ku: 'بەرواری تۆمارکردن',
  },
  resetPassword: {
    en: 'Reset Password',
    ar: 'إعادة تعيين كلمة المرور',
    ku: 'ڕێکخستنەوەی وشەی نهێنی',
  },
  deleteUserConfirmation: {
    en: 'Are you sure you want to delete this user?',
    ar: 'هل أنت متأكد من حذف هذا المستخدم؟',
    ku: 'دڵنیایت لە سڕینەوەی ئەم بەکارهێنەرە؟',
  },
  userDeleted: {
    en: 'User deleted successfully',
    ar: 'تم حذف المستخدم بنجاح',
    ku: 'بەکارهێنەر بە سەرکەوتوویی سڕایەوە',
  },
  errorLoadingUsers: {
    en: 'Error loading users',
    ar: 'خطأ في تحميل المستخدمين',
    ku: 'هەڵە لە بارکردنی بەکارهێنەران',
  },
  errorDeletingUser: {
    en: 'Error deleting user',
    ar: 'خطأ في حذف المستخدم',
    ku: 'هەڵە لە سڕینەوەی بەکارهێنەر',
  },
  errorResettingPassword: {
    en: 'Error sending password reset email',
    ar: 'خطأ في إرسال بريد إعادة تعيين كلمة المرور',
    ku: 'هەڵە لە ناردنی ئیمەیڵی ڕێکخستنەوەی وشەی نهێنی',
  },
  backToDashboard: {
    en: 'Back to Dashboard',
    ar: 'العودة إلى لوحة التحكم',
    ku: 'بگەڕێوە بۆ داشبۆرد',
  },
  success: {
    en: 'Success',
    ar: 'نجاح',
    ku: 'سەرکەوتوو',
  },
  // Security & Rate Limiting
  tooManyAttempts: {
    en: 'Too Many Attempts',
    ar: 'محاولات كثيرة جداً',
    ku: 'هەوڵی زۆر',
  },
  tryAgainIn: {
    en: 'Please try again in {minutes} minutes',
    ar: 'يرجى المحاولة مرة أخرى بعد {minutes} دقيقة',
    ku: 'تکایە دوای {minutes} خولەک هەوڵبدەوە',
  },
  attemptsRemaining: {
    en: '{count} attempts remaining',
    ar: '{count} محاولات متبقية',
    ku: '{count} هەوڵ ماوە',
  },
  validationError: {
    en: 'Validation Error',
    ar: 'خطأ في التحقق',
    ku: 'هەڵەی پشتڕاستکردنەوە',
  },
  passwordMinLength: {
    en: 'Password must be at least 6 characters',
    ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    ku: 'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت',
  },
  strongPassword: {
    en: 'Strong password',
    ar: 'كلمة مرور قوية',
    ku: 'وشەی نهێنی بەهێز',
  },
  passwordRequirementStrong: {
    en: 'Min 10 chars, uppercase, lowercase, number, and symbol',
    ar: 'على الأقل 10 أحرف، حرف كبير، حرف صغير، رقم، ورمز',
    ku: 'لانیکەم ١٠ پیت، پیتی گەورە، پیتی بچووک، ژمارە و هێما',
  },
  youCanNowLogin: {
    en: 'You can now login with your credentials',
    ar: 'يمكنك الآن تسجيل الدخول بحسابك',
    ku: 'ئێستا دەتوانیت بچیتە ناوەوە بە هەژمارەکەت',
  },
  // Audit Log
  auditLog: {
    en: 'Audit Log',
    ar: 'سجل التدقيق',
    ku: 'تۆماری پشکنین',
  },
  viewAuditLog: {
    en: 'View Audit Log',
    ar: 'عرض سجل التدقيق',
    ku: 'بینینی تۆماری پشکنین',
  },
  invoiceCreatedLog: {
    en: 'Invoice Created',
    ar: 'تم إنشاء الفاتورة',
    ku: 'پسوولە دروستکرا',
  },
  invoiceUpdatedLog: {
    en: 'Invoice Updated',
    ar: 'تم تحديث الفاتورة',
    ku: 'پسوولە نوێکرایەوە',
  },
  invoiceDeletedLog: {
    en: 'Invoice Deleted',
    ar: 'تم حذف الفاتورة',
    ku: 'پسوولە سڕایەوە',
  },
  noAuditLogs: {
    en: 'No audit logs found',
    ar: 'لا توجد سجلات تدقيق',
    ku: 'هیچ تۆمارێکی پشکنین نەدۆزرایەوە',
  },
  // Reset Password Page
  resetPasswordDescription: {
    en: 'Enter your new password below. Make sure it meets the security requirements.',
    ar: 'أدخل كلمة المرور الجديدة أدناه. تأكد من استيفاء متطلبات الأمان.',
    ku: 'وشەی نهێنی نوێت لە خوارەوە بنووسە. دڵنیابەوە پێداویستییەکانی ئاسایشی تێدایە.',
  },
  newPassword: {
    en: 'New Password',
    ar: 'كلمة المرور الجديدة',
    ku: 'وشەی نهێنی نوێ',
  },
  passwordsMatch: {
    en: 'Passwords match',
    ar: 'كلمات المرور متطابقة',
    ku: 'وشە نهێنییەکان یەکن',
  },
  passwordsDoNotMatch: {
    en: 'Passwords do not match',
    ar: 'كلمات المرور غير متطابقة',
    ku: 'وشە نهێنییەکان یەک ناگرنەوە',
  },
  passwordResetSuccess: {
    en: 'Password Reset Successful',
    ar: 'تم إعادة تعيين كلمة المرور بنجاح',
    ku: 'وشەی نهێنی بە سەرکەوتوویی ڕێکخرایەوە',
  },
  passwordResetSuccessDescription: {
    en: 'Your password has been updated. You can now log in with your new password.',
    ar: 'تم تحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
    ku: 'وشەی نهێنیت نوێ کرایەوە. ئێستا دەتوانیت بە وشەی نهێنی نوێ بچیتە ژوورەوە.',
  },
  invalidLink: {
    en: 'Invalid or Expired Link',
    ar: 'رابط غير صالح أو منتهي الصلاحية',
    ku: 'لینک نادروست یان بەسەرچوو',
  },
  invalidResetToken: {
    en: 'This password reset link is invalid or has already been used.',
    ar: 'رابط إعادة تعيين كلمة المرور هذا غير صالح أو تم استخدامه بالفعل.',
    ku: 'ئەم لینکی ڕێکخستنەوەی وشەی نهێنی نادروستە یان پێشتر بەکارهاتووە.',
  },
  expiredResetToken: {
    en: 'This password reset link has expired. Please request a new one.',
    ar: 'انتهت صلاحية رابط إعادة تعيين كلمة المرور. يرجى طلب رابط جديد.',
    ku: 'ماوەی ئەم لینکی ڕێکخستنەوەی وشەی نهێنی تەواو بووە. تکایە داوای لینکێکی نوێ بکە.',
  },
  resetLinkExpiredDescription: {
    en: 'Password reset links expire after 15 minutes for security. Please request a new link from the login page.',
    ar: 'تنتهي صلاحية روابط إعادة تعيين كلمة المرور بعد 15 دقيقة للأمان. يرجى طلب رابط جديد من صفحة تسجيل الدخول.',
    ku: 'لینکەکانی ڕێکخستنەوەی وشەی نهێنی بۆ ئاسایش لە ماوەی ١٥ خولەکدا بەسەردەچن. تکایە داوای لینکێکی نوێ لە پەڕەی چوونەژوورەوە بکە.',
  },
  validatingResetToken: {
    en: 'Validating reset link...',
    ar: 'جاري التحقق من رابط إعادة التعيين...',
    ku: 'پشتڕاستکردنەوەی لینکی ڕێکخستنەوە...',
  },
  resetPasswordSecurityNotice: {
    en: 'For your security, all active sessions will be logged out after changing your password.',
    ar: 'لأمانك، سيتم تسجيل الخروج من جميع الجلسات النشطة بعد تغيير كلمة المرور.',
    ku: 'بۆ ئاسایشت، هەموو دانیشتنە چالاکەکان دەرچوون دەکرێت دوای گۆڕینی وشەی نهێنی.',
  },
  goToLogin: {
    en: 'Go to Login',
    ar: 'الذهاب إلى تسجيل الدخول',
    ku: 'بڕۆ بۆ چوونەژوورەوە',
  },
  somethingWentWrong: {
    en: 'Something went wrong. Please try again.',
    ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    ku: 'هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەوە.',
  },
  // Contact Page - New design
  contactUs: {
    en: 'Contact Us',
    ar: 'اتصل بنا',
    ku: 'پەیوەندیمان پێوە بکە',
  },
  contactUsDesc: {
    en: 'Email, call, or complete the form to learn how we can help you.',
    ar: 'أرسل بريداً إلكترونياً أو اتصل أو أكمل النموذج لمعرفة كيف يمكننا مساعدتك.',
    ku: 'ئیمەیل، پەیوەندی، یان فۆڕمەکە پڕ بکەرەوە بۆ زانینی چۆنیەتی یارمەتیدانت.',
  },
  customerSupport: {
    en: 'Customer Support',
    ar: 'دعم العملاء',
    ku: 'پشتیوانی کڕیار',
  },
  customerSupportDesc: {
    en: 'Our support team is available around the clock to address any concerns or queries you may have.',
    ar: 'فريق الدعم لدينا متاح على مدار الساعة لمعالجة أي مخاوف أو استفسارات قد تكون لديك.',
    ku: 'تیمی پشتیوانیمان بە شەوورۆژ ئامادەیە بۆ وەڵامدانەوەی هەر پرسیارێک.',
  },
  feedbackSuggestions: {
    en: 'Feedback and Suggestions',
    ar: 'الملاحظات والاقتراحات',
    ku: 'ڕاوبۆچوون و پێشنیارەکان',
  },
  feedbackSuggestionsDesc: {
    en: 'We value your feedback and are continuously working to improve. Your input is crucial in shaping the future.',
    ar: 'نقدر ملاحظاتك ونعمل باستمرار على التحسين. مدخلاتك ضرورية في تشكيل المستقبل.',
    ku: 'ڕاوبۆچوونەکانت بەنرخە و بەردەوام کار دەکەین بۆ باشترکردن. کارتێکردنت گرنگە لە داڕشتنی داهاتوو.',
  },
  mediaInquiries: {
    en: 'Media Inquiries',
    ar: 'الاستفسارات الإعلامية',
    ku: 'پرسیارەکانی میدیا',
  },
  mediaInquiriesDesc: {
    en: 'For media-related questions or press inquiries, please contact us at the provided email.',
    ar: 'للأسئلة المتعلقة بوسائل الإعلام أو استفسارات الصحافة، يرجى التواصل معنا عبر البريد الإلكتروني المقدم.',
    ku: 'بۆ پرسیارەکانی پەیوەندیدار بە میدیا یان ڕۆژنامەوانی، تکایە پەیوەندیمان پێوە بکە لە ئیمەیلی دیاریکراو.',
  },
  ourLocation: {
    en: 'Our Location',
    ar: 'موقعنا',
    ku: 'شوێنمان',
  },
  connectingNearFar: {
    en: 'Connecting Near and Far',
    ar: 'نربط القريب والبعيد',
    ku: 'بەستنەوەی نزیک و دوور',
  },
  headquarters: {
    en: 'Headquarters',
    ar: 'المقر الرئيسي',
    ku: 'بارەگای سەرەکی',
  },
  reachUsAnytime: {
    en: 'You can reach us anytime',
    ar: 'يمكنك التواصل معنا في أي وقت',
    ku: 'دەتوانیت هەر کاتێک پەیوەندیمان پێوە بکەیت',
  },
  firstName: {
    en: 'First name',
    ar: 'الاسم الأول',
    ku: 'ناوی یەکەم',
  },
  lastName: {
    en: 'Last name',
    ar: 'اسم العائلة',
    ku: 'ناوی خێزان',
  },
  phoneNumber: {
    en: 'Phone number',
    ar: 'رقم الهاتف',
    ku: 'ژمارەی تەلەفۆن',
  },
  howCanWeHelp: {
    en: 'How can we help?',
    ar: 'كيف يمكننا مساعدتك؟',
    ku: 'چۆن دەتوانین یارمەتیت بدەین؟',
  },
  submit: {
    en: 'Submit',
    ar: 'إرسال',
    ku: 'ناردن',
  },
  termsAgreement: {
    en: 'By contacting us, you agree to our Terms of Service and Privacy Policy',
    ar: 'بالتواصل معنا، أنت توافق على شروط الخدمة وسياسة الخصوصية',
    ku: 'بە پەیوەندیکردن، ڕازی دەبیت بە مەرجەکانی خزمەتگوزاری و سیاسەتی تایبەتمەندی',
  },
  // Used B/L Module
  usedBL: {
    en: 'Used B/L',
    ar: 'بوالص مستخدمة',
    ku: 'B/L بەکارهاتوو',
  },
  // B/L Presets
  blPresets: {
    en: 'B/L Dropdown Presets',
    ar: 'إعدادات القوائم المنسدلة للبوالص',
    ku: 'ڕێکخستنەکانی لیستی B/L',
  },
  blPresetsDesc: {
    en: 'Manage the preset options for Bank, Owner, and Used For dropdowns in the Used B/L form.',
    ar: 'إدارة خيارات القوائم المنسدلة للبنك والمالك والاستخدام في نموذج البوالص المستخدمة.',
    ku: 'بەڕێوەبردنی هەڵبژاردنەکانی لیستی بانک و خاوەن و بەکارهاتوو لە فۆڕمی B/L.',
  },
  blBankPresets: {
    en: 'Bank Options',
    ar: 'خيارات البنوك',
    ku: 'هەڵبژاردنەکانی بانک',
  },
  blOwnerPresets: {
    en: 'Owner Options',
    ar: 'خيارات المالكين',
    ku: 'هەڵبژاردنەکانی خاوەن',
  },
  blUsedForPresets: {
    en: 'Used For Options',
    ar: 'خيارات الاستخدام',
    ku: 'هەڵبژاردنەکانی بەکارهاتوو',
  },
  addNewBank: {
    en: 'Add new bank...',
    ar: 'إضافة بنك جديد...',
    ku: 'زیادکردنی بانکی نوێ...',
  },
  addNewOwner: {
    en: 'Add new owner...',
    ar: 'إضافة مالك جديد...',
    ku: 'زیادکردنی خاوەنی نوێ...',
  },
  addNewUsedFor: {
    en: 'Add new usage...',
    ar: 'إضافة استخدام جديد...',
    ku: 'زیادکردنی بەکارهێنانی نوێ...',
  },
  presetsUpdated: {
    en: 'Presets updated!',
    ar: 'تم تحديث الإعدادات!',
    ku: 'ڕێکخستنەکان نوێکرانەوە!',
  },
  // B/L Dashboard Management
  manageBLDashboards: {
    en: 'Manage B/L Dashboards',
    ar: 'إدارة لوحات البوالص',
    ku: 'بەڕێوەبردنی داشبۆردەکانی B/L',
  },
  selectBLDashboard: {
    en: 'Select B/L Dashboard',
    ar: 'اختر لوحة البوالص',
    ku: 'داشبۆردی B/L هەڵبژێرە',
  },
  addBLDashboard: {
    en: 'Add B/L Dashboard',
    ar: 'إضافة لوحة بوالص',
    ku: 'زیادکردنی داشبۆردی B/L',
  },
  blDashboardName: {
    en: 'Dashboard Name',
    ar: 'اسم اللوحة',
    ku: 'ناوی داشبۆرد',
  },
  blDashboardAdded: {
    en: 'B/L Dashboard added!',
    ar: 'تمت إضافة لوحة البوالص!',
    ku: 'داشبۆردی B/L زیادکرا!',
  },
  blDashboardUpdated: {
    en: 'B/L Dashboard updated!',
    ar: 'تم تحديث لوحة البوالص!',
    ku: 'داشبۆردی B/L نوێکرایەوە!',
  },
  blDashboardDeleted: {
    en: 'B/L Dashboard deleted!',
    ar: 'تم حذف لوحة البوالص!',
    ku: 'داشبۆردی B/L سڕایەوە!',
  },
  // Unused B/L Module
  unusedBL: { en: 'Unused B/L', ar: 'بوالص غير مستخدمة', ku: 'B/L بەکار نەهاتوو' },
  addBL: { en: 'Add B/L', ar: 'إضافة بوليصة', ku: 'زیادکردنی B/L' },
  useThisBL: { en: 'Use this B/L', ar: 'استخدم هذه البوليصة', ku: 'ئەم B/Lـە بەکاربهێنە' },
  totalUnused: { en: 'Total Unused', ar: 'غير المستخدمة', ku: 'بەکار نەهاتوو' },
  totalUsed: { en: 'Total Used', ar: 'المستخدمة', ku: 'بەکارهاتوو' },
  totalAll: { en: 'Total', ar: 'الإجمالي', ku: 'کۆی گشتی' },
  blNo: { en: 'B/L No', ar: 'رقم البوليصة', ku: 'ژمارەی B/L' },
  owner: { en: 'Owner', ar: 'المالك', ku: 'خاوەن' },
  clearanceCompany: { en: 'Clearance Company', ar: 'شركة التخليص', ku: 'کۆمپانیای گومرک' },
  productDescription: { en: 'Product Description', ar: 'وصف المنتج', ku: 'وەسفی بەرهەم' },
  productCategory: { en: 'Product Category', ar: 'فئة المنتج', ku: 'جۆری بەرهەم' },
  blDate: { en: 'B/L Date', ar: 'تاريخ البوليصة', ku: 'بەرواری B/L' },
  clearanceDate: { en: 'Clearance Date', ar: 'تاريخ التخليص', ku: 'بەرواری گومرک' },
  quantity: { en: 'Quantity', ar: 'الكمية', ku: 'بڕ' },
  shipperName: { en: 'Shipper', ar: 'الشاحن', ku: 'ناردەر' },
  portOfLoading: { en: 'Port of Loading', ar: 'ميناء الشحن', ku: 'بەندەری بارکردن' },
  saveAndAddAnother: { en: 'Save & Add Another', ar: 'حفظ وإضافة أخرى', ku: 'هەڵگرتن و زیادکردنی تر' },
  confirmUse: { en: 'Confirm Use', ar: 'تأكيد الاستخدام', ku: 'دڵنیاکردنەوە' },
  movedToUsedBL: { en: 'Moved to Used B/L successfully!', ar: 'تم النقل إلى المستخدمة بنجاح!', ku: 'بە سەرکەوتوویی گوازرایەوە!' },
  viewInUsedBL: { en: 'View in Used B/L', ar: 'عرض في المستخدمة', ku: 'بینین لە بەکارهاتوو' },
  addPages: { en: 'Add Pages', ar: 'إضافة صفحات', ku: 'زیادکردنی لاپەڕە' },
  uploadFiles: { en: 'Upload Files', ar: 'رفع الملفات', ku: 'بارکردنی فایل' },
  dragDropHint: { en: 'Drag & drop files here or click to browse', ar: 'اسحب الملفات هنا أو انقر للاستعراض', ku: 'فایلەکان لێرە دابنێ یان کلیک بکە' },
  pageLabel: { en: 'Page label', ar: 'تسمية الصفحة', ku: 'ناوی لاپەڕە' },
  unusedBLSettings: { en: 'Unused B/L Settings', ar: 'إعدادات البوالص غير المستخدمة', ku: 'ڕێکخستنەکانی B/L' },
  clearanceCompanies: { en: 'Clearance Companies', ar: 'شركات التخليص', ku: 'کۆمپانیاکانی گومرک' },
  productCategories: { en: 'Product Categories', ar: 'فئات المنتجات', ku: 'جۆرەکانی بەرهەم' },
  quantityUnits: { en: 'Quantity Units', ar: 'وحدات الكمية', ku: 'یەکەکانی بڕ' },
  portsOfLoading: { en: 'Ports of Loading', ar: 'موانئ الشحن', ku: 'بەندەرەکانی بارکردن' },
  usingFor: { en: 'Using For (Customer)', ar: 'الاستخدام لـ (العميل)', ku: 'بەکارهێنان بۆ (کڕیار)' },
  usedForManufacturer: { en: 'Used For (Manufacturer)', ar: 'مستخدم لـ (المصنع)', ku: 'بەکارهاتوو بۆ (بەرهەمهێنەر)' },
  selectBLDashboardTarget: { en: 'Target Used B/L Dashboard', ar: 'لوحة البوالص المستهدفة', ku: 'داشبۆردی مەبەست' },
  duplicateBLWarning: { en: 'This B/L number already exists!', ar: 'رقم البوليصة موجود بالفعل!', ku: 'ئەم ژمارەی B/L پێشتر هەیە!' },
  blDetails: { en: 'B/L Details', ar: 'تفاصيل البوليصة', ku: 'وردەکارییەکانی B/L' },
  files: { en: 'Files', ar: 'الملفات', ku: 'فایلەکان' },
  download: { en: 'Download', ar: 'تحميل', ku: 'داگرتن' },
  view: { en: 'View', ar: 'عرض', ku: 'بینین' },
  noFilesUploaded: { en: 'No files uploaded', ar: 'لم يتم رفع ملفات', ku: 'هیچ فایلێک بار نەکراوە' },
  blRecordSaved: { en: 'B/L record saved successfully!', ar: 'تم حفظ السجل بنجاح!', ku: 'تۆمار بە سەرکەوتوویی هەڵگیرا!' },
  blRecordDeleted: { en: 'B/L record deleted!', ar: 'تم حذف السجل!', ku: 'تۆمار سڕایەوە!' },
  searchUnusedBL: { en: 'Search B/L, Container, Owner...', ar: 'بحث بوليصة، حاوية، مالك...', ku: 'گەڕان لە B/L، کۆنتەینەر...' },
  addNewOption: { en: 'Add new...', ar: 'إضافة جديد...', ku: 'زیادکردنی نوێ...' },
  unusedStatus: { en: 'Unused', ar: 'غير مستخدمة', ku: 'بەکار نەهاتوو' },
  usedStatus: { en: 'Used', ar: 'مستخدمة', ku: 'بەکارهاتوو' },

  // ============ POS Module ============
  // Navigation
  pos: { en: 'POS', ar: 'نقطة البيع', ku: 'خاڵی فرۆشتن' },
  inventory: { en: 'Inventory', ar: 'المخزون', ku: 'کۆگا' },
  suppliers: { en: 'Suppliers', ar: 'الموردون', ku: 'دابینکەرەکان' },
  purchaseOrders: { en: 'Purchase Orders', ar: 'أوامر الشراء', ku: 'داواکاری کڕین' },
  returns: { en: 'Returns', ar: 'المرتجعات', ku: 'گەڕانەوەکان' },
  reports: { en: 'Reports', ar: 'التقارير', ku: 'ڕاپۆرتەکان' },

  // POS — common UI
  posSearchProducts: { en: 'Search products, SKU, barcode...', ar: 'ابحث عن منتج، SKU، باركود...', ku: 'گەڕان بۆ بەرهەم، SKU، بارکۆد...' },
  scan: { en: 'Scan', ar: 'مسح', ku: 'سکان' },
  recall: { en: 'Recall', ar: 'استرجاع', ku: 'هێنانەوە' },
  all: { en: 'All', ar: 'الكل', ku: 'هەموو' },
  noProductsFound: { en: 'No products found.', ar: 'لم يتم العثور على منتجات.', ku: 'هیچ بەرهەمێک نەدۆزرایەوە.' },
  left: { en: 'left', ar: 'متبقي', ku: 'ماوە' },
  cart: { en: 'Cart', ar: 'السلة', ku: 'سەبەتە' },
  hold: { en: 'Hold', ar: 'تعليق', ku: 'وەستاندن' },
  clear: { en: 'Clear', ar: 'مسح', ku: 'سڕینەوە' },
  walkInCustomer: { en: 'Walk-in Customer', ar: 'عميل عابر', ku: 'کڕیاری ڕێبوار' },
  addCustomerPlus: { en: '+ Add Customer', ar: '+ إضافة عميل', ku: '+ زیادکردنی کڕیار' },
  credit: { en: 'Credit', ar: 'رصيد', ku: 'قەرز' },
  points: { en: 'Points', ar: 'النقاط', ku: 'خاڵەکان' },
  cartIsEmpty: { en: 'Cart is empty', ar: 'السلة فارغة', ku: 'سەبەتە بەتاڵە' },
  eachUnit: { en: 'each', ar: 'للوحدة', ku: 'بۆ یەک' },
  discount: { en: 'Discount', ar: 'خصم', ku: 'داشکاندن' },
  redeemPoints: { en: 'Redeem points', ar: 'استبدال النقاط', ku: 'گۆڕینەوەی خاڵ' },
  applyStoreCredit: { en: 'Apply store credit', ar: 'استخدام رصيد المتجر', ku: 'بەکارهێنانی قەرزی فرۆشگا' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي', ku: 'کۆی بەشی' },
  tax: { en: 'Tax', ar: 'الضريبة', ku: 'باج' },
  loyalty: { en: 'Loyalty', ar: 'الولاء', ku: 'دڵسۆزی' },
  storeCredit: { en: 'Store Credit', ar: 'رصيد المتجر', ku: 'قەرزی فرۆشگا' },
  total: { en: 'Total', ar: 'الإجمالي', ku: 'کۆ' },
  willEarn: { en: 'Will earn', ar: 'سيكسب', ku: 'بەدەست دێت' },
  pts: { en: 'pts', ar: 'نقطة', ku: 'خاڵ' },
  checkout: { en: 'Checkout', ar: 'الدفع', ku: 'پارەدان' },
  completePayment: { en: 'Complete Payment', ar: 'إتمام الدفع', ku: 'تەواوکردنی پارەدان' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع', ku: 'شێوازی پارەدان' },
  cash: { en: 'Cash', ar: 'نقدًا', ku: 'نەقد' },
  cardMethod: { en: 'Card', ar: 'بطاقة', ku: 'کارت' },
  creditMethod: { en: 'Credit', ar: 'آجل', ku: 'قەرز' },
  splitMethod: { en: 'Split', ar: 'مقسم', ku: 'دابەشکراو' },
  notesOptional: { en: 'Notes (optional)', ar: 'ملاحظات (اختياري)', ku: 'تێبینی (ئارەزوومەندانە)' },
  saleNotesPh: { en: 'Sale notes...', ar: 'ملاحظات البيع...', ku: 'تێبینی فرۆشتن...' },
  processingDots: { en: 'Processing...', ar: 'جارٍ المعالجة...', ku: 'پرۆسەکردن...' },
  pay: { en: 'Pay', ar: 'ادفع', ku: 'پارە بدە' },
  saleCompleteTitle: { en: 'Sale Complete!', ar: 'تم البيع!', ku: 'فرۆشتن تەواو بوو!' },
  printReceipt: { en: 'Print Receipt', ar: 'طباعة الإيصال', ku: 'چاپی پسوولە' },
  saveToFolder: { en: 'Save to Folder', ar: 'حفظ إلى المجلد', ku: 'پاشەکەوت بۆ بوخچە' },
  savingDots: { en: 'Saving...', ar: 'جارٍ الحفظ...', ku: 'پاشەکەوتکردن...' },
  chooseFolderSave: { en: 'Choose Folder & Save', ar: 'اختر المجلد واحفظ', ku: 'بوخچە هەڵبژێرە و پاشەکەوت بکە' },
  downloadPdf: { en: 'Download PDF', ar: 'تنزيل PDF', ku: 'داگرتنی PDF' },
  startNewSale: { en: 'Start New Sale', ar: 'بدء بيع جديد', ku: 'دەستپێکردنی فرۆشتنی نوێ' },
  addCustomerTitle: { en: 'Add Customer', ar: 'إضافة عميل', ku: 'زیادکردنی کڕیار' },
  customerName: { en: 'Customer name', ar: 'اسم العميل', ku: 'ناوی کڕیار' },
  phoneNumberPh: { en: 'Phone number', ar: 'رقم الهاتف', ku: 'ژمارەی مۆبایل' },
  holdSale: { en: 'Hold Sale', ar: 'تعليق البيع', ku: 'وەستاندنی فرۆشتن' },
  holdLabelOptional: { en: 'Label (optional)', ar: 'تسمية (اختياري)', ku: 'ناونیشان (ئارەزوومەندانە)' },
  holdLabelPh: { en: "e.g., Table 4, John's order", ar: 'مثال: طاولة 4، طلب جون', ku: 'وەک: مێزی ٤، داواکاری جۆن' },
  heldSales: { en: 'Held Sales', ar: 'مبيعات معلقة', ku: 'فرۆشتنە وەستێنراوەکان' },
  noHeldSales: { en: 'No held sales', ar: 'لا توجد مبيعات معلقة', ku: 'هیچ فرۆشتنێکی وەستێنراو نییە' },
  items: { en: 'items', ar: 'عناصر', ku: 'بڕگە' },
  heldShort: { en: 'Held', ar: 'معلق', ku: 'وەستێنراو' },
  added: { en: 'Added', ar: 'تمت الإضافة', ku: 'زیادکرا' },
  productNotFoundToast: { en: 'Product not found', ar: 'المنتج غير موجود', ku: 'بەرهەم نەدۆزرایەوە' },
  productNotFoundDesc: { en: 'No product with barcode', ar: 'لا يوجد منتج بهذا الباركود', ku: 'هیچ بەرهەمێک بەم بارکۆدە نییە' },
  saleCompletedToast: { en: 'Sale completed!', ar: 'تم البيع!', ku: 'فرۆشتن تەواو بوو!' },
  saleFailedToast: { en: 'Sale failed', ar: 'فشل البيع', ku: 'فرۆشتن سەرکەوتوو نەبوو' },
  saleHeldToast: { en: 'Sale held', ar: 'تم تعليق البيع', ku: 'فرۆشتن وەستێنرا' },
  savedToHeld: { en: 'Saved to held sales', ar: 'تم حفظه في المبيعات المعلقة', ku: 'لە فرۆشتنە وەستێنراوەکان پاشەکەوت کرا' },
  saleRecalledToast: { en: 'Sale recalled', ar: 'تم استرجاع البيع', ku: 'فرۆشتن گەڕایەوە' },
  folderSelectedToast: { en: 'Folder selected', ar: 'تم اختيار المجلد', ku: 'بوخچە هەڵبژێردرا' },
  savedToast: { en: 'Saved!', ar: 'تم الحفظ!', ku: 'پاشەکەوت کرا!' },
  saveFailedToast: { en: 'Save failed', ar: 'فشل الحفظ', ku: 'پاشەکەوتکردن سەرکەوتوو نەبوو' },

  // Inventory
  manageProductsStock: { en: 'Manage products, stock & categories', ar: 'إدارة المنتجات والمخزون والفئات', ku: 'بەڕێوەبردنی بەرهەم، کۆگا و پۆلەکان' },
  categories: { en: 'Categories', ar: 'الفئات', ku: 'پۆلەکان' },
  addProduct: { en: 'Add Product', ar: 'إضافة منتج', ku: 'زیادکردنی بەرهەم' },
  productsLabel: { en: 'Products', ar: 'المنتجات', ku: 'بەرهەمەکان' },
  totalStock: { en: 'Total Stock', ar: 'إجمالي المخزون', ku: 'کۆی کۆگا' },
  stockValue: { en: 'Stock Value', ar: 'قيمة المخزون', ku: 'بەهای کۆگا' },
  lowStock: { en: 'Low Stock', ar: 'مخزون منخفض', ku: 'کۆگای کەم' },
  lowStockAlert: { en: 'Low Stock Alert', ar: 'تنبيه مخزون منخفض', ku: 'ئاگاداری کۆگای کەم' },
  searchProductsPh: { en: 'Search products...', ar: 'ابحث عن منتجات...', ku: 'گەڕان بۆ بەرهەمەکان...' },
  allCategories: { en: 'All Categories', ar: 'كل الفئات', ku: 'هەموو پۆلەکان' },
  productCol: { en: 'Product', ar: 'المنتج', ku: 'بەرهەم' },
  skuLabel: { en: 'SKU', ar: 'SKU', ku: 'SKU' },
  categoryCol: { en: 'Category', ar: 'الفئة', ku: 'پۆل' },
  priceCol: { en: 'Price', ar: 'السعر', ku: 'نرخ' },
  costCol: { en: 'Cost', ar: 'التكلفة', ku: 'تێچوون' },
  stockCol: { en: 'Stock', ar: 'المخزون', ku: 'کۆگا' },
  taxPctCol: { en: 'Tax %', ar: 'الضريبة %', ku: 'باج %' },
  actionsCol: { en: 'Actions', ar: 'إجراءات', ku: 'کردارەکان' },
  loadingDots: { en: 'Loading...', ar: 'جارٍ التحميل...', ku: 'بارکردن...' },
  productUpdatedToast: { en: 'Product updated', ar: 'تم تحديث المنتج', ku: 'بەرهەم نوێ کرایەوە' },
  productAddedToast: { en: 'Product added', ar: 'تمت إضافة المنتج', ku: 'بەرهەم زیادکرا' },
  productDeletedToast: { en: 'Product deleted', ar: 'تم حذف المنتج', ku: 'بەرهەم سڕایەوە' },
  editProductTitle: { en: 'Edit Product', ar: 'تعديل المنتج', ku: 'دەستکاری بەرهەم' },
  addProductTitle: { en: 'Add Product', ar: 'إضافة منتج', ku: 'زیادکردنی بەرهەم' },
  productImage: { en: 'Product Image', ar: 'صورة المنتج', ku: 'وێنەی بەرهەم' },
  clickUploadImage: { en: 'Click to upload image (max 5MB)', ar: 'انقر لرفع صورة (حد أقصى 5MB)', ku: 'کلیک بکە بۆ بارکردنی وێنە (زۆرترین 5MB)' },
  nameLabel: { en: 'Name', ar: 'الاسم', ku: 'ناو' },
  productNamePh: { en: 'Product name', ar: 'اسم المنتج', ku: 'ناوی بەرهەم' },
  barcodeLabel: { en: 'Barcode', ar: 'باركود', ku: 'بارکۆد' },
  descriptionLabel: { en: 'Description', ar: 'الوصف', ku: 'پێناسە' },
  priceLabel: { en: 'Price', ar: 'السعر', ku: 'نرخ' },
  costPriceLabel: { en: 'Cost Price', ar: 'سعر التكلفة', ku: 'نرخی تێچوون' },
  taxPctLabel: { en: 'Tax %', ar: 'الضريبة %', ku: 'باج %' },
  categoryLabel: { en: 'Category', ar: 'الفئة', ku: 'پۆل' },
  selectCategoryPh: { en: 'Select category', ar: 'اختر فئة', ku: 'پۆلێک هەڵبژێرە' },
  initialStock: { en: 'Initial Stock', ar: 'المخزون الأولي', ku: 'کۆگای سەرەتایی' },
  minStockLevel: { en: 'Min Stock Level', ar: 'الحد الأدنى للمخزون', ku: 'کەمترین ئاستی کۆگا' },
  uploadingDots: { en: 'Uploading...', ar: 'جارٍ الرفع...', ku: 'بارکردن...' },
  saveChangesBtn: { en: 'Save Changes', ar: 'حفظ التغييرات', ku: 'پاشەکەوتی گۆڕانکاری' },
  stockInTitle: { en: 'Stock In', ar: 'إدخال مخزون', ku: 'هاتنە ژوورەوەی کۆگا' },
  stockOutTitle: { en: 'Stock Out', ar: 'إخراج مخزون', ku: 'دەرچوونی کۆگا' },
  currentStock: { en: 'Current stock', ar: 'المخزون الحالي', ku: 'کۆگای ئێستا' },
  quantityLabel: { en: 'Quantity', ar: 'الكمية', ku: 'بڕ' },
  referenceLabel: { en: 'Reference', ar: 'مرجع', ku: 'سەرچاوە' },
  refPh: { en: 'PO number, etc.', ar: 'رقم أمر شراء، إلخ.', ku: 'ژمارەی PO، هتد.' },
  notesLabel: { en: 'Notes', ar: 'ملاحظات', ku: 'تێبینی' },
  optionalNotesPh: { en: 'Optional notes', ar: 'ملاحظات اختيارية', ku: 'تێبینی ئارەزوومەندانە' },
  confirmStockIn: { en: 'Confirm Stock In', ar: 'تأكيد إدخال المخزون', ku: 'پشتڕاستکردنەوەی هاتنە ژوورەوە' },
  confirmStockOut: { en: 'Confirm Stock Out', ar: 'تأكيد إخراج المخزون', ku: 'پشتڕاستکردنەوەی دەرچوون' },
  manageCategoriesTitle: { en: 'Manage Categories', ar: 'إدارة الفئات', ku: 'بەڕێوەبردنی پۆلەکان' },
  categoryNamePh: { en: 'Category name', ar: 'اسم الفئة', ku: 'ناوی پۆل' },
  noCategoriesYet: { en: 'No categories yet', ar: 'لا توجد فئات بعد', ku: 'هێشتا پۆل نییە' },
  categoryAddedToast: { en: 'Category added', ar: 'تمت إضافة الفئة', ku: 'پۆل زیادکرا' },
  deleteProductConfirm: { en: 'Delete this product?', ar: 'حذف هذا المنتج؟', ku: 'ئەم بەرهەمە بسڕێتەوە؟' },
  stockAddedToast: { en: 'Stock added', ar: 'تمت إضافة المخزون', ku: 'کۆگا زیادکرا' },
  stockDeductedToast: { en: 'Stock deducted', ar: 'تم خصم المخزون', ku: 'کۆگا کەمکرایەوە' },
  fileTooLarge: { en: 'File too large', ar: 'الملف كبير جداً', ku: 'فایل زۆر گەورەیە' },
  max5MB: { en: 'Max 5MB', ar: 'الحد الأقصى 5MB', ku: 'زۆرترین 5MB' },
  uploadFailed: { en: 'Upload failed', ar: 'فشل الرفع', ku: 'بارکردن سەرکەوتوو نەبوو' },

  // Suppliers
  manageVendors: { en: 'Manage vendors for your purchase orders', ar: 'إدارة الموردين لأوامر الشراء', ku: 'بەڕێوەبردنی دابینکەرەکان بۆ داواکاری کڕین' },
  addSupplier: { en: 'Add Supplier', ar: 'إضافة مورد', ku: 'زیادکردنی دابینکەر' },
  searchSuppliersPh: { en: 'Search suppliers...', ar: 'ابحث عن موردين...', ku: 'گەڕان بۆ دابینکەرەکان...' },
  contactCol: { en: 'Contact', ar: 'جهة الاتصال', ku: 'پەیوەندی' },
  addressCol: { en: 'Address', ar: 'العنوان', ku: 'ناونیشان' },
  balanceCol: { en: 'Balance', ar: 'الرصيد', ku: 'باڵانس' },
  noSuppliersYet: { en: 'No suppliers yet', ar: 'لا يوجد موردون بعد', ku: 'هێشتا دابینکەر نییە' },
  supplierUpdatedToast: { en: 'Supplier updated', ar: 'تم تحديث المورد', ku: 'دابینکەر نوێ کرایەوە' },
  supplierAddedToast: { en: 'Supplier added', ar: 'تمت إضافة المورد', ku: 'دابینکەر زیادکرا' },
  supplierRemovedToast: { en: 'Supplier removed', ar: 'تم إزالة المورد', ku: 'دابینکەر لابرا' },
  removeSupplierConfirm: { en: 'Remove this supplier?', ar: 'إزالة هذا المورد؟', ku: 'ئەم دابینکەرە لاببرێت؟' },
  editSupplierTitle: { en: 'Edit Supplier', ar: 'تعديل المورد', ku: 'دەستکاری دابینکەر' },
  addSupplierTitle: { en: 'Add Supplier', ar: 'إضافة مورد', ku: 'زیادکردنی دابینکەر' },
  supplierNamePh: { en: 'Supplier name', ar: 'اسم المورد', ku: 'ناوی دابینکەر' },
  phoneLabel: { en: 'Phone', ar: 'الهاتف', ku: 'مۆبایل' },
  emailLabel: { en: 'Email', ar: 'البريد الإلكتروني', ku: 'ئیمەیل' },
  addressLabel: { en: 'Address', ar: 'العنوان', ku: 'ناونیشان' },

  // Purchase Orders
  orderStockFromSuppliers: { en: 'Order stock from suppliers and receive into inventory', ar: 'اطلب المخزون من الموردين واستلم في المخزون', ku: 'داواکردنی کۆگا لە دابینکەران و وەرگرتن بۆ کۆگا' },
  newPO: { en: 'New PO', ar: 'أمر شراء جديد', ku: 'PO نوێ' },
  poNumber: { en: 'PO #', ar: 'رقم الأمر', ku: 'ژمارەی PO' },
  supplierCol: { en: 'Supplier', ar: 'المورد', ku: 'دابینکەر' },
  dateCol: { en: 'Date', ar: 'التاريخ', ku: 'بەروار' },
  statusCol: { en: 'Status', ar: 'الحالة', ku: 'دۆخ' },
  itemsCol: { en: 'Items', ar: 'العناصر', ku: 'بڕگەکان' },
  totalCol: { en: 'Total', ar: 'الإجمالي', ku: 'کۆ' },
  noPurchaseOrders: { en: 'No purchase orders', ar: 'لا توجد أوامر شراء', ku: 'هیچ داواکاری کڕین نییە' },
  newPurchaseOrderTitle: { en: 'New Purchase Order', ar: 'أمر شراء جديد', ku: 'داواکاری کڕینی نوێ' },
  supplierLabel: { en: 'Supplier', ar: 'المورد', ku: 'دابینکەر' },
  selectSupplierPh: { en: 'Select supplier', ar: 'اختر موردًا', ku: 'دابینکەر هەڵبژێرە' },
  expectedDateLabel: { en: 'Expected Date', ar: 'التاريخ المتوقع', ku: 'بەرواری چاوەڕوانکراو' },
  itemsLabel: { en: 'Items', ar: 'العناصر', ku: 'بڕگەکان' },
  addItemBtn: { en: 'Add Item', ar: 'إضافة عنصر', ku: 'زیادکردنی بڕگە' },
  selectProductPh: { en: 'Select product', ar: 'اختر منتجًا', ku: 'بەرهەم هەڵبژێرە' },
  qtyShort: { en: 'Qty', ar: 'الكمية', ku: 'بڕ' },
  costShort: { en: 'Cost', ar: 'التكلفة', ku: 'تێچوون' },
  noItemsYet: { en: 'No items yet', ar: 'لا توجد عناصر بعد', ku: 'هێشتا بڕگە نییە' },
  optionalNotesPh2: { en: 'Optional notes', ar: 'ملاحظات اختيارية', ku: 'تێبینی ئارەزوومەندانە' },
  createPOBtn: { en: 'Create Purchase Order', ar: 'إنشاء أمر شراء', ku: 'دروستکردنی داواکاری کڕین' },
  receivePOConfirm: { en: 'Receive PO {n}? Stock will be updated.', ar: 'استلام أمر الشراء {n}؟ سيتم تحديث المخزون.', ku: 'وەرگرتنی PO {n}؟ کۆگا نوێ دەکرێتەوە.' },
  poReceivedStockUpdated: { en: 'PO received & stock updated', ar: 'تم استلام الأمر وتحديث المخزون', ku: 'PO وەرگیرا و کۆگا نوێ کرایەوە' },
  failed: { en: 'Failed', ar: 'فشل', ku: 'سەرکەوتوو نەبوو' },
  poDeletedToast: { en: 'PO deleted', ar: 'تم حذف الأمر', ku: 'PO سڕایەوە' },
  deletePOConfirm: { en: 'Delete this PO?', ar: 'حذف هذا الأمر؟', ku: 'ئەم PO بسڕێتەوە؟' },
  poCreatedToast: { en: 'Purchase Order created', ar: 'تم إنشاء أمر الشراء', ku: 'داواکاری کڕین دروست کرا' },
  pickSupplierAndItem: { en: 'Pick supplier & at least one item', ar: 'اختر موردًا وعنصرًا واحدًا على الأقل', ku: 'دابینکەر و لانیکەم یەک بڕگە هەڵبژێرە' },
  viewPOTitle: { en: 'PO', ar: 'أمر الشراء', ku: 'PO' },
  orderDateLabel: { en: 'Order Date', ar: 'تاريخ الطلب', ku: 'بەرواری داواکاری' },
  expectedLabel: { en: 'Expected', ar: 'متوقع', ku: 'چاوەڕوانکراو' },
  receivedLabel: { en: 'Received', ar: 'مُستلم', ku: 'وەرگیراو' },
  orderedQty: { en: 'Ordered', ar: 'مطلوب', ku: 'داواکراو' },
  receivedQty: { en: 'Received', ar: 'مُستلم', ku: 'وەرگیراو' },
  receiveStockBtn: { en: 'Receive Stock', ar: 'استلام المخزون', ku: 'وەرگرتنی کۆگا' },
  cancelPOBtn: { en: 'Cancel PO', ar: 'إلغاء الأمر', ku: 'هەڵوەشاندنەوەی PO' },
  statusDraft: { en: 'Draft', ar: 'مسودة', ku: 'ڕەشنووس' },
  statusOrdered: { en: 'Ordered', ar: 'تم الطلب', ku: 'داواکراو' },
  statusPartial: { en: 'Partial', ar: 'جزئي', ku: 'بەشێکی' },
  statusReceived: { en: 'Received', ar: 'مُستلم', ku: 'وەرگیراو' },
  statusCancelled: { en: 'Cancelled', ar: 'ملغى', ku: 'هەڵوەشێنراوەتەوە' },

  // Returns
  returnsRefunds: { en: 'Returns & Refunds', ar: 'المرتجعات والاستردادات', ku: 'گەڕانەوەکان و پارەگەڕاندنەوە' },
  processReturnsDesc: { en: 'Process returns; auto-restock and refund', ar: 'معالجة المرتجعات؛ إعادة المخزون تلقائيًا والاسترداد', ku: 'پرۆسەی گەڕانەوە؛ بەخۆکار گەڕاندنەوەی کۆگا و پارە' },
  newReturn: { en: 'New Return', ar: 'مرتجع جديد', ku: 'گەڕانەوەی نوێ' },
  returnNumber: { en: 'Return #', ar: 'رقم المرتجع', ku: 'ژمارەی گەڕانەوە' },
  methodCol: { en: 'Method', ar: 'الطريقة', ku: 'شێواز' },
  reasonCol: { en: 'Reason', ar: 'السبب', ku: 'هۆکار' },
  refundedCol: { en: 'Refunded', ar: 'مُسترد', ku: 'گەڕێنراوەتەوە' },
  noReturnsYet: { en: 'No returns yet', ar: 'لا توجد مرتجعات بعد', ku: 'هێشتا گەڕانەوە نییە' },
  selectSaleToReturn: { en: 'Select Sale to Return', ar: 'اختر بيعًا للإرجاع', ku: 'فرۆشتن هەڵبژێرە بۆ گەڕانەوە' },
  searchSaleOrCustomer: { en: 'Search sale # or customer...', ar: 'ابحث برقم البيع أو العميل...', ku: 'گەڕان بە ژمارەی فرۆشتن یان کڕیار...' },
  saleNumCol: { en: 'Sale #', ar: 'رقم البيع', ku: 'ژمارەی فرۆشتن' },
  customerCol: { en: 'Customer', ar: 'العميل', ku: 'کڕیار' },
  walkIn: { en: 'Walk-in', ar: 'عابر', ku: 'ڕێبوار' },
  returnBtn: { en: 'Return', ar: 'إرجاع', ku: 'گەڕاندنەوە' },
  processReturnTitle: { en: 'Process Return', ar: 'معالجة المرتجع', ku: 'پرۆسەی گەڕانەوە' },
  itemCol: { en: 'Item', ar: 'العنصر', ku: 'بڕگە' },
  soldCol: { en: 'Sold', ar: 'مباع', ku: 'فرۆشراو' },
  returnQtyCol: { en: 'Return Qty', ar: 'كمية الإرجاع', ku: 'بڕی گەڕانەوە' },
  restockCol: { en: 'Restock', ar: 'إعادة للمخزون', ku: 'گەڕاندنەوە بۆ کۆگا' },
  refundMethodLabel: { en: 'Refund Method', ar: 'طريقة الاسترداد', ku: 'شێوازی پارەگەڕاندنەوە' },
  refundTotalLabel: { en: 'Refund Total', ar: 'إجمالي الاسترداد', ku: 'کۆی پارەگەڕاندنەوە' },
  storeCreditMethod: { en: 'Store Credit', ar: 'رصيد المتجر', ku: 'قەرزی فرۆشگا' },
  originalPaymentMethod: { en: 'Original Payment', ar: 'الدفع الأصلي', ku: 'پارەدانی سەرەکی' },
  reasonForReturnPh: { en: 'Reason for return...', ar: 'سبب الإرجاع...', ku: 'هۆکاری گەڕاندنەوە...' },
  processReturnRefund: { en: 'Process Return — Refund', ar: 'معالجة المرتجع — استرداد', ku: 'پرۆسەی گەڕانەوە — پارەگەڕاندنەوە' },
  returnProcessedToast: { en: 'Return processed', ar: 'تمت معالجة المرتجع', ku: 'گەڕانەوە پرۆسە کرا' },
  pickAtLeastOneItem: { en: 'Pick at least one item', ar: 'اختر عنصرًا واحدًا على الأقل', ku: 'لانیکەم یەک بڕگە هەڵبژێرە' },
  returnFailedToast: { en: 'Return failed', ar: 'فشل المرتجع', ku: 'گەڕانەوە سەرکەوتوو نەبوو' },
  refund: { en: 'Refund', ar: 'استرداد', ku: 'پارەگەڕاندنەوە' },

  // POS Reports
  posReportsTitle: { en: 'POS Reports', ar: 'تقارير نقطة البيع', ku: 'ڕاپۆرتەکانی POS' },
  salesProfitDesc: { en: 'Sales, profit, top products & stock valuation', ar: 'المبيعات، الربح، المنتجات الأعلى وتقييم المخزون', ku: 'فرۆشتن، قازانج، باشترین بەرهەم و بەهای کۆگا' },
  csvBtn: { en: 'CSV', ar: 'CSV', ku: 'CSV' },
  zReportBtn: { en: 'Z-Report', ar: 'تقرير Z', ku: 'ڕاپۆرتی Z' },
  today: { en: 'Today', ar: 'اليوم', ku: 'ئەمڕۆ' },
  days7: { en: '7 days', ar: '7 أيام', ku: '٧ ڕۆژ' },
  days30: { en: '30 days', ar: '30 يوم', ku: '٣٠ ڕۆژ' },
  allTime: { en: 'All time', ar: 'كل الوقت', ku: 'هەموو کات' },
  netSales: { en: 'Net Sales', ar: 'صافي المبيعات', ku: 'فرۆشتنی پاک' },
  transactionsLabel: { en: 'Transactions', ar: 'المعاملات', ku: 'مامەڵەکان' },
  avgTicket: { en: 'Avg Ticket', ar: 'متوسط الفاتورة', ku: 'تێکڕای پسوولە' },
  profitEst: { en: 'Profit (est.)', ar: 'الربح (تقديري)', ku: 'قازانج (خەمڵاندن)' },
  refundedLabel: { en: 'Refunded', ar: 'مُسترد', ku: 'گەڕێنراوەتەوە' },
  taxCollected: { en: 'Tax Collected', ar: 'الضريبة المحصلة', ku: 'باجی کۆکراوە' },
  discountsLabel: { en: 'Discounts', ar: 'الخصومات', ku: 'داشکاندنەکان' },
  cogsEst: { en: 'COGS (est.)', ar: 'تكلفة البضاعة المباعة (تقديري)', ku: 'تێچوونی کاڵای فرۆشراو (خەمڵاندن)' },
  topProductsTitle: { en: 'Top Products', ar: 'المنتجات الأعلى', ku: 'باشترین بەرهەمەکان' },
  stockValuationTitle: { en: 'Stock Valuation', ar: 'تقييم المخزون', ku: 'بەهاکردنی کۆگا' },
  totalUnits: { en: 'Total Units', ar: 'إجمالي الوحدات', ku: 'کۆی یەکەکان' },
  atCost: { en: 'At Cost', ar: 'بالتكلفة', ku: 'بە تێچوون' },
  atRetail: { en: 'At Retail', ar: 'بسعر التجزئة', ku: 'بە نرخی فرۆشتن' },
  potentialProfit: { en: 'Potential Profit', ar: 'الربح المحتمل', ku: 'قازانجی ئەگەری' },
  recentSales: { en: 'Recent Sales', ar: 'المبيعات الأخيرة', ku: 'فرۆشتنە دواییەکان' },
  noData: { en: 'No data', ar: 'لا توجد بيانات', ku: 'هیچ زانیاری نییە' },
  statusCompleted: { en: 'completed', ar: 'مكتمل', ku: 'تەواوبوو' },
  generatedLabel: { en: 'Generated', ar: 'تم الإنشاء', ku: 'دروستکرا' },
  metricCol: { en: 'Metric', ar: 'المقياس', ku: 'پێوەر' },
  valueCol: { en: 'Value', ar: 'القيمة', ku: 'بەها' },
  grossSales: { en: 'Gross Sales', ar: 'إجمالي المبيعات', ku: 'کۆی فرۆشتن' },

  // Barcode scanner
  scanBarcodeTitle: { en: 'Scan Barcode', ar: 'مسح الباركود', ku: 'سکانی بارکۆد' },
  cameraDenied: { en: 'Camera access denied. Please allow camera permissions.', ar: 'تم رفض الوصول للكاميرا. الرجاء السماح بالأذونات.', ku: 'دەستگەیشتن بە کامێرا ڕەتکرایەوە. تکایە ڕێگەی پێبدە.' },
  pointCamera: { en: 'Point your camera at a barcode to scan it', ar: 'وجّه الكاميرا نحو الباركود لمسحه', ku: 'کامێراکەت ڕووەو بارکۆد بکە بۆ سکانکردنی' },



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
