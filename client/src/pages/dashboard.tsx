import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchBar from '@/components/stock-data/SearchBar';
import YearlyData from '@/components/stock-data/YearlyData';
import { type StockDataResponse } from '@shared/schema';

type ViewType = 'yearly' | 'quarterly';

export default function Dashboard() {
  const [ticker, setTicker] = React.useState('AAPL');
  const [viewType, setViewType] = React.useState<ViewType>('quarterly');

  const { data, isLoading, error } = useQuery<StockDataResponse>({
    queryKey: [`/api/data/${ticker}`],
    enabled: !!ticker,
    retry: 1,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    staleTime: 15000 // Consider data stale after 15 seconds
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Financial Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <SearchBar onSearch={setTicker} initialTicker={ticker} />
            <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Yearly View</SelectItem>
                <SelectItem value="quarterly">Quarterly View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-8">
            <div className="text-destructive">Error loading data: {(error as Error).message}</div>
          </CardContent>
        </Card>
      )}

      {data && <YearlyData data={data} viewType={viewType} />}
    </div>
  );
}