import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (ticker: string) => void;
  initialTicker: string;
}

export default function SearchBar({ onSearch, initialTicker }: SearchBarProps) {
  const [value, setValue] = React.useState(initialTicker);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter stock ticker..."
        className="max-w-xs"
      />
      <Button type="submit">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
