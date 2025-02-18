import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface QuarterlyDataProps {
  quarter: string;
  data: {
    return: number;
    volatility: number;
    net_return?: number;
    net_market_return?: number;
  };
}

export default function QuarterlyData({ quarter, data }: QuarterlyDataProps) {
  const isPositiveReturn = data.return >= 0;
  const isPositiveNetReturn = data.net_return ? data.net_return >= 0 : false;
  const isPositiveMarketReturn = data.net_market_return ? data.net_market_return >= 0 : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{quarter}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Return:</span>
            <span className={`font-semibold flex items-center gap-1 ${
              isPositiveReturn ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveReturn ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {data.return.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Volatility:</span>
            <span className="font-semibold">{data.volatility.toFixed(2)}%</span>
          </div>

          {data.net_return !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Net Return:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                isPositiveNetReturn ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositiveNetReturn ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {data.net_return.toFixed(2)}%
              </span>
            </div>
          )}

          {data.net_market_return !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">vs Market:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                isPositiveMarketReturn ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositiveMarketReturn ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {data.net_market_return.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}