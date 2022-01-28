import classnames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { AppRoutes } from '../../../universal/config';
import { IconSearch } from '../../assets/icons';
import { Colors } from '../../config/app';
import { useAppStateReady, usePhoneScreen } from '../../hooks';
import {
  trackEventWithProfileType,
  trackSearch,
} from '../../hooks/analytics.hook';
import { useKeyDown } from '../../hooks/useKey';
import {
  useProfileTypeSwitch,
  useProfileTypeValue,
} from '../../hooks/useProfileType';
import { Button, IconButton } from '../Button/Button';
import Heading from '../Heading/Heading';
import { Spinner } from '../Spinner/Spinner';
import styles from './Search.module.scss';
import { displayPath, SearchEntry } from './searchConfig';
import { useSearchIndex, useSearchResults, useSearchTerm } from './useSearch';

interface ResultSetProps {
  results: SearchEntry[];
  title?: string;
  noResultsMessage?: string;
  isLoading?: boolean;
  term: string;
  extendedResults?: boolean;
  showIcon?: boolean;
  onClickResult?: (result: SearchEntry) => void;
}

export function ResultSet({
  results,
  title,
  isLoading = false,
  noResultsMessage = 'Geen resultaten',
  term,
  extendedResults = false,
  showIcon = false,
  onClickResult: onClickResultCallback,
}: ResultSetProps) {
  const onClickResult = useCallback(
    (result: SearchEntry) => {
      onClickResultCallback?.(result);
    },
    [onClickResultCallback]
  );

  return (
    <div className={styles.ResultSet}>
      {!!title && (
        <Heading className={styles.ResultSetTitle} size="tiny">
          {title}
        </Heading>
      )}
      {isLoading && !results.length && (
        <p className={styles.ResultsPending}>
          <Spinner />
          Zoeken...
        </p>
      )}
      {!!term && !results.length && !isLoading && (
        <p className={styles.NoResults}>{noResultsMessage}</p>
      )}
      <ul className={styles.ResultList}>
        {results.map((result, index) => {
          return (
            <li
              key={result.url + index}
              className={classnames(
                styles.ResultListItem,
                extendedResults && styles['is-extended']
              )}
            >
              <a
                href={result.url}
                className={styles.ResultSetLink}
                onClick={(event) => {
                  event.preventDefault();
                  onClickResult(result);
                }}
              >
                {typeof result.displayTitle === 'function'
                  ? result.displayTitle(term)
                  : displayPath(term, [result.displayTitle])}
                {result.trailingIcon}
                {extendedResults && (
                  <p className={styles.ResultDescription}>
                    <span className={styles.ResultUrl}>{result.url}</span>
                    {result.description}
                  </p>
                )}
              </a>
            </li>
          );
        })}
      </ul>
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
}

export function Search({
  onFinish: onFinishCallback,
  term: termInitial = '',
  maxResultCountDisplay = 10,
  autoFocus = true,
  typeAhead = true,
  extendedAMResults = false,
  replaceResultUrl,
}: SearchProps) {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<any>(null);
  const results = useSearchResults(extendedAMResults);
  const [isResultsVisible, setResultsVisible] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [term, setTerm_] = useSearchTerm();
  useSearchIndex();

  const setTerm = useCallback(
    (term) => {
      if (!term && searchBarRef.current) {
        searchBarRef.current.value = '';
      }
      setTerm_(term);
    },
    [setTerm_]
  );

  const history = useHistory();
  const profileType = useProfileTypeValue();
  const isPhoneScreen = usePhoneScreen();
  const searchCategory = history.location.pathname.includes(AppRoutes.SEARCH)
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

  const trackSearchBarEvent = useCallback(
    (action: string) =>
      trackEventWithProfileType(
        {
          category: 'Zoeken',
          name: `${searchCategory} interactie`,
          action,
        },
        profileType
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profileType]
  );

  const trackSearchDebounced = useDebouncedCallback(
    (term: string, category: string = 'Keyword input (typing)') => {
      if (term) {
        trackSearch(term, category);
      } else {
        trackSearchBarEvent('Verwijder term');
      }
    },
    2000
  );

  const setTermDebounced = useDebouncedCallback((term: string) => {
    setTerm(term);
    setIsTyping(false);
    if (!term) {
      setResultsVisible(false);
    }
  }, 300);

  const keyHandler = useCallback(
    (event: KeyboardEvent) => {
      const isEscape = event.key === 'Escape';
      if (isEscape && typeAhead) {
        event.preventDefault();
        if (isResultsVisible && term) {
          searchBarRef.current?.focus();
          setResultsVisible(false);
          trackSearchBarEvent('Verberg typeAhead resultaten met Escape toets');
        } else if (!isResultsVisible) {
          onFinish('Escape toets');
        }
      }
    },
    [typeAhead, isResultsVisible, onFinish, term, trackSearchBarEvent]
  );

  const onClickResult = useCallback(
    (result: SearchEntry) => {
      trackSearchBarEvent('Click result');
      setResultsVisible(false);
      onFinish('Click result');

      if (replaceResultUrl?.(result)) {
        history.replace(result.url);
      } else {
        history.push(result.url);
      }
    },
    [
      replaceResultUrl,
      history,
      trackSearchBarEvent,
      setResultsVisible,
      onFinish,
    ]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classnames(styles.SearchBar, !typeAhead && styles['in-page'])}
    >
      <div ref={resultsRef}>
        <form
          className={styles.Form}
          onSubmit={(e) => {
            e.preventDefault();
            if (term) {
              trackSearchBarEvent('Submit search');
              history.push(
                `${AppRoutes.SEARCH}?${new URLSearchParams(`term=${term}`)}`
              );
              setResultsVisible(true);
              trackSearch(term, searchCategory);
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
              trackSearchDebounced(term);
            }}
          />

          <IconButton
            className={styles.SubmitButton}
            aria-label="Verstuur zoekopdracht"
            type="submit"
            iconSize="36"
            iconFill={Colors.white}
            icon={IconSearch}
          />
        </form>

        {isResultsVisible && (
          <div className={styles.Results}>
            <ResultSet
              term={term}
              isLoading={isTyping || !isAppStateReady}
              results={results?.ma?.slice(0, maxResultCountDisplay / 2) || []}
              noResultsMessage="Niets gevonden op Mijn Amsterdam"
              showIcon={extendedAMResults}
              onClickResult={onClickResult}
            />

            {useBagSearch && (
              <ResultSet
                term={term}
                isLoading={isTyping || !isAppStateReady}
                title="Gevonden adressen"
                results={
                  results?.ad?.state === 'hasValue' &&
                  results?.ad?.contents !== null
                    ? results?.ad?.contents.slice(0, maxResultCountDisplay / 2)
                    : []
                }
                noResultsMessage="Niets gevonden in BAG"
                onClickResult={onClickResult}
              />
            )}

            <ResultSet
              term={term}
              isLoading={results?.am?.state === 'loading' || isTyping}
              title="Overige informatie op Amsterdam.nl"
              noResultsMessage="Niets gevonden op Amsterdam.nl"
              extendedResults={extendedAMResults}
              onClickResult={onClickResult}
              results={
                results?.am?.state === 'hasValue' &&
                results?.am?.contents !== null
                  ? results.am.contents.slice(0, maxResultCountDisplay / 2)
                  : []
              }
            />

            {extendedAMResults && (
              <p>
                <Button
                  onClick={() =>
                    (window.location.href = `https://www.amsterdam.nl/zoeken/?Zoe=${term}`)
                  }
                >
                  Zoek verder op Amsterdam.nl
                </Button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
