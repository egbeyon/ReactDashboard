import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuarterlyData from './QuarterlyData';
import { type StockDataResponse } from '@shared/schema';

interface YearlyDataProps {
  data: StockDataResponse;
  viewType: 'yearly' | 'quarterly';
}

export default function YearlyData({ data, viewType }: YearlyDataProps) {
  const calculateYearlyMetrics = (yearData: any) => {
    const year = Object.keys(yearData)[0];
    const quarterlyData = yearData[year][0].Quarterly;

    const returns = quarterlyData.map((q: any) => {
      const quarter = Object.keys(q)[0];
      return q[quarter].return;
    });

    const volatilities = quarterlyData.map((q: any) => {
      const quarter = Object.keys(q)[0];
      return q[quarter].volatility;
    });

    return {
      return: (returns.reduce((a: number, b: number) => a + b, 0) / returns.length).toFixed(2),
      volatility: (volatilities.reduce((a: number, b: number) => a + b, 0) / volatilities.length).toFixed(2)
    };
  };

  return (
    <div className="space-y-6">
      {data.Years.map((yearData, index) => {
        const year = Object.keys(yearData)[0];
        const quarterlyData = yearData[year][0].Quarterly;

        return (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">{year}</CardTitle>
            </CardHeader>
            <CardContent>
              {viewType === 'yearly' ? (
                <div className="grid grid-cols-1 gap-4">
                  <QuarterlyData
                    quarter={year}
                    data={calculateYearlyMetrics(yearData)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quarterlyData.map((quarter, qIndex) => (
                    <QuarterlyData
                      key={qIndex}
                      quarter={Object.keys(quarter)[0]}
                      data={quarter[Object.keys(quarter)[0]]}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}