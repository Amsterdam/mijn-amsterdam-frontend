import { useMemo } from 'react';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  InfoPanel,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Wonen.module.scss';
import classnames from 'classnames';

// TODO
// 1. BRP adres -> verblijfsobject id
// 2. energielabel endpoint  by verblijfsobject
// 3. add kwaliteitsmonitor endpoint
// 4. write tests

export default function Wonen() {
  const { WONEN, BRP } = useAppStateGetter();

  const filledStatusInfo = WONEN.content?.woningen[0];

  return (
    <OverviewPage className={styles.WonenOverviewPage}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(BRP)}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.WONEN}
      </PageHeading>
      <PageContent>
        <p>Hieronder vindt u gegevens van uw woning.</p>

        <MaintenanceNotifications page="wonen" />
        {isError(BRP) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen ID-kaarten tonen.</p>
          </Alert>
        )}
      </PageContent>
      {!!filledStatusInfo && (
        <InfoPanel
          className={classnames(styles.DefaultPanel, styles.AddressPanel)}
          // {...formatInfoPanelConfig(panelConfig.adres, BRP)}
          panelData={filledStatusInfo}
        />
      )}
    </OverviewPage>
  );
}
