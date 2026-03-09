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

export interface BLPresets {
  banks: string[];
  owners: string[];
  usedFor: string[];
  beneficiaries: string[];
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
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  blPresets: BLPresets;
  setBLPresets: (presets: BLPresets) => void;
  addBLPreset: (key: keyof BLPresets, value: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOGO_KEY = 'invoice_app_logo';
const THEME_KEY = 'invoice_app_theme';
const CONTACT_INFO_KEY = 'invoice_app_contact_info';
const CURRENCY_KEY = 'invoice_app_currency';
const SOUND_VOLUME_KEY = 'invoice_app_sound_volume';
const BL_PRESETS_KEY = 'invoice_app_bl_presets';

const defaultBLPresets: BLPresets = {
  banks: ['MBI', 'ADIB', 'TBI', 'BGHD', 'ECONOMY'],
  owners: ['DASHTY', 'WAAD', 'BAZIRGANI DRWST', 'KARZAN'],
  usedFor: ['SUIZI', 'JIEREN', 'ASNA'],
};

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
  const [soundVolume, setSoundVolumeState] = useState<number>(0.5);
  const [blPresets, setBLPresetsState] = useState<BLPresets>(defaultBLPresets);

  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedContactInfo = localStorage.getItem(CONTACT_INFO_KEY);
    const savedCurrency = localStorage.getItem(CURRENCY_KEY);
    const savedSoundVolume = localStorage.getItem(SOUND_VOLUME_KEY);
    const savedBLPresets = localStorage.getItem(BL_PRESETS_KEY);
    
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

    if (savedSoundVolume !== null) {
      setSoundVolumeState(parseFloat(savedSoundVolume));
    }

    if (savedBLPresets) {
      setBLPresetsState(JSON.parse(savedBLPresets));
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

  const setSoundVolume = (volume: number) => {
    setSoundVolumeState(volume);
    localStorage.setItem(SOUND_VOLUME_KEY, volume.toString());
  };

  const setBLPresets = (presets: BLPresets) => {
    setBLPresetsState(presets);
    localStorage.setItem(BL_PRESETS_KEY, JSON.stringify(presets));
  };

  return (
    <SettingsContext.Provider value={{ logo, setLogo, isDarkMode, toggleDarkMode, contactInfo, setContactInfo, currency, setCurrency, soundVolume, setSoundVolume, blPresets, setBLPresets }}>
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