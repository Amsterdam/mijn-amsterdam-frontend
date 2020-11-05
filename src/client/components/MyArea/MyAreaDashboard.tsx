import 'leaflet/dist/leaflet.css';
import React, { useRef } from 'react';
import { generatePath, NavLink } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import MyAreaLoader from './MyAreaLoader';
import styles from './MyAreaDashboard.module.scss';
import Heading from '../Heading/Heading';
import { useOnScreen } from '../../hooks/useOnScreen';

interface MyAreaDashboardProps {
  tutorial: string;
}

export default function MyAreaDashboard({ tutorial }: MyAreaDashboardProps) {
  const termReplace = useTermReplacement();
  const ref = useRef<HTMLDivElement | null>(null);
  const isOnScreen = useOnScreen(ref, '-200px');

  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      {isOnScreen && <MyAreaLoader isDashboard={true} />}
      <NavLink className={styles.NavLink} to={generatePath(AppRoutes.BUURT)}>
        <span className={styles.NavLinkContentWrap}>
          <Heading size="large" data-tutorial-item={tutorial}>
            {termReplace(ChapterTitles.BUURT)}
          </Heading>
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw{' '}
            {termReplace('eigen woning')}.
          </p>
        </span>
      </NavLink>
    </div>
  );
}
