import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ChapterIcon,
  Page,
  PageContent,
  PageHeading,
  Search as SearchBar,
} from '../../components';
import styles from './Search.module.scss';

export default function Search() {
  const termParam =
    new URLSearchParams(window.location.search).get('term') || '';
  return (
    <Page className={styles.Search}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ChapterIcon />}
        className={styles.SearchPageHeading}
      >
        {ChapterTitles.SEARCH}
      </PageHeading>
      <PageContent>
        <SearchBar
          autoFocus={true}
          term={termParam}
          extendedAMResults={true}
          typeAhead={false}
          maxResultCountDisplay={20}
        />
      </PageContent>
    </Page>
  );
}
