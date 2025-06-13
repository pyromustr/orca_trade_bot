import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LangContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState('tr'); // Default language is Turkish

  const translations: Record<string, Record<string, string>> = {
    tr: {
      // Turkish translations
      'Açık İşlemler': 'Açık İşlemler',
      'Devam eden işlemleriniz': 'Devam eden işlemleriniz',
      'Açık işlem bulunmuyor': 'Açık işlem bulunmuyor',
      'Son İşlemler': 'Son İşlemler',
      'Son işlemleriniz': 'Son işlemleriniz',
      'İşlem bulunmuyor': 'İşlem bulunmuyor'
    },
    en: {
      // English translations
      'Açık İşlemler': 'Open Trades',
      'Devam eden işlemleriniz': 'Your ongoing trades',
      'Açık işlem bulunmuyor': 'No open trades',
      'Son İşlemler': 'Recent Trades',
      'Son işlemleriniz': 'Your recent trades',
      'İşlem bulunmuyor': 'No trades found'
    }
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useT = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useT must be used within a LangProvider');
  }
  return context.t;
};
