import { LatLngLiteral } from 'leaflet';
import { AppRoutes } from '../../../universal/config/routes';
import {
  GarbageFractionCode,
  GarbageFractionInformationTransformed,
  LinkProps,
} from '../../../universal/types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { sanitizeCmsContent } from '../cms-content';
import { labels } from './translations';

export interface GarbageFractionData {
  straatnaam: string;
  huisnummer: number;
  huisletter: string | null;
  huisnummertoevoeging: string | null;
  postcode: string;
  woonplaatsnaam: string;
  afvalwijzerInstructie: string | null;
  afvalwijzerPerXWeken: string | null;
  afvalwijzerBuitenzettenVanafTot: string | null;
  afvalwijzerBuitenzettenVanaf: string | null;
  afvalwijzerBuitenzettenTot: string | null;
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
  gbdBuurtCode: string | null;
  bagNummeraanduidingId: string | null;
  gebruiksdoelWoonfunctie: boolean;
}

export interface AFVALSourceData {
  _embedded: {
    afvalwijzer: GarbageFractionData[];
  };
}

function formatKalenderOpmerking(
  fractionData: GarbageFractionData
): string | null {
  return fractionData.afvalwijzerAfvalkalenderOpmerking
    ? sanitizeCmsContent(fractionData.afvalwijzerAfvalkalenderOpmerking)
    : null;
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
      return sanitizeCmsContent(fractionData.afvalwijzerAfvalkalenderMelding);
    }
  }

  return null;
}

function getAfvalPuntKaartUrl(centroid: LatLngLiteral | null) {
  const mapUrl = 'https://kaart.amsterdam.nl/afvalpunten/#13/';

  if (centroid) {
    const location = `${centroid.lat.toFixed(5)}/${centroid.lng.toFixed(5)}`;
    const center = `${centroid.lat.toFixed(5)},${centroid.lng.toFixed(5)}`;

    return `${mapUrl}${location}/brt/14324///${center}`;
  }

  return mapUrl;
}

function getText(text: string | null, fallbackText?: string): string {
  if (text) {
    const lbl = labels[text];

    if (lbl) {
      return lbl.text ?? '';
    }

    return fallbackText ?? text;
  }

  return fallbackText ?? '';
}

function getHtml(text: string | null, fallbackText?: string): string {
  if (text) {
    const lbl = labels[text];

    if (lbl) {
      return lbl.html ?? '';
    }

    return fallbackText ?? text;
  }

  return fallbackText ?? '';
}

function getBuurtLink(fractionData: GarbageFractionData): LinkProps {
  return {
    to: `${AppRoutes.BUURT}?datasetIds=["afvalcontainers"]&zoom=14&filters={"afvalcontainers"%3A{"fractie_omschrijving"%3A{"values"%3A{"${fractionData.afvalwijzerFractieCode}"%3A1}}}}`,
    title: getText(fractionData.afvalwijzerWaar),
  };
}

