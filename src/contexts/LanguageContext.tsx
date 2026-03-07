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
