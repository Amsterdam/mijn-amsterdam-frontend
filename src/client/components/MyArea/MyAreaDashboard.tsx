import 'leaflet/dist/leaflet.css';
import { useRef } from 'react';
import { generatePath, NavLink } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import MyAreaLoader from './MyAreaLoader';
import styles from './MyAreaDashboard.module.scss';
import Heading from '../Heading/Heading';
import { useOnScreen } from '../../hooks/useOnScreen';
import { useAppStateGetter } from '../../hooks';
import { useProfileTypeValue } from '../../hooks/useProfileType';

export default function MyAreaDashboard() {
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();
  const ref = useRef<HTMLDivElement | null>(null);
  const { MY_LOCATION } = useAppStateGetter();
  const isPrivate = profileType === 'private'
  // Check if the Map is nearly scrolled into view
  const isOnScreen = useOnScreen(ref, '-200px');
  const isMokum = !!MY_LOCATION.content?.mokum;
  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      {isOnScreen && <MyAreaLoader isDashboard={true} />}
      <NavLink className={styles.NavLink} to={generatePath(AppRoutes.BUURT)}>
        <span className={styles.NavLinkContentWrap}>
          <Heading size="large">{termReplace(ChapterTitles.BUURT)}</Heading>
          {!isMokum ? (
            <p>
              {`U${
                isPrivate ? '' : 'w bedrijf'
              } staat niet in Amsterdam ingeschreven in ${
                isPrivate ? 'de Basisregistratie Personen (BRP)' : 'het handelsregister (KVK)'
              }. Uw adres kan daarom niet worden getoond in Mijn
              Amsterdam.`}
            </p>
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
