import { useCallback } from 'react';

import { routeConfig as buurtRouteConfig } from '../MyArea/MyArea-thema-config';
import { Search } from '../Search/Search';
import { SearchEntry } from '../Search/search-config';

type SearchBarProps = {
  onFinish: () => void;
  className?: string;
};

export function SearchBar({ onFinish, className }: SearchBarProps) {
  const replaceResultUrl = useCallback((result: SearchEntry) => {
    return result.url.startsWith(buurtRouteConfig.themaPage.path);
  }, []);

  return (
    <Search
      className={className}
      onFinish={onFinish}
      replaceResultUrl={replaceResultUrl}
    />
  );
}
