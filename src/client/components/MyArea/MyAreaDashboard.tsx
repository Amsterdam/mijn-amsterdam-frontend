import { useRef } from 'react';
import { generatePath, NavLink } from 'react-router-dom';

import { Heading } from '@amsterdam/design-system-react';
import { AppRoutes } from '../../../universal/config/routes';
import { isMokum } from '../../../universal/helpers/brp';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import styles from './MyAreaDashboard.module.scss';
import MyAreaLoader from './MyAreaLoader';

export default function MyAreaDashboard() {
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();
  const ref = useRef<HTMLDivElement | null>(null);
  const { BRP, KVK } = useAppStateGetter();
  const isPrivate = profileType === 'private';
  // Check if the Map is nearly scrolled into view
  const mokum = isPrivate ? isMokum(BRP.content) : isMokum(KVK.content);
  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      <MyAreaLoader isDashboard={true} />
      <NavLink className={styles.NavLink} to={generatePath(AppRoutes.BUURT)}>
        <span className={styles.NavLinkContentWrap}>
          <Heading size="level-2" level={3}>
            {termReplace(ThemaTitles.BUURT)}
          </Heading>
          {!mokum ? (
            <p>Uw adres kan niet worden getoond in Mijn Amsterdam.</p>
          ) : (
            <p>
              Klik voor een overzicht van gemeentelijke informatie rond uw{' '}
              {termReplace('eigen woning')}.
            </p>
          )}
        </span>
      </NavLink>
    </div>
  );
}
