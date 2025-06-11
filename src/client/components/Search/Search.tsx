import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Button,
  Heading,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { CloseIcon, SearchIcon } from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';
import { useNavigate } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';

import { SearchEntry, displayPath } from './search-config';
import styles from './Search.module.scss';
import { useSearchIndex, useSearchResults, useSearchTerm } from './useSearch';
import { useSmallScreen } from '../../hooks/media.hook';
import { useAppStateReady } from '../../hooks/useAppState';
import { useKeyDown } from '../../hooks/useKey';
import { SearchPageRoute } from '../../pages/Search/Search-routes';
import { MaButtonLink, MaLink, MaRouterLink } from '../MaLink/MaLink';
import { Spinner } from '../Spinner/Spinner';

interface ResultSetProps {
  results: SearchEntry[];
  totalResultsCount: number;
  title?: string;
  noResultsMessage?: string;
  isLoading?: boolean;
  term: string;
  extendedResults?: boolean;
  onClickResult?: (
    result: SearchEntry,
    resultNumber: number,
    resultCountVisible: number,
    totalResultsCount: number
  ) => void;
}

export function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  term,
  extendedResults = false,
  totalResultsCount,
  onClickResult,
}: ResultSetProps) {
  return (
    <div className={styles.ResultSet}>
      {!!title && (
        <Heading size="level-3" level={3} className="ams-mb-m">
          {title}
        </Heading>
      )}
      {isLoading && !results.length && (
        <Paragraph className={styles.ResultsPending}>
          <Spinner /> Zoeken...
        </Paragraph>
      )}
      {!!term && !results.length && !isLoading && (
        <Paragraph className={styles.NoResults}>{noResultsMessage}</Paragraph>
      )}
      <UnorderedList className={styles.ResultList} markers={false}>
        {results.map((result, index) => {
          const LinkComponent = result.url.startsWith('http')
            ? MaLink
            : MaRouterLink;
          return (
            <UnorderedList.Item key={result.url + index} className="Result">
              <LinkComponent
                maVariant="fatNoUnderline"
                href={result.url}
                onClick={() =>
                  onClickResult?.(
                    result,
                    index,
                    results.length,
                    totalResultsCount
                  )
                }
              >
                {typeof result.displayTitle === 'function'
                  ? result.displayTitle(term)
                  : typeof result.displayTitle === 'string'
                    ? displayPath(term, [result.displayTitle])
                    : result.displayTitle}
                {extendedResults && (
                  <Paragraph>
                    <span>{result.url}</span>
                    {result.description}
                  </Paragraph>
                )}
              </LinkComponent>
            </UnorderedList.Item>
          );
        })}
      </UnorderedList>
    </div>
  );
}

interface SearchProps {
  onFinish?: (reason?: string) => void;
  term?: string;
  maxResultCountDisplay?: number;
  autoFocus?: boolean;
  typeAhead?: boolean;
  inPage?: boolean;
  extendedAMResults?: boolean;
  className?: string;
}

const MAX_RESULT_COUNT_DISPLAY = 10;

