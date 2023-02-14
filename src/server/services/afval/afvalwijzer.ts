import { AppRoutes } from '../../../universal/config';
import {
  GarbageFractionCode,
  GarbageFractionInformationFormatted,
  LinkProps,
} from '../../../universal/types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers/source-api-request';

interface GarbageFractionData {
  straatnaam: string;
  huisnummer: number;
  huisletter: string | null;
  huisnummertoevoeging: string | null;
  postcode: string;
  woonplaatsnaam: string;
  afvalwijzerInstructie: null;
  afvalwijzerPerXWeken: null;
  afvalwijzerBuitenzettenVanafTot: null;
  afvalwijzerBuitenzettenVanaf: null;
  afvalwijzerBuitenzettenTot: null;
  afvalwijzerAfvalkalenderOpmerking: string | null;
  afvalwijzerAfvalkalenderFrequentie: string | null;
  afvalwijzerFractieNaam: string;
  afvalwijzerFractieCode: GarbageFractionCode;
  afvalwijzerRoutetypeNaam: string | null;
  afvalwijzerOphaaldagen: string | null;
  afvalwijzerAfvalkalenderMelding: string | null;
  afvalwijzerAfvalkalenderVan: string | null;
  afvalwijzerAfvalkalenderTot: string | null;
  afvalwijzerInstructie2: string | null;
  afvalwijzerOphaaldagen2: string | null;
  afvalwijzerWaar: string | null;
  afvalwijzerBuitenzetten: string | null;
  afvalwijzerBasisroutetypeCode: string | null;
  afvalwijzerButtontekst: string | null;
  afvalwijzerUrl: string | null;
}

interface AFVALSourceData {
  _embedded: {
    afvalwijzer: GarbageFractionData[];
  };
}

function formatKalenderOpmerking(
  fractionData: GarbageFractionData
): string | null {
  return fractionData.afvalwijzerAfvalkalenderOpmerking ?? null;
}

function formatKalenderMelding(
  fractionData: GarbageFractionData
): string | null {
  if (fractionData.afvalwijzerAfvalkalenderMelding) {
    const from = fractionData.afvalwijzerAfvalkalenderVan
      ? new Date(fractionData.afvalwijzerAfvalkalenderVan)
      : null;

    const to = fractionData.afvalwijzerAfvalkalenderTot
      ? new Date(fractionData.afvalwijzerAfvalkalenderTot)
      : null;

    const today = new Date();

    if (from && to && from <= today && to >= today) {
      return fractionData.afvalwijzerAfvalkalenderMelding;
    }
  }

  return null;
}

function formatTitel(fractionData: GarbageFractionData): string {
  switch (fractionData.afvalwijzerFractieCode) {
    case 'Rest':
      return fractionData.afvalwijzerBasisroutetypeCode === 'THUISOPAFSP'
        ? 'Gfe/t, textiel, papier/karton, glas en restafval'
        : 'Restafval';
    case 'GFT':
      return 'Groente-, fruit-, etensresten en tuinafval (gfe/t)';
    case 'Papier':
      return 'Papier en karton';
    case 'GA':
      return 'Grof afval';
  }
  return fractionData.afvalwijzerFractieCode;
}

function getBuurtLink(fractionData: GarbageFractionData): LinkProps {
  return {
    to: `${AppRoutes.BUURT}?datasetIds=["afvalcontainers"]&zoom=14&filters={"afvalcontainers"%3A{"fractie_omschrijving"%3A{"values"%3A{"${fractionData.afvalwijzerFractieCode}"%3A1}}}}`,
    title:
      fractionData.afvalwijzerWaar ?? 'Bekijk afvalcontainers in mijn buurt',
  };
}

function formatFraction(
  fractionData: GarbageFractionData
): GarbageFractionInformationFormatted {
  return {
    titel: formatTitel(fractionData),
    instructie: fractionData.afvalwijzerInstructie2 ?? null,
    instructieCTA:
      fractionData.afvalwijzerButtontekst && fractionData.afvalwijzerUrl
        ? {
            title: fractionData.afvalwijzerButtontekst,
            to: fractionData.afvalwijzerUrl,
          }
        : null,
    ophaaldagen: fractionData.afvalwijzerOphaaldagen ?? null,
    buitenzetten:
      (fractionData.afvalwijzerOphaaldagen &&
        fractionData.afvalwijzerBuitenzettenVanafTot) ??
      null,
    waar:
      !fractionData.afvalwijzerButtontekst && !!fractionData.afvalwijzerUrl
        ? getBuurtLink(fractionData)
        : fractionData.afvalwijzerWaar ?? null,
    opmerking: formatKalenderOpmerking(fractionData),
    kalendermelding: formatKalenderMelding(fractionData),
    fractieCode: fractionData.afvalwijzerFractieCode,
  };
}

export function transformGarbageDataResponse(afvalSourceData: AFVALSourceData) {
  const GarbageFractionInformationFormatted: GarbageFractionInformationFormatted[] =
    [];

  const garbageFractions = afvalSourceData._embedded.afvalwijzer;

  for (const fraction of garbageFractions) {
    switch (fraction.afvalwijzerFractieCode) {
      case 'Rest':
      default:
        GarbageFractionInformationFormatted.push(formatFraction(fraction));
        break;
    }
  }

  return GarbageFractionInformationFormatted;
}

export async function fetchAfvalwijzer(requestID: requestID, bagID: string) {
  const params = {
    bagNummeraanduidingId: bagID,
  };
  const garbageData = await requestData<GarbageFractionInformationFormatted[]>(
    getApiConfig('AFVAL', {
      params,
      transformResponse: transformGarbageDataResponse,
    }),
    requestID
  );

  return garbageData;
}
