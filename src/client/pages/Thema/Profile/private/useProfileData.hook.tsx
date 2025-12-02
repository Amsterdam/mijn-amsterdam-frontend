import { useMemo } from 'react';

import { formatBrpProfileData } from './ProfilePrivate.transform';
import { useAantalBewonersOpAdres } from './useAantalBewonersOpAdres.hook';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore';
import { routeConfig } from '../Profile-thema-config';
import { useWonenThemaData } from './useVvEThemaData.hook';
export function useProfileData() {
  const { BRP, WONEN } = useAppStateGetter();
  const { wonenData } = useWonenThemaData();
  const residentCount = useAantalBewonersOpAdres(BRP.content);
  // na refresh vd deze file zie is WONEN.content wel true! Maar na refresh pagina niet meer..
  const profileData = useMemo(() => {
    if (BRP.content?.adres && WONEN.content?.name) {
      const brpContent = {
        ...BRP.content,
        adres: {
          ...BRP.content.adres,
          vveNaam: wonenData?.name,

          // Add static and async profile data
          aantalBewoners: residentCount,
          wozWaarde: 'https://www.wozwaardeloket.nl/',
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
