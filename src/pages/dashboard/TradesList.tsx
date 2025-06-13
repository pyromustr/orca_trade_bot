import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useT } from '@/utils/locales';
import { useToast } from "@/components/ui/use-toast";

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
  profit_usdt?: number;
  event: string;
  status: number;
  sticket: string;
  tticket: string;
  sl_wait: number;
  tp_wait: number;
  api_name?: string; // Borsa ismi
}

interface TradesListProps {
  trades: Trade[];
  loading: boolean;
  limit?: number;
  className?: string;
}

const TradesList: React.FC<TradesListProps> = ({ trades, loading, limit = 5, className }) => {
  const t = useT();
  const [expandedTrade, setExpandedTrade] = useState<string | number | null>(null);
  const [closingTrade, setClosingTrade] = useState<number | null>(null);
  const { toast } = useToast();

  const formatPrice = (price: any) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(4) : '0.0000';
  };

  const formatDate = (date: any) => {
    try {
      return new Date(date).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // İşlemi kapat
  const handleClosePosition = async (tradeId: number) => {
    try {
      setClosingTrade(tradeId);
      
      const response = await fetch(`/api/trades/close/${tradeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('İşlem kapatılamadı');
      }
      
      toast({
        title: "İşlem kapatıldı",
        description: "İşlem başarıyla kapatıldı. Sonuçlar birkaç saniye içinde güncellenecek.",
      });
      
      // 3 saniye sonra sayfayı yenile (veya ana bileşenden veriyi yeniden çek)
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      console.error('İşlem kapatma hatası:', error);
      toast({
        title: "Hata",
        description: "İşlem kapatılırken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setClosingTrade(null);
    }
  };

  // Sadece açık işlemleri filtrele (status = 1) ve limitli sayıda göster
  const openTrades = trades.filter(trade => trade.status === 1).slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="p-1">
        <CardTitle className="text-sm">{t('Açık İşlemler')}</CardTitle>
        <CardDescription className="text-xs">{t('Devam eden işlemleriniz')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Borsa</TableHead>
              <TableHead className="text-xs">Sembol</TableHead>
              <TableHead className="text-xs">Yön</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Açılış Fiyatı</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Kâr</TableHead>
              <TableHead className="w-[32px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs">
                  {t('Açık işlem bulunmuyor')}
                </TableCell>
              </TableRow>
            ) : (
              openTrades.map((trade) => (
                <React.Fragment key={trade.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                  >
                    <TableCell className="text-xs font-medium">{trade.api_name || "Bilinmiyor"}</TableCell>
                    <TableCell className="text-xs font-medium">{trade.symbol}</TableCell>
                    <TableCell className="text-xs">
                      {trade.trend === 'LONG' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-signal-success/10 text-signal-success">
                          LONG
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-signal-danger/10 text-signal-danger">
                          SHORT
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{formatPrice(trade.open)}</TableCell>
                    <TableCell className={`text-xs hidden md:table-cell ${trade.profit > 0 ? 'text-signal-success' : trade.profit < 0 ? 'text-signal-danger' : ''}`}>
                      {trade.profit ? (
                        <>
                          {`${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}%`}
                          {trade.profit_usdt && (
                            <div className="text-xs opacity-75">
                              {`${trade.profit_usdt > 0 ? '+' : ''}${trade.profit_usdt.toFixed(2)} USDT`}
                            </div>
                          )}
                        </>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedTrade === trade.id ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </TableCell>
                  </TableRow>
                  {expandedTrade === trade.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-2 bg-muted/5">
                        <div className="text-xs space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div><strong>Borsa:</strong> {trade.api_name || "Bilinmiyor"}</div>
                              <div><strong>Sembol:</strong> {trade.symbol}</div>
                              <div><strong>Yön:</strong> {trade.trend}</div>
                              <div><strong>Açılış Fiyatı:</strong> {formatPrice(trade.open)}</div>
                              <div><strong>Açılış Tarihi:</strong> {formatDate(trade.opentime)}</div>
                            </div>
                            <div>
                              <div><strong>Kâr/Zarar:</strong> <span className={`${trade.profit > 0 ? 'text-signal-success' : trade.profit < 0 ? 'text-signal-danger' : ''}`}>
                                {trade.profit ? `${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}%` : '-'}
                              </span></div>
                              {trade.profit_usdt && (
                                <div><strong>Kâr/Zarar (USDT):</strong> <span className={`${trade.profit_usdt > 0 ? 'text-signal-success' : trade.profit_usdt < 0 ? 'text-signal-danger' : ''}`}>
                                  {`${trade.profit_usdt > 0 ? '+' : ''}${trade.profit_usdt.toFixed(2)} USDT`}
                                </span></div>
                              )}
                              <div><strong>Miktar:</strong> {trade.volume}</div>
                              <div><strong>SL:</strong> {formatPrice(trade.sl)}</div>
                              <div><strong>TP:</strong> {formatPrice(trade.tp)}</div>
                            </div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="text-xs h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClosePosition(trade.id);
                              }}
                              disabled={closingTrade === trade.id}
                            >
                              {closingTrade === trade.id ? "Kapatılıyor..." : "İşlemi Kapat"}
                              {closingTrade !== trade.id && <X className="ml-1 h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TradesList;