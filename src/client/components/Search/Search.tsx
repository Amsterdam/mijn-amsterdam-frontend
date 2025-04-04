import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Button,
  Heading,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { SearchIcon } from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';
import { useLocation, useNavigate } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';

import { SearchEntry, displayPath } from './search-config';
import styles from './Search.module.scss';
import { useSearchIndex, useSearchResults, useSearchTerm } from './useSearch';
import { AppRoutes } from '../../../universal/config/routes';
import {
  trackSearch,
  trackSearchResultClick,
} from '../../hooks/analytics.hook';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateReady } from '../../hooks/useAppState';
import { useKeyDown } from '../../hooks/useKey';
import {
  useProfileTypeSwitch,
  useProfileTypeValue,
} from '../../hooks/useProfileType';
import { MaButtonLink, MaLink, MaRouterLink } from '../MaLink/MaLink';
import { Spinner } from '../Spinner/Spinner';

interface ResultSetProps {
  results: SearchEntry[];
  totalAmountOfResults: number;
  title?: string;
  noResultsMessage?: string;
  isLoading?: boolean;
  term: string;
  extendedResults?: boolean;
  onClickResult?: (
    result: SearchEntry,
    resultNumber: number,
    amountOfResults: number,
    amountOfResultsShown: number
  ) => void;
}

export function ResultSet({
  results,
  totalAmountOfResults,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  term,
  extendedResults = false,
  onClickResult: onClickResultCallback,
}: ResultSetProps) {
  const onClickResult = useCallback(
    (
      result: SearchEntry,
      resultNumber: number,
      amountOfResultsShown: number
    ) => {
      onClickResultCallback?.(
        result,
        resultNumber,
        totalAmountOfResults,
        amountOfResultsShown
      );
    },
    [onClickResultCallback, totalAmountOfResults]
  );

  return (
    <div className={styles.ResultSet}>
      {!!title && (
        <Heading size="level-3" level={3} className="ams-mb--sm">
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
                onClick={(event) => {
                  event.preventDefault();
                  onClickResult(result, index + 1, results.length);
                }}
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
  extendedAMResults?: boolean;
  replaceResultUrl?: (result: SearchEntry) => boolean;
  className?: string;
}

const MAX_RESULT_COUNT_DISPLAY = 10;

export function Search({
  onFinish: onFinishCallback,
  term: termInitial = '',
  maxResultCountDisplay = MAX_RESULT_COUNT_DISPLAY,
  autoFocus = true,
  typeAhead = true,
  extendedAMResults = false,
  className,
  replaceResultUrl,
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

  const location = useLocation();
  const navigate = useNavigate();
  const profileType = useProfileTypeValue();
  const isPhoneScreen = usePhoneScreen();
  const searchCategory = location.pathname.includes(AppRoutes.SEARCH)
    ? 'Zoekpagina'
    : 'Zoekbalk';
  const isAppStateReady = useAppStateReady();

  const onFinish = useCallback(
    (reason: string) => {
      onFinishCallback?.(reason);
    },
    [onFinishCallback]
  );

  useProfileTypeSwitch(() => onFinish('Profiel toggle'));

  const SEARCH_INPUT_DELAY_MS = 2000;
  const trackSearchDebounced = useDebouncedCallback(
    (term: string, count: number) => {
      if (term) {
        trackSearch(term, count, searchCategory, profileType);
      }
    },
    SEARCH_INPUT_DELAY_MS
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

  const onClickResult = useCallback(
    (
      result: SearchEntry,
      resultNumber: number,
      amountOfResults: number,
      amountOfResultsShown: number
    ) => {
      trackSearchResultClick({
        keyword: term,
        searchResult: {
          position: resultNumber,
          title:
            typeof result.displayTitle !== 'string'
              ? result.description
              : result.displayTitle,
          type: '',
          url: result.url,
        },
        amountOfResults,
        amountOfResultsShown,
        type: 'autocomplete',
      });
      setResultsVisible(false);
      onFinish('Click result');

      if (result.url.startsWith('http')) {
        window.location.href = result.url;
        return;
      }
      navigate(result.url, { replace: !!replaceResultUrl?.(result) });
    },
    [replaceResultUrl, setResultsVisible, onFinish, term]
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
    const checkIfClickedOutside = (e: any) => {
      if (
        typeAhead &&
        isResultsVisible &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target)
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
        !typeAhead && styles['in-page'],
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
                `${AppRoutes.SEARCH}?${new URLSearchParams(`term=${term}`)}`
              );
              setResultsVisible(true);
              trackSearch(term, 0, searchCategory, profileType);
            }
          }}
        >
          <input
            ref={searchBarRef}
            className={styles.Input}
            autoComplete="none"
            autoCorrect="none"
            autoCapitalize="none"
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
              trackSearchDebounced(term, 0);
            }}
          />

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
              totalAmountOfResults={results?.ma?.length || 0}
              noResultsMessage="Niets gevonden op Mijn Amsterdam"
              onClickResult={onClickResult}
            />

            <ResultSet
              term={term}
              isLoading={results?.am?.state === 'loading' || isTyping}
              title="Overige informatie op Amsterdam.nl"
              noResultsMessage="Niets gevonden op Amsterdam.nl"
              extendedResults={extendedAMResults}
              onClickResult={onClickResult}
              results={
                results.am?.state === 'hasValue' && results.am.contents !== null
                  ? results.am.contents.slice(0, maxResultCountDisplay / 2)
                  : []
              }
              totalAmountOfResults={
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
