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
    market_return?: number;
    market_volatility?: number;
  };
}

export default function QuarterlyData({ quarter, data }: QuarterlyDataProps) {
  const isPositiveReturn = data.return >= 0;
  const isPositiveNetReturn = data.net_return ? data.net_return >= 0 : false;
  const isPositiveMarketReturn = data.net_market_return ? data.net_market_return >= 0 : false;
  const isOutperformingMarket = data.market_return ? data.return > data.market_return : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{quarter}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Stock Performance</h3>
              <div className="space-y-2">
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
              </div>
            </div>

            {data.market_return !== undefined && data.market_volatility !== undefined && (
              <div>
                <h3 className="text-sm font-medium mb-2">S&P 500</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Return:</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      data.market_return >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.market_return >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {data.market_return.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Volatility:</span>
                    <span className="font-semibold">{data.market_volatility.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="space-y-2">
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

              {data.market_return !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">vs Market:</span>
                  <span className={`font-semibold flex items-center gap-1 ${
                    isOutperformingMarket ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOutperformingMarket ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {(data.return - data.market_return).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}