import { isEnabled } from '../../../config/feature-toggles.ts';
import type {
  ThemaConfigBase,
  ThemaRoutesConfig,
} from '../../../config/thema-types.ts';

type ProfileThemaConfig<ID = string> = Pick<
  ThemaConfigBase<ID>,
  | 'id'
  | 'title'
  | 'featureToggle'
  | 'profileTypes'
  | 'redactedScope'
  | 'pageLinks'
>;

const THEMA_ID_BRP = 'BRP' as const;
const THEMA_ID_KVK = 'KVK' as const;
const THEMA_TITLE_BRP = 'Mijn gegevens' as const;
const THEMA_TITLE_KVK = 'Mijn onderneming' as const;

const CHANGE_PERSONAL_DATA =
  'https://www.amsterdam.nl/burgerzaken/fouten-gegevens-laten-aanpassen/';

const CHANGE_RESIDENT_COUNT =
  'https://www.amsterdam.nl/burgerzaken/verhuizen-inschrijving-briefadres/onjuiste-inschrijving-adres-melden/';

const REPORT_RELOCATION =
  'https://www.amsterdam.nl/burgerzaken/verhuizing-doorgeven/';

export const themaConfig: Record<
  typeof THEMA_ID_BRP | typeof THEMA_ID_KVK,
  ProfileThemaConfig
> = {
  [THEMA_ID_BRP]: {
    id: THEMA_ID_BRP,
    title: THEMA_TITLE_BRP,
    featureToggle: {
      active: true,
      get aantalBewonersOpAdresTonenActive() {
        return (
          themaConfig[THEMA_ID_BRP].featureToggle.active &&
          isEnabled('BRP.aantalBewonersOpAdresTonen')
        );
      },
    },
    profileTypes: ['commercial', 'private'],
    redactedScope: 'content',
    pageLinks: [
      {
        title: 'Inzien of correctie doorgeven',
        to: CHANGE_PERSONAL_DATA,
      },
      {
        title: 'Onjuiste inschrijving melden',
        to: CHANGE_RESIDENT_COUNT,
      },
      {
        title: '',
        to: REPORT_RELOCATION,
      },
    ],
  },
  [THEMA_ID_KVK]: {
    id: THEMA_ID_KVK,
    title: THEMA_TITLE_KVK,
    featureToggle: {
      active: true,
    },
    profileTypes: ['private'],
    redactedScope: 'content',
    pageLinks: [],
  },
};

export const routeConfig = {
  themaPageBRP: {
    path: '/persoonlijke-gegevens',
    documentTitle: `${THEMA_TITLE_BRP} | Mijn Amsterdam`,
    trackingUrl: null,
  },
  themaPageKVK: {
    path: '/gegevens-handelsregister',
    documentTitle: `${THEMA_TITLE_KVK} | Mijn Amsterdam`,
    trackingUrl: null,
  },
  listPageContactmomenten: {
    path: '/contactmomenten/:page?',
    documentTitle: `Alle contactmomenten | ${THEMA_TITLE_BRP}`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

export const BRP_LABEL_AANTAL_INGESCHREVEN_PERSONEN = 'Ingeschreven personen';
