import React, { useContext } from 'react';
import { ChapterTitles } from '../../../universal/config/index';
import { isError } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  Linkd,
  PageContent,
  PageHeading,
} from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import styles from './Vergunningen.module.scss';

export default () => {
  const { VERGUNNINGEN } = useContext(AppContext);

  return (
    <OverviewPage className={styles.Vergunningen}>
      <PageHeading icon={<ChapterIcon />}>
        {ChapterTitles.VERGUNNINGEN}
      </PageHeading>
      <PageContent>
        <p>
          Wilt u een evenement organiseren op straat of in een gebouw? Dan hebt
          u meestal een evenementenvergunning nodig, maar soms is een melding
          voldoende. Kijk hier hoe het werkt.
        </p>
        <p>
          <Linkd external={true} href="https://mijn.amsterdam.nl/">
            Meer informatie op amsterdam.nl
          </Linkd>
        </p>
        {isError(VERGUNNINGEN) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
    </OverviewPage>
  );
};
