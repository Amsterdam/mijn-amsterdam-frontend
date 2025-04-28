import { useMemo } from 'react';

import { Link } from '@amsterdam/design-system-react';

import { formatBrpProfileData } from './ProfilePrivate.transform';
import { useAantalBewonersOpAdres } from './useAantalBewonersOpAdres.hook';
import { FeatureToggle } from '../../../../../universal/config/feature-toggles';
import { useAppStateGetter } from '../../../../hooks/useAppState';

export function useProfileData() {
  const { BRP } = useAppStateGetter();
  const residentCount = useAantalBewonersOpAdres(BRP.content);

  const profileData = useMemo(() => {
    if (
      FeatureToggle.residentCountActive &&
      typeof residentCount === 'number' &&
      // BRP.content?.adres?.adresType === 'woon'
      BRP.content?.adres // quick fix for https://datapunt.atlassian.net/browse/MIJN-4022
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
  };
}
