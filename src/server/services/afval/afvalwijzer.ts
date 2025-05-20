import { LatLngLiteral } from 'leaflet';

import type {
  AfvalFractionData,
  AfvalFractionInformationTransformed,
  AFVALSourceData,
} from './afval.types';
import { labels } from './translations';
import { routeConfig as buurtRouteConfig } from '../../../client/components/MyArea/MyArea-thema-config';
import type { LinkProps } from '../../../universal/types/App.types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { sanitizeCmsContent } from '../cms/cms-content';

function formatKalenderOpmerking(
  fractionData: AfvalFractionData
): string | null {
  return fractionData.afvalwijzerAfvalkalenderOpmerking
    ? sanitizeCmsContent(fractionData.afvalwijzerAfvalkalenderOpmerking)
    : null;
}

function formatKalenderMelding(fractionData: AfvalFractionData): string | null {
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
    const FRACTION_DIGITS = 5;
    const location = `${centroid.lat.toFixed(FRACTION_DIGITS)}/${centroid.lng.toFixed(FRACTION_DIGITS)}`;
    const center = `${centroid.lat.toFixed(FRACTION_DIGITS)},${centroid.lng.toFixed(FRACTION_DIGITS)}`;

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

function getBuurtLink(fractionData: AfvalFractionData): LinkProps {
  return {
    to: `${buurtRouteConfig.themaPage.path}?datasetIds=["afvalcontainers"]&zoom=14&filters={"afvalcontainers"%3A{"fractie_omschrijving"%3A{"values"%3A{"${fractionData.afvalwijzerFractieCode}"%3A1}}}}`,
    title: getText(fractionData.afvalwijzerWaar),
  };
}

function transformFractionData(
  fractionData: AfvalFractionData,
  centroid: LatLngLiteral | null
): AfvalFractionInformationTransformed {
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

  const afvalwijzerOphaaldagen2 = Array.isArray(
    fractionData.afvalwijzerOphaaldagen2
  )
    ? fractionData.afvalwijzerOphaaldagen2.join(', ')
    : fractionData.afvalwijzerOphaaldagen2;
  const ophaaldagen = [
    afvalwijzerOphaaldagen2,
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

export function transformAfvalDataResponse(
  afvalSourceData: AFVALSourceData,
  latlng: LatLngLiteral | null
): AfvalFractionInformationTransformed[] {
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
  bagID: string,
  latlng: LatLngLiteral | null
) {
  const params = {
    bagNummeraanduidingId: bagID,
  };
  const garbageData = await requestData<AfvalFractionInformationTransformed[]>(
    getApiConfig('AFVAL', {
      params,
      cacheKey: JSON.stringify(latlng),
      transformResponse: (afvalSourceData: AFVALSourceData) =>
        transformAfvalDataResponse(afvalSourceData, latlng),
    })
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
