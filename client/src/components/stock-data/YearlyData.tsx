import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuarterlyData from './QuarterlyData';
import { type StockDataResponse } from '@shared/schema';

interface YearlyDataProps {
  data: StockDataResponse;
}

export default function YearlyData({ data }: YearlyDataProps) {
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quarterlyData.map((quarter, qIndex) => (
                  <QuarterlyData
                    key={qIndex}
                    quarter={Object.keys(quarter)[0]}
                    data={quarter[Object.keys(quarter)[0]]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
