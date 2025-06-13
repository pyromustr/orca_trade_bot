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
import { useT } from '@/utils/locales';

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
  event: string;
  status: number;
  sticket: string;
  tticket: string;
  sl_wait: number;
  tp_wait: number;
  api_name?: string; // Borsa ismi
}

interface AllTradesListProps {
  trades: Trade[];
  loading: boolean;
  limit?: number;
  className?: string;
}

const AllTradesList: React.FC<AllTradesListProps> = ({ trades, loading, limit = 5, className }) => {
  const t = useT();
  const [expandedTrade, setExpandedTrade] = useState<string | number | null>(null);

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

  // Tüm işlemleri göster (status = 0 olanlar dahil) ve limitli sayıda göster
  const allTrades = trades.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="p-1">
        <CardTitle className="text-sm">{t('Son İşlemler')}</CardTitle>
        <CardDescription className="text-xs">{t('Son işlemleriniz')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Borsa</TableHead>
              <TableHead className="text-xs">Sembol</TableHead>
              <TableHead className="text-xs">Yön</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Açılış/Kapanış</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Kâr</TableHead>
              <TableHead className="w-[32px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs">
                  {t('İşlem bulunmuyor')}
                </TableCell>
              </TableRow>
            ) : (
              allTrades.map((trade) => (
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
                    <TableCell className="text-xs hidden md:table-cell">{formatPrice(trade.open)}/{formatPrice(trade.close)}</TableCell>
                    <TableCell className={`text-xs hidden md:table-cell ${trade.profit > 0 ? 'text-signal-success' : trade.profit < 0 ? 'text-signal-danger' : ''}`}>
                      {trade.profit ? `${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}%` : '-'}
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
                              <div><strong>Kapanış Fiyatı:</strong> {formatPrice(trade.close)}</div>
                              <div><strong>Kapanış Tarihi:</strong> {formatDate(trade.closetime)}</div>
                              <div><strong>Kâr/Zarar:</strong> <span className={`${trade.profit > 0 ? 'text-signal-success' : trade.profit < 0 ? 'text-signal-danger' : ''}`}>
                                {trade.profit ? `${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}%` : '-'}
                              </span></div>
                              <div><strong>Miktar:</strong> {trade.volume}</div>
                              <div><strong>Durum:</strong> {trade.status === 0 ? 'Kapalı' : 'Açık'}</div>
                            </div>
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

export default AllTradesList;