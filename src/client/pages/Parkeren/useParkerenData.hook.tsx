import { PARKEER_CASE_TYPES } from './Parkeren-thema-config';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { DecosCaseType } from '../../../universal/types/decos-zaken';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { tableConfig } from '../Vergunningen/Vergunningen-thema-config';

function getVergunningenFromThemaVergunningen(content: VergunningFrontend[]) {
  const vergunningen = (content ?? [])
    .filter((vergunning) => {
      return PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType);
    })
    .map((vergunning) => ({
      ...vergunning,
      link: {
        ...vergunning.link,
        to: vergunning.link.to.replace('vergunningen', 'parkeren'),
      },
    }));

  return addLinkElementToProperty<VergunningFrontend>(
    vergunningen,
    'identifier'
  );
}

export function useParkerenData() {
  const { VERGUNNINGEN, PARKEREN } = useAppStateGetter();
  const vergunningen = VERGUNNINGEN.content ?? [];

  const parkeerVergunningenFromThemaVergunningen =
    getVergunningenFromThemaVergunningen(vergunningen);
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  return {
    tableConfig,
    parkeerVergunningenFromThemaVergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(VERGUNNINGEN) || isLoading(PARKEREN),
    isError: isError(VERGUNNINGEN) || isError(PARKEREN),
    parkerenUrlSSO: PARKEREN.content?.url ?? '/',
    isLoadingParkerenUrl: isLoading(PARKEREN),
    linkListItems: [
      {
        to: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/',
        title: 'Meer over parkeervergunningen',
      },
    ],
  };
}