function transformFractionData(
  fractionData: GarbageFractionData,
  centroid: LatLngLiteral | null
): GarbageFractionInformationTransformed {
  const afvalPuntKaartUrl = getAfvalPuntKaartUrl(centroid);

  const formsUrl = 'https://formulieren.amsterdam.nl/TriplEforms/';
  let addressCode = `${fractionData.postcode},${fractionData.huisnummer}`;

  addressCode = `${addressCode},${fractionData.huisletter ?? ''}`;
  addressCode = `${addressCode},${fractionData.huisnummertoevoeging ?? ''}`;

  const url = fractionData.afvalwijzerUrl?.startsWith(formsUrl)
    ? fractionData.afvalwijzerUrl.replace(formsUrl, getText(formsUrl)) +
      '?GUID=' +
      addressCode
    : fractionData.afvalwijzerUrl;

  const ophaaldagen = [
    fractionData.afvalwijzerOphaaldagen2,
    fractionData.afvalwijzerPerXWeken,
  ]
    .map((s) => (s ? getText(s, '') : ''))
    .filter((s) => s)
    .join(', ');

  const instructieSanitized = fractionData.afvalwijzerInstructie2
    ? sanitizeCmsContent(getHtml(fractionData.afvalwijzerInstructie2), {
        allowedTags: ['a'],
        allowedAttributes: { a: ['href', 'rel'] },
        exclusiveFilter: () => false,
      })
    : null;

  const afvalpuntInstructie =
    fractionData.afvalwijzerInstructie2 &&
    fractionData.afvalwijzerUrl?.startsWith(
      'https://kaart.amsterdam.nl/afvalpunten'
    )
      ? fractionData.afvalwijzerInstructie2.replace(
          'een Afvalpunt',
          `<a href="${afvalPuntKaartUrl}" rel="noopener noreferrer">een Afvalpunt</a>`
        )
      : fractionData.afvalwijzerInstructie2;

  const stadsdeelRegelsUrl = getText(
    `particulier-${fractionData.gbdBuurtCode?.charAt(0)}`,
    ''
  );

  let titel = getText(fractionData.afvalwijzerFractieCode);

  if (
    fractionData.afvalwijzerFractieCode === 'Rest' &&
    fractionData.afvalwijzerBasisroutetypeCode === 'THUISAFSPR'
  ) {
    titel = getText('Huishoudelijk afval');
  }

  return {
    titel,
    instructie: fractionData.afvalwijzerInstructie2
      ? fractionData.afvalwijzerFractieCode !== 'GA'
        ? instructieSanitized
        : afvalpuntInstructie
      : null,
    instructieCTA:
      fractionData.afvalwijzerInstructie2 &&
      fractionData.afvalwijzerButtontekst &&
      url
        ? {
            title: sanitizeCmsContent(fractionData.afvalwijzerButtontekst),
            to: url,
          }
        : null,
    ophaaldagen,
    buitenzetten: ophaaldagen
      ? getText(fractionData.afvalwijzerBuitenzettenVanafTot)
      : null,
    waar:
      fractionData.afvalwijzerWaar &&
      url?.startsWith('https://kaart.amsterdam.nl/afvalcontainers')
        ? getBuurtLink(fractionData)
        : fractionData.afvalwijzerWaar,
    opmerking: formatKalenderOpmerking(fractionData),
    kalendermelding: formatKalenderMelding(fractionData),
    fractieCode: fractionData.afvalwijzerFractieCode,
    gebruiksdoelWoonfunctie: fractionData.gebruiksdoelWoonfunctie,
  };
}

export function transformGarbageDataResponse(
  afvalSourceData: AFVALSourceData,
  latlng: LatLngLiteral | null
): GarbageFractionInformationTransformed[] {
  // NOTE: Plastic fractions are excluded. New sorting machines came into use and plastic separation is no longer needed.
  // NOTE: Black box business logic extracted from afvalwijzer source-code from amsterdam.nl/afvalwijzer
  const heeftThuisAfspraakRouteCodeInResultaten =
    afvalSourceData._embedded?.afvalwijzer.some(
      (info) => info.afvalwijzerBasisroutetypeCode === 'THUISAFSPR'
    );
  const garbageFractions =
    afvalSourceData._embedded?.afvalwijzer.filter(
      (fraction) =>
        fraction.afvalwijzerFractieCode !== 'Plastic' &&
        (!heeftThuisAfspraakRouteCodeInResultaten ||
          fraction.afvalwijzerBasisroutetypeCode === 'THUISAFSPR' ||
          fraction.afvalwijzerBasisroutetypeCode === 'GROFAFSPR')
    ) ?? [];

  return garbageFractions.map((fractionData) =>
    transformFractionData(fractionData, latlng)
  );
}

export async function fetchAfvalwijzer(
  requestID: RequestID,
  bagID: string,
  latlng: LatLngLiteral | null
) {
  const params = {
    bagNummeraanduidingId: bagID,
  };
  const garbageData = await requestData<
    GarbageFractionInformationTransformed[]
  >(
    getApiConfig('AFVAL', {
      params,
      transformResponse: (afvalSourceData: AFVALSourceData) =>
        transformGarbageDataResponse(afvalSourceData, latlng),
    }),
    requestID
  );

  return garbageData;
}

export const exportedForTesting = {
  formatKalenderOpmerking,
  formatKalenderMelding,
  getAfvalPuntKaartUrl,
  getText,
  getHtml,
  getBuurtLink,
  transformFractionData,
};
