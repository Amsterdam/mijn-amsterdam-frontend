import { Vergunning } from '../../../server/services/vergunningen/vergunningen';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { isError, isLoading } from '../../../universal/helpers/api';
import { CaseType, DecosCaseType } from '../../../universal/types/vergunningen';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useVergunningenTransformed } from '../Vergunningen/useVergunningenTransformed.hook';
import { tableConfig } from '../VergunningenV2/config';

export const PARKEER_CASE_TYPES: Set<DecosCaseType> = new Set([
  CaseType.GPK,
  CaseType.GPP,
  CaseType.BZP,
  CaseType.EigenParkeerplaats,
  CaseType.EigenParkeerplaatsOpheffen,
  CaseType.TouringcarDagontheffing,
  CaseType.TouringcarJaarontheffing,
]);

function getVergunningenFromThemaVergunningen(
  content: VergunningFrontendV2[] | Vergunning[] | null
) {
  return addLinkElementToProperty<VergunningFrontendV2 | Vergunning>(
    (content ?? [])
      .filter((vergunning) =>
        PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType)
      )
      .map((vergunning) => ({
        ...vergunning,
        link: {
          ...vergunning.link,
          to: vergunning.link.to.replace('vergunningen', 'parkeren'),
        },
      }))
  );
}

export function useParkerenData() {
  const { VERGUNNINGENv2, VERGUNNINGEN, PARKEREN } = useAppStateGetter();
  const vergunningenState = FeatureToggle.vergunningenV2Active
    ? VERGUNNINGENv2
    : VERGUNNINGEN;
  const vergunningen =
    (vergunningenState === VERGUNNINGEN
      ? useVergunningenTransformed(VERGUNNINGEN)
      : VERGUNNINGENv2.content) ?? [];

  const parkeerVergunningenFromThemaVergunningen =
    getParkeervergunningen(vergunningen);
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  return {
    tableConfig,
    parkeerVergunningenFromThemaVergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(vergunningenState) || isLoading(PARKEREN),
    isError: isError(vergunningenState) || isError(PARKEREN),
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
