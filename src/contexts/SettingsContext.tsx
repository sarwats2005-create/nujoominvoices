import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

interface SettingsContextType {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  contactInfo: ContactInfo;
  setContactInfo: (info: ContactInfo) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOGO_KEY = 'invoice_app_logo';
const THEME_KEY = 'invoice_app_theme';
const CONTACT_INFO_KEY = 'invoice_app_contact_info';

const defaultContactInfo: ContactInfo = {
  email: 'support@nujoom.com',
  phone: '+964 750 123 4567',
  address: 'Baghdad, Iraq',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logo, setLogoState] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [contactInfo, setContactInfoState] = useState<ContactInfo>(defaultContactInfo);

  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedContactInfo = localStorage.getItem(CONTACT_INFO_KEY);
    
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

  return (
    <SettingsContext.Provider value={{ logo, setLogo, isDarkMode, toggleDarkMode, contactInfo, setContactInfo }}>
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