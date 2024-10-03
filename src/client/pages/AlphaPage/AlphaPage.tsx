import styles from './AlphaPage.module.scss';
import { Page, PageContent, PageHeading } from '../../components';

export default function AlphaPage() {
  return (
    <Page className={styles.AlphaPage}>
      <PageHeading>AlphaPage title</PageHeading>
      <PageContent>
        <p>AlphaPage body</p>
      </PageContent>
    </Page>
  );
}
