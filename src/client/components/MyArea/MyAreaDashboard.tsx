import { useRef } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { NavLink } from 'react-router';

import { routeConfig, themaTitle } from './MyArea-thema-config';
import styles from './MyAreaDashboard.module.scss';
import { MyAreaLoader } from './MyAreaLoader';
import { isLoading } from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { useAppStateGetter } from '../../hooks/useAppStateStore';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import LoadingContent from '../LoadingContent/LoadingContent';

export function MyAreaDashboard() {
  const profileType = useProfileTypeValue();
  const ref = useRef<HTMLDivElement | null>(null);
  const { BRP, KVK } = useAppStateGetter();
  const isPrivate = profileType === 'private';
  // Check if the Map is nearly scrolled into view
  const mokum = isPrivate ? isMokum(BRP.content) : isMokum(KVK.content);
  const isLoadingBrpKvk = isPrivate ? isLoading(BRP) : isLoading(KVK);
  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      <MyAreaLoader isDashboard={true} />
      <NavLink className={styles.NavLink} to={routeConfig.themaPage.path}>
        <span className={styles.NavLinkContentWrap}>
          <Heading level={3}>{themaTitle}</Heading>
          {isLoadingBrpKvk && (
            <LoadingContent barConfig={[['200px', '30px', '20px']]} />
          )}
          {!isLoadingBrpKvk && (
            <>
              {!mokum ? (
                <Paragraph>
                  Uw adres kan niet worden getoond in Mijn Amsterdam.
                </Paragraph>
              ) : (
                <Paragraph>
                  Klik voor een overzicht van gemeentelijke informatie rond uw
                  adres.
                </Paragraph>
              )}
            </>
          )}
        </span>
      </NavLink>
    </div>
  );
}
