import { useRef } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { generatePath, NavLink } from 'react-router';

import styles from './MyAreaDashboard.module.scss';
import { MyAreaLoader } from './MyAreaLoader';
import { AppRoutes } from '../../../universal/config/routes';
import { isLoading } from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import LoadingContent from '../LoadingContent/LoadingContent';

export function MyAreaDashboard() {
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();
  const ref = useRef<HTMLDivElement | null>(null);
  const { BRP, KVK } = useAppStateGetter();
  const isPrivate = profileType === 'private';
  // Check if the Map is nearly scrolled into view
  const mokum = isPrivate ? isMokum(BRP.content) : isMokum(KVK.content);
  const isLoadingBrpKvk = isLoading(BRP) || isLoading(KVK);
  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      <MyAreaLoader isDashboard={true} />
      <NavLink className={styles.NavLink} to={generatePath(AppRoutes.BUURT)}>
        <span className={styles.NavLinkContentWrap}>
          <Heading level={3}>{termReplace(ThemaTitles.BUURT)}</Heading>
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
                  Klik voor een overzicht van gemeentelijke informatie rond uw{' '}
                  {termReplace('eigen woning')}.
                </Paragraph>
              )}
            </>
          )}
        </span>
      </NavLink>
    </div>
  );
}
