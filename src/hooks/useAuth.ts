import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const navigate = useNavigate();

  // Telegram Mini App'ten gelen verileri parse et
  const parseTelegramInitData = () => {
    try {
      // Telegram WebApp'ten init_data al
      if (window.Telegram && window.Telegram.WebApp) {
        const initData = window.Telegram.WebApp.initData;
        if (initData) {
          const searchParams = new URLSearchParams(initData);
          const userStr = searchParams.get('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            return {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              photo_url: user.photo_url,
              auth_date: parseInt(searchParams.get('auth_date') || '0'),
              hash: searchParams.get('hash') || ''
            };
          }
        }
      }
      
      // URL'den init_data parametresini al (web için)
      const urlParams = new URLSearchParams(window.location.search);
      const initDataFromUrl = urlParams.get('initData') || urlParams.get('tgWebAppData');
      
      if (initDataFromUrl) {
        const searchParams = new URLSearchParams(initDataFromUrl);
        const userStr = searchParams.get('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
            auth_date: parseInt(searchParams.get('auth_date') || '0'),
            hash: searchParams.get('hash') || ''
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing Telegram init data:', error);
      return null;
    }
  };

  // Telegram kullanıcısını doğrula
  const validateTelegramUser = async (telegramUser: TelegramUser) => {
    try {
      const response = await fetch('/api/validate-telegram-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(telegramUser)
      });

      if (!response.ok) {
        throw new Error(`Validation failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.valid) {
        // Kullanıcı bilgilerini ve login hash'i sakla
        sessionStorage.setItem('telegramId', telegramUser.id.toString());
        sessionStorage.setItem('loginHash', data.login_hash);
        sessionStorage.setItem('username', telegramUser.username || telegramUser.first_name);
        
        // Admin kontrolü yap
        const adminResponse = await fetch('/api/check-admin', {
          headers: {
            'X-Telegram-ID': telegramUser.id.toString(),
            'X-Login-Hash': data.login_hash
          }
        });
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          if (adminData.isAdmin) {
            sessionStorage.setItem('isAdmin', 'true');
          }
        }
        
        return true;
      } else {
        console.error('Telegram authentication failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error validating Telegram user:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Önceden oturum açılmış mı kontrol et
      const storedTelegramId = sessionStorage.getItem('telegramId');
      const storedLoginHash = sessionStorage.getItem('loginHash');
      
      if (storedTelegramId && storedLoginHash) {
        setIsAuthenticated(true);
      } else {
        // Telegram verilerini parse et
        const telegramUser = parseTelegramInitData();
        
        if (telegramUser) {
          // Telegram kullanıcısını doğrula
          const isValid = await validateTelegramUser(telegramUser);
          setIsAuthenticated(isValid);
          setUser(telegramUser);
        } else {
          setIsAuthenticated(false);
          // Eğer Telegram verisi yoksa ve admin login sayfasında değilsek, login sayfasına yönlendir
          if (!window.location.pathname.includes('/adminlogin') && !window.location.pathname.includes('/login')) {
            navigate('/login');
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  return { isAuthenticated, isLoading, user };
};
