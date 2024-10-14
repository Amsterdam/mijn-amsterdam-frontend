import styles from './Search.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import {
  Page,
  PageContent,
  PageHeading,
  Search as SearchBar,
  ThemaIcon,
} from '../../components';
import { ThemaTitles } from '../../config/thema';
import { useAppStateReady } from '../../hooks/useAppState';

export default function Search() {
  const termParam =
    new URLSearchParams(window.location.search).get('term') || '';
  const isReady = useAppStateReady();
  return (
    <Page className={styles.Search}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ThemaIcon />}
        className={styles.SearchPageHeading}
      >
        {ThemaTitles.SEARCH}
      </PageHeading>
      <PageContent>
        {isReady ? (
          <SearchBar
            autoFocus={true}
            term={termParam}
            extendedAMResults={true}
            typeAhead={false}
            maxResultCountDisplay={20}
          />
        ) : (
          <p>Zoeken voorbereiden...</p>
        )}
      </PageContent>
    </Page>
  );
}
