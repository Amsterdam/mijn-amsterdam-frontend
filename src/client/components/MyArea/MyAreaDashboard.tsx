import { useRef } from 'react';
import { generatePath, NavLink } from 'react-router-dom';

import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isMokum } from '../../../universal/helpers';
import { useAppStateGetter } from '../../hooks';
import { useOnScreen } from '../../hooks/useOnScreen';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import Heading from '../Heading/Heading';
import styles from './MyAreaDashboard.module.scss';
import MyAreaLoader from './MyAreaLoader';

import 'leaflet/dist/leaflet.css';

export default function MyAreaDashboard() {
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();
  const ref = useRef<HTMLDivElement | null>(null);
  const { BRP, KVK } = useAppStateGetter();
  const isPrivate = profileType === 'private';
  // Check if the Map is nearly scrolled into view
  const isOnScreen = useOnScreen(ref, '-200px');
  const mokum = isPrivate ? isMokum(BRP.content) : isMokum(KVK.content);
  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      {isOnScreen && <MyAreaLoader isDashboard={true} />}
      <NavLink className={styles.NavLink} to={generatePath(AppRoutes.BUURT)}>
        <span className={styles.NavLinkContentWrap}>
          <Heading size="large">{termReplace(ChapterTitles.BUURT)}</Heading>
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
