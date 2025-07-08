import { useMemo } from 'react';

import { Link } from '@amsterdam/design-system-react';

import { formatBrpProfileData } from './ProfilePrivate.transform.tsx';
import { useAantalBewonersOpAdres } from './useAantalBewonersOpAdres.hook.ts';
import { FeatureToggle } from '../../../../../universal/config/feature-toggles.ts';
import { useAppStateGetter } from '../../../../hooks/useAppState.ts';
import { routeConfig } from '../Profile-thema-config.ts';

export function useProfileData() {
  const { BRP } = useAppStateGetter();
  const residentCount = useAantalBewonersOpAdres(BRP.content);

  const profileData = useMemo(() => {
    if (
      FeatureToggle.residentCountActive &&
      typeof residentCount === 'number' &&
      BRP.content?.adres
    ) {
      const brpContent = {
        ...BRP.content,
        adres: {
          ...BRP.content.adres,

          // Add static and async profile data
          aantalBewoners: residentCount,
          wozWaarde: (
            <>
              Te vinden op{' '}
              <Link
                rel="noopener noreferrer"
                href="https://www.wozwaardeloket.nl/"
              >
                WOZ-waardeloket
              </Link>
            </>
          ),
        },
      };
      return formatBrpProfileData(brpContent);
    }
    return BRP.content ? formatBrpProfileData(BRP.content) : BRP.content;
  }, [BRP.content, residentCount]);

  return {
    BRP,
    profileData,
    residentCount,
    routeConfig,
  };
}
