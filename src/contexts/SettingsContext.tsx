import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOGO_KEY = 'invoice_app_logo';
const THEME_KEY = 'invoice_app_theme';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logo, setLogoState] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (savedLogo) {
      setLogoState(savedLogo);
    }
    
    // Default to dark mode
    const prefersDark = savedTheme === null ? true : savedTheme === 'dark';
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
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

  return (
    <SettingsContext.Provider value={{ logo, setLogo, isDarkMode, toggleDarkMode }}>
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
