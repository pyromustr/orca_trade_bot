import { useContext } from 'react';
import { LangContext } from '@/hooks/useLang';

export const useT = () => {
  const context = useContext(LangContext);
  if (!context) {
    // Eğer context yoksa, basit bir fallback fonksiyonu döndür
    return (key: string) => key;
  }
  return context.t;
};