export function Search({
  onFinish: onFinishCallback,
  term: termInitial = '',
  maxResultCountDisplay = MAX_RESULT_COUNT_DISPLAY,
  autoFocus = true,
  typeAhead = true,
  inPage = false,
  extendedAMResults = false,
  className,
}: SearchProps) {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [isResultsVisible, setResultsVisible] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [term, setTerm_] = useSearchTerm();

  useSearchIndex();

  const results = useSearchResults(extendedAMResults);

  const setTerm = useCallback(
    (term: string) => {
      if (!term && searchBarRef.current) {
        searchBarRef.current.value = '';
      }
      setTerm_(term);
    },
    [setTerm_]
  );

  const navigate = useNavigate();
  const isPhoneScreen = useSmallScreen();
  const isAppStateReady = useAppStateReady();

  const onFinish = useCallback(
    (reason: string) => {
      onFinishCallback?.(reason);
    },
    [onFinishCallback]
  );

  const SET_TERM_DELAY_MS = 300;
  const setTermDebounced = useDebouncedCallback((term: string) => {
    setTerm(term);
    setIsTyping(false);
    if (!term) {
      setResultsVisible(false);
    }
  }, SET_TERM_DELAY_MS);

  const keyHandler = useCallback(
    (event: KeyboardEvent) => {
      const isEscape = event.key === 'Escape';
      if (isEscape && typeAhead) {
        event.preventDefault();
        if (isResultsVisible && term) {
          searchBarRef.current?.focus();
          setResultsVisible(false);
        } else if (!isResultsVisible) {
          onFinish('Escape toets');
        }
      }
    },
    [typeAhead, isResultsVisible, onFinish, term]
  );

  useKeyDown(keyHandler);

  useEffect(() => {
    if (autoFocus) {
      // AutoFocus on the element doesn't seem to work properly with dynamic mounting
      searchBarRef.current?.focus();
    }
    if (termInitial && searchBarRef.current) {
      searchBarRef.current.value = termInitial;
    }

    return () => {
      onFinish('Unmount component');
    };
  }, []);

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (
        typeAhead &&
        !inPage &&
        isResultsVisible &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setResultsVisible(false);
      }
    };
    if (!isPhoneScreen) {
      document.addEventListener('mousedown', checkIfClickedOutside);
    }
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [isResultsVisible, isPhoneScreen, typeAhead]);

  useEffect(() => {
    if (termInitial) {
      setTerm(termInitial);
      setResultsVisible(true);
    } else {
      setTerm('');
    }
  }, []);

  return (
    <div
      className={classnames(
        styles.SearchBar,
        inPage && styles['in-page'],
        className
      )}
    >
      <div ref={resultsRef}>
        <form
          className={styles.Form}
          onSubmit={(e) => {
            e.preventDefault();
            if (term) {
              navigate(
                `${SearchPageRoute.route}?${new URLSearchParams(`term=${term}`)}`
              );
              setResultsVisible(true);
            }
          }}
        >
          <input
            ref={searchBarRef}
            name="searchinput"
            type="text"
            className={styles.Input}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder={
              isAppStateReady ? 'Zoeken naar...' : 'Zoeken voorbereiden...'
            }
            onClick={() => {
              if (term) {
                setResultsVisible(true);
              }
            }}
            onChange={(e) => {
              setIsTyping(true);
              setResultsVisible(true);
              const term = e.target.value;
              setTermDebounced(term);
            }}
          />

          {!!searchBarRef.current?.value && (
            <Button
              iconOnly
              variant="tertiary"
              className={styles.ClearButton}
              onClick={() => {
                setTerm('');
                setResultsVisible(false);
                searchBarRef.current?.focus();
              }}
              aria-label="Verwijder zoekopdracht"
              icon={CloseIcon}
              color="contrast"
            />
          )}
          <Button
            iconOnly
            className={styles.SubmitButton}
            aria-label="Verstuur zoekopdracht"
            type="submit"
            icon={SearchIcon}
          />
        </form>

        {isResultsVisible && (
          <div className={styles.Results}>
            <ResultSet
              term={term}
              isLoading={isTyping || !isAppStateReady}
              results={results?.ma?.slice(0, maxResultCountDisplay / 2) || []}
              totalResultsCount={results?.ma?.length || 0}
              noResultsMessage="Niets gevonden op Mijn Amsterdam"
              onClickResult={() => onFinish('Resultaat geklikt')}
            />

            <ResultSet
              term={term}
              isLoading={results?.am?.state === 'loading' || isTyping}
              title="Overige informatie op Amsterdam.nl"
              noResultsMessage="Niets gevonden op Amsterdam.nl"
              extendedResults={extendedAMResults}
              results={
                results.am?.state === 'hasValue' && results.am.contents !== null
                  ? results.am.contents.slice(0, maxResultCountDisplay / 2)
                  : []
              }
              totalResultsCount={
                results?.am?.state === 'hasValue' &&
                results.am.contents !== null
                  ? results.am.contents.length
                  : 0
              }
            />

            {extendedAMResults && (
              <Paragraph>
                <MaButtonLink
                  href={`https://www.amsterdam.nl/zoeken/?Zoe=${term}`}
                  rel="noopener noreferrer"
                >
                  Zoek verder op Amsterdam.nl
                </MaButtonLink>
              </Paragraph>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
