import { useMemo } from 'react';

import { formatBrpProfileData } from './formatDataPrivate';
import { useAantalBewonersOpAdres } from './useAantalBewonersOpAdres.hook';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { LinkdInline } from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';

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
          aantalBewoners: residentCount,
          wozWaarde: (
            <>
              Te vinden op{' '}
              <LinkdInline
                external={true}
                href="https://www.wozwaardeloket.nl/"
              >
                WOZ-waardeloket
              </LinkdInline>
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
