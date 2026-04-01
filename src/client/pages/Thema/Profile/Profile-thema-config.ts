import { isEnabled } from '../../../config/feature-toggles.ts';
import type {
  PageConfig,
  ThemaConfigBase,
} from '../../../config/thema-types.ts';

type WithListPageConcten = PageConfig<'contactenPage'>;

type ProfileThemaConfig<ID = string> = ThemaConfigBase<ID> &
  Partial<WithListPageConcten>;

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
        title: 'Verhuizing naar Amsterdam doorgeven',
        to: REPORT_RELOCATION,
      },
    ],
    uitlegPageSections: [
      {
        title: THEMA_TITLE_BRP,
        listItems: [
          'Uw inschrijving bij de gemeente',
          'Uw contactmomenten met de gemeente',
        ],
      },
    ],
    route: {
      path: '/persoonlijke-gegevens',
      documentTitle: `${THEMA_TITLE_BRP} | Mijn Amsterdam`,
      trackingUrl: null,
    },
    contactenPage: {
      route: {
        path: '/contactmomenten/:page?',
        documentTitle: `Alle contactmomenten | ${THEMA_TITLE_BRP}`,
        trackingUrl: null,
      },
    },
  },
  [THEMA_ID_KVK]: {
    id: THEMA_ID_KVK,
    title: THEMA_TITLE_KVK,
    featureToggle: {
      active: true,
    },
    profileTypes: ['private', 'commercial'],
    redactedScope: 'content',
    pageLinks: [
      {
        to: 'https://www.kvk.nl/inschrijven-en-wijzigen/wijziging-doorgeven/',
        title: 'Geef wijzigingen door aan de Kamer van Koophandel',
      },
    ],
    uitlegPageSections: [], // TO DO now also no text, so maybe in the future?
    route: {
      path: '/gegevens-handelsregister',
      documentTitle: `${THEMA_TITLE_KVK} | Mijn Amsterdam`,
      trackingUrl: null,
    },
  },
};

export const BRP_LABEL_AANTAL_INGESCHREVEN_PERSONEN = 'Ingeschreven personen';
