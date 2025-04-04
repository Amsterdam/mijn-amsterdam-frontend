import { useRef } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { generatePath, NavLink } from 'react-router';

import styles from './MyAreaDashboard.module.scss';
import { MyAreaLoader } from './MyAreaLoader';
import { AppRoutes } from '../../../universal/config/routes';
import { isMokum } from '../../../universal/helpers/brp';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';

export function MyAreaDashboard() {
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
          <Heading level={3}>{termReplace(ThemaTitles.BUURT)}</Heading>
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
        </span>
      </NavLink>
    </div>
  );
}
