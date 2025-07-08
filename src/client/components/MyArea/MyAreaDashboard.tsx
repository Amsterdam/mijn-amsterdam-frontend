import { useRef } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { NavLink } from 'react-router';

import { routeConfig, themaTitle } from './MyArea-thema-config.ts';
import styles from './MyAreaDashboard.module.scss';
import { MyAreaLoader } from './MyAreaLoader.tsx';
import { isLoading } from '../../../universal/helpers/api.ts';
import { isMokum } from '../../../universal/helpers/brp.ts';
import { useAppStateGetter } from '../../hooks/useAppState.ts';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';
import LoadingContent from '../LoadingContent/LoadingContent.tsx';

export function MyAreaDashboard() {
  const profileType = useProfileTypeValue();
  const ref = useRef<HTMLDivElement | null>(null);
  const { BRP, KVK } = useAppStateGetter();
  const isPrivate = profileType === 'private';
  // Check if the Map is nearly scrolled into view
  const mokum = isPrivate ? isMokum(BRP.content) : isMokum(KVK.content);
  const isLoadingBrpKvk = isLoading(BRP) || isLoading(KVK);
  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      <MyAreaLoader isDashboard />
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
