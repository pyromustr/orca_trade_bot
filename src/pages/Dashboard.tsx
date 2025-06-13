import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  BarChart3,
  KeyRound
} from "lucide-react";
import { getUserByTelegramId, getApiKeys } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Import the newly created components
import StatCard from "./dashboard/StatCard";
import TradesList from "./dashboard/TradesList";
import AllTradesList from "./dashboard/AllTradesList";

interface Trade {
  id: number;
  user_id: number;
  api_id: number;
  signal_id: number;
  lotsize: number;
  levelage: number;
  strateji: string;
  ticket: string;
  symbol: string;
  trend: string;
  open: number;
  opentime: string;
  volume: number;
  closed_volume: number;
  sl: number;
  tp: number;
  close: number;
  closetime: string;
  profit: number;
  profit_usdt?: number; // Sunucudan gelen USDT cinsinden kâr/zarar
  event: string;
  status: number;
  sticket: string;
  tticket: string;
  sl_wait: number;
  tp_wait: number;
  api_name?: string; // Borsa ismi
}

interface ApiKey {
  id: number;
  user_id: number;
  api_name: string;
  api_key: string;
  api_secret: string;
}

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiCount, setApiCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  useEffect(() => {
    const fetchUser = async () => {
      const telegramId = sessionStorage.getItem('telegramId');
      if (telegramId) {
        try {
          const user = await getUserByTelegramId(telegramId);
          setUsername(user.username);
          
          // Önce API anahtarlarını çek
          const apiKeysData = await fetchApiKeys(user.id);
          
          // Sonra işlemleri çek ve API isimlerini ekle
          await fetchTrades(user.id, apiKeysData);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    fetchUser();
    
    // Her 15 saniyede bir açık işlemleri güncelle
    const updateInterval = setInterval(() => {
      const telegramId = sessionStorage.getItem('telegramId');
      if (telegramId && openTrades.length > 0) {
        // Açık işlemleri tekrar çek
        getUserByTelegramId(telegramId)
          .then(user => refreshOpenTrades(user.id))
          .catch(error => console.error('Error refreshing trades:', error));
      }
    }, 15000);
    
    return () => clearInterval(updateInterval);
  }, [openTrades.length]);

  // Sadece açık işlemleri yenile
  const refreshOpenTrades = async (userId: number) => {
    try {
      const response = await fetch(`/api/trades/open?userId=${userId}`);
      if (!response.ok) throw new Error('Açık işlemler yenilenirken hata oluştu');
      const data = await response.json();
      
      // API isimlerini ekle
      const tradesWithApiNames = addApiNamesToTrades(data, apiKeys);
      
      setOpenTrades(tradesWithApiNames);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing open trades:', error);
    }
  };

  const fetchApiKeys = async (userId: number): Promise<ApiKey[]> => {
    try {
      const response = await fetch(`/api/keys?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('API keys getirilemedi');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setApiKeys(data);
        setApiCount(data.length);
        return data;
      } else {
        console.error('API keys verisi dizi değil:', data);
        setApiCount(0);
        return [];
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setApiCount(0);
      return [];
    }
  };

  // İşlemlere API isimlerini ekle
  const addApiNamesToTrades = (trades: Trade[], apiKeys: ApiKey[]): Trade[] => {
    return trades.map(trade => {
      const apiKey = apiKeys.find(key => key.id === trade.api_id);
      return {
        ...trade,
        api_name: apiKey ? apiKey.api_name : 'Bilinmeyen'
      };
    });
  };

  const fetchTrades = async (userId: number, apiKeysData: ApiKey[]) => {
    try {
      setLoading(true);
      
      // Açık işlemleri çek (artık sunucu tarafında kâr hesaplanıyor)
      const openResponse = await fetch(`/api/trades/open?userId=${userId}`);
      if (!openResponse.ok) throw new Error('Açık işlemler getirilemedi');
      const openData = await openResponse.json();
      
      // API isimlerini ekle
      const openTradesWithApiNames = addApiNamesToTrades(openData, apiKeysData);
      setOpenTrades(openTradesWithApiNames);
      
      setLastUpdated(new Date());

      // Tüm işlemleri çek
      const allResponse = await fetch(`/api/trades/all?userId=${userId}`);
      if (!allResponse.ok) throw new Error('Tüm işlemler getirilemedi');
      const allData = await allResponse.json();
      
      // API isimlerini ekle
      const allTradesWithApiNames = addApiNamesToTrades(allData, apiKeysData);
      setAllTrades(allTradesWithApiNames);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate summary statistics
  const activeTrades = openTrades.length;
  const totalPnl = allTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const totalTrades = allTrades.length;
  const averagePnl = totalTrades > 0 ? totalPnl / totalTrades : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kontrol Paneli</h1>
          {username && (
            <p className="text-sm text-muted-foreground mt-1">
              Hoş geldin, @{username}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
        </div>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
        <StatCard
          title="Açık İşlemler"
          value={activeTrades}
          label={`${activeTrades} adet işlem devam ediyor`}
          icon={<BarChart3 size={16} className="text-primary" />}
        />

        <StatCard
          title="Performans"
          value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} USDT`}
          label={`${totalTrades} işlem / ${averagePnl >= 0 ? '+' : ''}${averagePnl.toFixed(2)} USDT`}
          valueClassName={totalPnl >= 0 ? 'text-signal-success' : 'text-signal-danger'}
          icon={totalPnl >= 0 ? (
            <ArrowUp size={16} className="text-signal-success" />
          ) : (
            <ArrowDown size={16} className="text-signal-danger" />
          )}
        />

        {apiCount > 0 ? (
          <StatCard
            title="API Durumu"
            value={`${apiCount}`}
            label={`${apiCount} adet borsa hesabı bağlı`}
            icon={
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-success"></span>
                </span>
                <span className="text-xs">Aktif</span>
              </div>
            }
          />
        ) : (
          <Link to="/api-keys" className="block">
            <Card className="cursor-pointer hover:bg-muted/5 border-dashed">
              <CardContent className="p-6">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <KeyRound size={18} />
                    <span className="font-medium">API Anahtarı Ekle</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Henüz API anahtarınız yok. Borsa hesabınızı bağlamak için tıklayın.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
      
      {/* Açık İşlemler */}
      <div className="grid grid-cols-1 gap-2 p-4">
        <TradesList trades={openTrades} loading={loading} className="text-sm" limit={5} />
      </div>

      {/* Kapanan İşlemler */}
      <div className="grid grid-cols-1 gap-2 p-4">
        <AllTradesList trades={allTrades} loading={loading} className="text-sm" limit={5} />
      </div>
    </div>
  );
};

export default Dashboard;