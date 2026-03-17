import { generatePath, type Params } from 'react-router';

import {
  isVergunningExpirable,
  isVergunningExpired,
  type VergunningAanvraag,
  type VergunningExpirable,
} from './Vergunningen-helpers';
import {
  DecosZaakBase,
  type DecosZaakFrontend,
} from '../../../../server/services/decos/decos-types';
import { WithDateRange } from '../../../../server/services/vergunningen/config-and-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { dateSort } from '../../../../universal/helpers/date';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type {
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';

type VergunningFrontendDisplayProps = DisplayProps<DecosZaakFrontend>;

type VergunningFrontendExpireableDisplayProps = DisplayProps<
  DecosZaakFrontend & DecosZaakFrontend<DecosZaakBase & WithDateRange>
>;

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsHuidigeVergunningen: VergunningFrontendExpireableDisplayProps =
  {
    props: {
      detailLinkComponent: 'Zaaknummer',
      title: 'Soort vergunning',
      dateStartFormatted: 'Startdatum',
      dateEndFormatted: 'Einddatum',
    },
    colWidths: {
      large: ['20%', '45%', '15%', '15%'],
      small: ['50%', '50%', '0', '0'],
    },
  };

const displayPropsLopendeAanvragen: VergunningFrontendDisplayProps = {
  props: {
    detailLinkComponent: 'Zaaknummer',
    title: 'Soort vergunning',
    displayStatus: 'Status',
    dateRequestFormatted: 'Aangevraagd op',
  },
  colWidths: {
    large: ['20%', '45%', '15%', '15%'],
    small: ['50%', '50%', '0', '0'],
  },
};

const displayPropsEerdereVergunningen: VergunningFrontendDisplayProps = {
  props: {
    detailLinkComponent: 'Zaaknummer',
    title: 'Soort vergunning',
    displayStatus: 'Status',
  },
  colWidths: {
    large: ['20%', '45%', '35%'],
    small: ['50%', '50%', '0'],
  },
};

const THEMA_ID = 'VERGUNNINGEN';
const THEMA_TITLE = 'Vergunningen en ontheffingen';

type VergunningenThemaConfig = ThemaConfigBase<typeof THEMA_ID> &
  WithListPage &
  WithDetailPage;

export const themaConfig: VergunningenThemaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  profileTypes: ['private', 'commercial'],
  redactedScope: 'none',
  featureToggle: { active: true, documentOpvragenMail: !IS_PRODUCTION },
  route: {
    path: '/vergunningen',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/ondernemen/vergunningen/wevos/',
      title: 'Ontheffing RVV en TVM aanvragen',
    },
  ],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: [
        {
          text: 'Uw aanvraag voor een ontheffing of vergunning voor de volgende activiteiten:',

          listItems: [
            'Ergens rijden of stilstaan waar dat normaal niet mag (RVV en e-RVV)',
            'Straat tijdelijk afsluiten of afzetten (TVM)',
            'Object neerzetten op parkeervak, straat of stoep (Objectvergunning)',
            'Parkeervakken reserveren (TVM)',
            'Tijdelijk toegang krijgen tot gebied dat is afgesloten met paaltjes (RVV)',
            'Werkzaamheden uitvoeren op tijden dat het normaal niet mag (Nachtwerkontheffing)',
            'Filmen (Filmmelding)',
            'Fietsen en/of fietsenrekken verwijderen',
          ],
        },
        'Uw aanvraag of kentekenwijziging voor een RVV-ontheffing Sloterweg',
        'Uw aanvraag voor een gehandicaptenparkeerkaart (GPK) of een vaste gehandicaptenparkeerplaats (GPP)',
        'Uw aanvraag voor een ontheffing touringcar',
        'Uw aanvraag voor een ontheffing zwaar verkeer',
        'Uw aanvraag voor een ontheffing blauwe zone',
        'Uw evenementvergunning of evenementmelding',
        'Uw aanvraag voor een splitsingsvergunning',
        'Uw aanvraag voor kamerverhuur (omzettingsvergunning)',
        'Uw aanvraag vergunning straatartiest, draaiorgel of het aanbieden van diensten op straat',
        'Uw aanvraag ontheffing verspreiden reclamemateriaal (sampling)',
        'Uw aanvraag voor een vergunning voor onttrekken, samenvoegen en vormen van woonruimte',
        'Uw aanvraag voor een ligplaatsvergunning',
        'Uw aanvraag voor een eigen parkeerplaats voor huisartsen, verloskundigen en consuls',
        'Uw aanvraag voor een vergunning exploitatie horecabedrijf',
      ],
    },
  ],
  listPage: {
    route: {
      path: '/vergunningen/lijst/:kind/:page?',
      documentTitle: getListPageDocumentTitle(THEMA_TITLE),
      trackingUrl: null,
    },
  },
  detailPage: {
    route: {
      path: '/vergunningen/:caseType/:id',
      trackingUrl(params) {
        return `/vergunningen/${params?.caseType}`;
      },
      documentTitle: `Vergunningen | ${THEMA_TITLE}`,
    },
  },
};

export const listPageParamKind = {
  actual: 'huidige-vergunningen-en-ontheffingen',
  historic: 'eerdere-vergunningen-en-ontheffingen',
  inProgress: 'lopende-aanvragen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VergunningAanvraag) => !vergunning.processed,
    sort: dateSort('dateRequest', 'desc'),
    displayProps: displayPropsLopendeAanvragen,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.inProgress,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
  },
  [listPageParamKind.actual]: {
    title: 'Huidige vergunningen en ontheffingen',
    filter: (vergunning: VergunningAanvraag | VergunningExpirable) => {
      if (isVergunningExpirable(vergunning)) {
        return !isVergunningExpired(vergunning);
      }
      return false;
    },
    sort: dateSort('dateEnd', 'asc'),
    displayProps: displayPropsHuidigeVergunningen,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.actual,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_HUIDIG,
  },
  [listPageParamKind.historic]: {
    title: 'Eerdere en niet verleende vergunningen en ontheffingen',
    filter: (vergunning: VergunningAanvraag) => {
      if (isVergunningExpirable(vergunning)) {
        return isVergunningExpired(vergunning);
      }

      return vergunning.processed;
    },
    sort: dateSort('dateDecision', 'desc'),
    displayProps: displayPropsEerdereVergunningen,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind: listPageParamKind.historic,
      page: null,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_EERDER,
  },
} as const;

export function getListPageDocumentTitle(themaTitle: string) {
  return <T extends Params<string>>(params: T | null): string => {
    const kind = params?.kind as ListPageParamKind;
    return kind in tableConfig
      ? `${tableConfig[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}
