import { Page, PageContent, PageHeading } from '../../components';
import styles from './Toerisme.module.scss';
import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import { ChapterIcon, Linkd } from '../../components';

import { useAppStateGetter } from '../../hooks/useAppState';

export default function Toerisme() {
  const { TOERISME } = useAppStateGetter();
  console.log(TOERISME);
  return (
    <Page className={styles.Toerisme}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ChapterIcon />}
      >
        Toerisme title
      </PageHeading>
      <PageContent>
        <p>
          Hieronder vind u een overzicht van uw aanvragen voor toeristische
          verhuur
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BE4341B52-1FC0-4E17-AB68-2B3AFE15160A%7D"
          >
            Ontheffing RVV en TVM aanvragen
          </Linkd>
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BE4341B52-1FC0-4E17-AB68-2B3AFE15160A%7D"
          >
            Ontheffing RVV en TVM aanvragen
          </Linkd>
        </p>
      </PageContent>
    </Page>
  );
}
