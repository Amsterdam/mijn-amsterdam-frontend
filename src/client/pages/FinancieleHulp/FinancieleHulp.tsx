import { Page, PageContent, PageHeading } from '../../components';
import styles from './FinancieleHulp.module.scss';

// import { useAppStateGetter } from '../../hooks/useAppState';

export default function FinancieleHulp() {
  // const { STATE_SLICE } = useAppStateGetter();
  return (
    <Page className={styles.FinancieleHulp}>
      <PageHeading>FinancieleHulp title</PageHeading>
      <PageContent>
        <p>FinancieleHulp body</p>
      </PageContent>
    </Page>
  );
}
