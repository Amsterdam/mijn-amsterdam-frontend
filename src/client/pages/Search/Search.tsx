import { AppRoutes } from '../../../universal/config';
import { ThemaTitles } from '../../config/thema';
import {
  ThemaIcon,
  Page,
  PageContent,
  PageHeading,
  Search as SearchBar,
} from '../../components';
import { useAppStateReady } from '../../hooks';
import styles from './Search.module.scss';

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
