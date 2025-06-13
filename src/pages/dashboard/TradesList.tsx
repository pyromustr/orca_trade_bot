import React from 'react';
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
  profit_usdt?: number;
  event: string;
  status: number;
  sticket: string;
  tticket: string;
  sl_wait: number;
  tp_wait: number;
}

interface TradesListProps {
  trades: Trade[];
  loading: boolean;
  limit?: number;
  className?: string;
}

const TradesList: React.FC<TradesListProps> = ({ trades, loading, limit = 5, className }) => {
  const t = useT();
  const [expandedTrade, setExpandedTrade] = React.useState<string | number | null>(null);

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
              <TableHead className="text-xs">Sembol</TableHead>
              <TableHead className="text-xs">Yön</TableHead>
              <TableHead className="text-xs">Açılış Fiyatı</TableHead>
              <TableHead className="text-xs">Açılış Zamanı</TableHead>
              <TableHead className="text-xs">Kâr</TableHead>
              <TableHead className="w-[32px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs">
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
                    <TableCell className="text-xs">{formatPrice(trade.open)}</TableCell>
                    <TableCell className="text-xs">{formatDate(trade.opentime)}</TableCell>
                    <TableCell className={`text-xs ${trade.profit > 0 ? 'text-signal-success' : trade.profit < 0 ? 'text-signal-danger' : ''}`}>
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
                      <TableCell colSpan={5} className="p-1 bg-muted/5">
                        <div className="text-xs space-y-2">
                          <div><strong>Ticket:</strong> {trade.ticket}</div>
                          <div><strong>Miktar:</strong> {trade.volume}</div>
                          <div><strong>SL:</strong> {formatPrice(trade.sl)}</div>
                          <div><strong>TP:</strong> {formatPrice(trade.tp)}</div>
                          <div><strong>Durum:</strong> {trade.status === 0 ? 'Beklemede' : 'Açık'}</div>
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
