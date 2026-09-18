import { useRef } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { NavLink } from 'react-router';

import { routeConfig, themaTitle } from './MyArea-thema-config.ts';
import styles from './MyAreaDashboard.module.scss';
import { MyAreaLoader } from './MyAreaLoader.tsx';
import { isMokum } from '../../../universal/helpers/brp.ts';
import { useAppStateGetter } from '../../hooks/useAppStateStore.ts';
import { useIsLoading } from '../../hooks/useIsLoading.ts';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';
import { LoadingContent } from '../LoadingContent/LoadingContent.tsx';

export function MyAreaDashboard() {
  const profileType = useProfileTypeValue();
  const ref = useRef<HTMLDivElement | null>(null);
  const { BRP, KVK } = useAppStateGetter();
  const isPrivate = profileType === 'private';
  const isLoading = useIsLoading(isPrivate ? BRP : KVK);

  // Check if the Map is nearly scrolled into view
  const mokum = isPrivate ? isMokum(BRP.content) : isMokum(KVK.content);

  const paragraphText = mokum
    ? 'Klik voor een overzicht van gemeentelijke informatie rond uw adres.'
    : 'Uw adres kan niet worden getoond in Mijn Amsterdam.';

  return (
    <div ref={ref} className={styles.DashboardMapContainer}>
      <MyAreaLoader isDashboard={true} />
      <NavLink className={styles.NavLink} to={routeConfig.themaPage.path}>
        <span className={styles.NavLinkContentWrap}>
          <Heading level={3}>{themaTitle}</Heading>
          {isLoading ? (
            <LoadingContent barConfig={[['200px', '30px', '20px']]} />
          ) : (
            <Paragraph>
              {mokum
                ? 'Klik voor een overzicht van gemeentelijke informatie rond uw adres.'
                : 'Uw adres kan niet worden getoond in Mijn Amsterdam.'}
            </Paragraph>
          )}
        </span>
      </NavLink>
    </div>
  );
}
