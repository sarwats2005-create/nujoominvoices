import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface Currency {
  symbol: string;
  name: string;
  code: string;
}

export const currencies: Currency[] = [
  { symbol: '$', name: 'US Dollar', code: 'USD' },
  { symbol: '€', name: 'Euro', code: 'EUR' },
  { symbol: '£', name: 'British Pound', code: 'GBP' },
  { symbol: 'د.ع', name: 'Iraqi Dinar', code: 'IQD' },
  { symbol: '₺', name: 'Turkish Lira', code: 'TRY' },
  { symbol: '﷼', name: 'Saudi Riyal', code: 'SAR' },
  { symbol: 'د.إ', name: 'UAE Dirham', code: 'AED' },
];

interface SettingsContextType {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  contactInfo: ContactInfo;
  setContactInfo: (info: ContactInfo) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOGO_KEY = 'invoice_app_logo';
const THEME_KEY = 'invoice_app_theme';
const CONTACT_INFO_KEY = 'invoice_app_contact_info';
const CURRENCY_KEY = 'invoice_app_currency';

const defaultContactInfo: ContactInfo = {
  email: 'support@nujoom.com',
  phone: '+964 750 123 4567',
  address: 'Baghdad, Iraq',
};

const defaultCurrency: Currency = currencies[0]; // USD

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logo, setLogoState] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [contactInfo, setContactInfoState] = useState<ContactInfo>(defaultContactInfo);
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedContactInfo = localStorage.getItem(CONTACT_INFO_KEY);
    const savedCurrency = localStorage.getItem(CURRENCY_KEY);
    
    if (savedLogo) {
      setLogoState(savedLogo);
    }
    
    // Default to dark mode
    const prefersDark = savedTheme === null ? true : savedTheme === 'dark';
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    if (savedContactInfo) {
      setContactInfoState(JSON.parse(savedContactInfo));
    }

    if (savedCurrency) {
      setCurrencyState(JSON.parse(savedCurrency));
    }
  }, []);

  const setLogo = (newLogo: string | null) => {
    setLogoState(newLogo);
    if (newLogo) {
      localStorage.setItem(LOGO_KEY, newLogo);
    } else {
      localStorage.removeItem(LOGO_KEY);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const setContactInfo = (info: ContactInfo) => {
    setContactInfoState(info);
    localStorage.setItem(CONTACT_INFO_KEY, JSON.stringify(info));
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem(CURRENCY_KEY, JSON.stringify(curr));
  };

  return (
    <SettingsContext.Provider value={{ logo, setLogo, isDarkMode, toggleDarkMode, contactInfo, setContactInfo, currency, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};