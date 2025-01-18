import { useCallback } from 'react';

import { AppRoutes } from '../../../universal/config/routes';
import { Search } from '../Search/Search';
import { SearchEntry } from '../Search/search-config';

type SearchBarProps = {
  onFinish: () => void;
  className?: string;
};

export function SearchBar({ onFinish, className }: SearchBarProps) {
  const replaceResultUrl = useCallback((result: SearchEntry) => {
    return result.url.startsWith(AppRoutes.BUURT);
  }, []);

  return (
    <Search
      className={className}
      onFinish={onFinish}
      replaceResultUrl={replaceResultUrl}
    />
  );
}
