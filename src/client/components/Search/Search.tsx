import SearchBar from '@amsterdam/asc-ui/lib/components/SearchBar/SearchBar';
import ThemeProvider from '@amsterdam/asc-ui/lib/theme/ThemeProvider';
import { useCallback, useEffect, useState } from 'react';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import {
  generateSearchIndexPageEntries,
  searchAmsterdamNL,
  useSearch,
} from './useSearch';
import { useAppStateGetter } from '../../hooks/useAppState';
import Linkd from '../Button/Button';
import styles from './Search.module.scss';
import Heading from '../Heading/Heading';

interface SearchProps {
  onClose?: () => void;
}

export function Search({ onClose }: SearchProps) {
  const fuse = useSearch();
  const [results, setResults] = useState<any[]>([]);
  const [resultsAmsterdamNL, setResultsAmsterdamNL] = useState<any[]>([]);
  const [resultsAmsterdamNLLoading, setResultsAmsterdamNLLoading] =
    useState(false);
  const [term, setTerm] = useState('');
  const { VERGUNNINGEN } = useAppStateGetter();

  useEffect(() => {
    if (VERGUNNINGEN.content?.length) {
      for (const entry of generateSearchIndexPageEntries(
        'VERGUNNINGEN',
        VERGUNNINGEN.content
      )) {
        fuse.current.add(entry);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VERGUNNINGEN.content]);

  const search = useDebouncedCallback((term: string) => {
    setResultsAmsterdamNLLoading(true);

    const fuseResults = fuse.current
      .search(term)
      .slice(0, 5)
      .map((result) => result.item);

    setResults(fuseResults);

    searchAmsterdamNL(term)
      .then(({ data }) => {
        console.log('swiftResults', data);
        setResultsAmsterdamNL(data);
        setResultsAmsterdamNLLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, 400);

  const clearSearch = useCallback(() => {
    setTerm('');
    setResults([]);
    setResultsAmsterdamNL([]);
    onClose && onClose();
  }, [setTerm, setResults, onClose]);

  useEffect(() => {
    if (term) {
      search(term);
    }
  }, [term, search]);

  return (
    <div className={styles.Search}>
      <div className={styles.SearchBar}>
        <div className={styles.SearchBarInner}>
          <ThemeProvider>
            <SearchBar
              autoFocus
              placeholder="Enter the search text"
              onChange={(e) => {
                setTerm(e.target.value);
              }}
              onClear={clearSearch}
              onSubmit={(e) => {}}
              value={term}
            />
            {!!term && !!results.length && (
              <div className={styles.Results}>
                <ul className={styles.ResultList}>
                  {results.map((result) => (
                    <li key={result.title}>
                      <Linkd onClick={clearSearch} href={result.url}>
                        {result.title}
                      </Linkd>
                      {/* <p>{result.item.description}</p> */}
                    </li>
                  ))}
                </ul>
                <Heading size="tiny">Resultaten van amsterdam.nl</Heading>
                {resultsAmsterdamNLLoading && <span>Zoeken...</span>}
                <ul className={styles.ResultList}>
                  {resultsAmsterdamNL.map((result) => (
                    <li key={result.title}>
                      <Linkd
                        onClick={clearSearch}
                        external={true}
                        href={result.url}
                      >
                        {result.title}
                      </Linkd>
                      {/* <p>{result.item.description}</p> */}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}
