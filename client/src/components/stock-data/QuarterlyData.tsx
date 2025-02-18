import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface QuarterlyDataProps {
  quarter: string;
  data: {
    return: number;
    volatility: number;
  };
}

export default function QuarterlyData({ quarter, data }: QuarterlyDataProps) {
  const isPositiveReturn = data.return >= 0;

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
            <span className="font-semibold">{(data.volatility * 100).toFixed(2)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
