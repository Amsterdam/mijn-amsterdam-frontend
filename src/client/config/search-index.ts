import axios, { CancelTokenSource } from 'axios';
import { Vergunning } from '../../server/services';
import { DocumentTitles } from '../../universal/config/chapter';
import { AppRoutes } from '../../universal/config/routes';
import { pick } from '../../universal/helpers';

interface PageEntry {
  url: string;
  title: string;
  description: string;
  keywords?: string[];
}

export const staticIndex: PageEntry[] = [
  {
    url: AppRoutes.ROOT,
    title: DocumentTitles[AppRoutes.ROOT],
    description:
      'Dashboard pagina met overzicht van wat u hebt op Mijn Amsterdam.',
    keywords: [
      'Home',
      'Dashboard',
      'Start',
      'Updates',
      'Nieuws',
      'Zaken',
      'Lopende zaken',
      'Recente zaken',
      'Melding',
      'Lopende aanvragen',
      'Aanvragen',
    ],
  },
  {
    url: AppRoutes.BURGERZAKEN,
    title: DocumentTitles[AppRoutes.BURGERZAKEN],
    description: `Informatie over uw officiële documenten, zoals uw
          paspoort of aktes. Als u gaat trouwen of een partnerschap aangaat, dan
          ziet u hier de aankondiging.`,
    keywords: [
      'Burgerdingen',
      'Burgerzaken',
      'Paspoort',
      'Passport',
      'Huwelijk',
      'Huwelijksakte',
      'Trouwen',
      'Partnerschap',
      'Akte',
      'Aktes',
      'ID/id',
      'ID kaart',
      'ID bewijs',
      'Identiteitsbewijs',
      'Identiteitskaart',
      'Reis document',
      'Document',
    ],
  },
  {
    url: AppRoutes.ZORG,
    title: DocumentTitles[AppRoutes.ZORG],
    description: `Uw regelingen en hulpmiddelen vanuit de Wmo.`,
    keywords: [
      'Zorg',
      'Scootmobiel',
      'Thuishulp',
      'Hulp in huis',
      'Thuiszorg',
      'WMO',
      'Zorgvoorziening',
      'Voorziening',
      'Zorgproduct',
      'Recht op zorg',
      'Aanvraag',
      'Zorgaanvraag',
      'Bijzondere bijstand',
      'Taxi',
      'BBZ',
    ],
  },
  {
    url: AppRoutes.STADSPAS,
    title: DocumentTitles[AppRoutes.STADSPAS],
    description: `Informatie over uw eigen Stadspas.`,
    keywords: [
      'Stadspas',
      'Groene stip',
      'Blauwe ruit',
      'Gratis pas',
      'Saldo checken',
      'stadspasnummer',
      'pasnummer',
      'pas nummer',
      'einddatum stadspas',
      'besluit aanvraag',
      'Geld ',
      'Afschrijvingen',
      'Gratis pas',
      'Pas',
      'Transacties',
      'Hoeveel heb ik uitgegeven?',
    ],
  },
  {
    url: AppRoutes.INKOMEN,
    title: DocumentTitles[AppRoutes.INKOMEN],
    description: `Informatie over uw uitkering en de
          ondersteuning die u krijgt omdat u weinig geld hebt.`,
    keywords: [
      'Geld',
      'Uitkering',
      'bijstandsuitkering',
      'Bijstand',
      'Werkloos',
      'Aanvragen',
      'Jaaropgave',
      'Vakantiegeld',
      'Tozo',
      'Tonk',
      'Specificaties',
    ],
  },
  {
    url: AppRoutes.NOTIFICATIONS,
    title: DocumentTitles[AppRoutes.NOTIFICATIONS],
    description: `Alle belangrijke meldingen`,
    keywords: ['Nieuws', 'Updates', 'Status', 'Betalen', 'Overzicht'],
  },
  {
    url: AppRoutes.BRP,
    title: DocumentTitles[AppRoutes.BRP],
    description: `In de Basisregistratie Personen legt de gemeente persoonsgegevens over
          u vast. Het gaat hier bijvoorbeeld om uw naam, adres, geboortedatum of
          uw burgerlijke staat.`,
    keywords: [
      'gegevens',
      'profiel',
      'bevolkingsregister',
      'uittreksel',
      'adressen',
      'woningen',
      'partners',
      'huwelijk',
      'wijzigen',
      'adreswijziging',
      'aangifte',
      'verhuizen',
      'kinderen',
    ],
  },
  {
    url: AppRoutes.KVK,
    title: DocumentTitles[AppRoutes.KVK],
    description: `Hier ziet u hoe uw onderneming ingeschreven staat in het
          Handelsregister van de Kamer van Koophandel. In dat register staan
          onder meer uw bedrijfsnaam, vestigingsadres en KvK-nummer.`,
    keywords: [
      'Zakelijk',
      'gegevens',
      'bedrijf',
      'zzp',
      'kvk',
      'kamer van koophandel',
      'handelsregister',
      'bedrijfsgegevens',
      'Onderneming',
      'Mijn gegevens',
      'Vestigingen',
      'Handelsnamen',
      'Hoofdvestiging',
      'Functionarissen',
    ],
  },
  {
    url: AppRoutes.BUURT,
    title: DocumentTitles[AppRoutes.BUURT],
    description: `Een overzicht van gemeentelijke informatie rond uw eigen woning of bedrijf.`,
    keywords: [
      'kaart',
      'map',
      'Afvalcontainers',
      'vergunningen',
      'Bekendmakingen',
      'Bouwvergunning',
      'Evenementen',
      'Evenement',
      'Investeringszone',
      'Investering',
      'Omgeving',
      'Parken',
      'Fitness',
      'Zwemmen',
      'Zwembaden',
    ],
  },
  {
    url: AppRoutes.TIPS,
    title: DocumentTitles[AppRoutes.TIPS],
    description: `Tips over voorzieningen en activiteiten in Amsterdam.`,
    keywords: [
      'Tips',
      'Index van alle tip titels + beschrijvingen doorzoeken?',
      'Persoonlijk',
      'Gegevens',
    ],
  },
  {
    url: AppRoutes.AFVAL,
    title: DocumentTitles[AppRoutes.AFVAL],
    description: ` Bekijk waar u uw afval kwijt kunt en hoe u uw afval kunt scheiden.`,
    keywords: [
      'Containers',
      'Afval containers',
      'Afvalcontainers',
      'Grofvuilen ophalen',
      'Ophaaldagen',
      'Afvalbrengplaats',
      'Milieustraat',
      'Afvalstraat',
      'Afval wegbrngen',
      'Afval Inlveren',
      'Verf',
      'Puin storten',
      'Dichtbij afval',
    ],
  },
  {
    url: AppRoutes.ACCESSIBILITY,
    title: DocumentTitles[AppRoutes.ACCESSIBILITY],
    description: `Hieronder vind u een overzicht van uw aanvragen voor toeristische verhuur.`,
    keywords: [
      'A11Y',
      'WCAG',
      'Blind',
      'SZ',
      'Slechtziend',
      'Grote letters',
      'Tekstgrootte',
      'Contrast',
    ],
  },
  {
    url: AppRoutes.VERGUNNINGEN,
    title: DocumentTitles[AppRoutes.VERGUNNINGEN],
    description: `Een overzicht van uw aanvragen voor vergunningen en ontheffingen bij gemeente Amsterdam.`,
    keywords: ['Vergunningen', 'Aanvragen', 'Vergunning'],
  },
  {
    url: AppRoutes.TOERISTISCHE_VERHUUR,
    title: DocumentTitles[AppRoutes.TOERISTISCHE_VERHUUR],
    description: `Hieronder vind u een overzicht van uw aanvragen voor toeristische verhuur.`,
    keywords: [
      'Airbnb',
      'Verhuur',
      'Vakantie verhuur',
      'Vakantieverhuur',
      'Vakantiewoning',
      'Kamer verhuren',
      'Toeristen',
      'Bed Breakfast',
      'B&B',
      'Vergunning',
      'Afmelden',
      'Verhuur plannen',
      'Cancel verhuur',
      'Afmelden',
    ],
  },
  {
    url: AppRoutes.BELASTINGEN,
    title: 'Belastingen',
    description: `Een overzicht van de belastingen.`,
    keywords: [
      'Incasso',
      'Belasting',
      'Betalen',
      'Gemeente belasting',
      'iDeal betalen',
      'Boete',
    ],
  },
  {
    url: AppRoutes.ERFPACHT,
    title: 'Erfpacht',
    description: `Een overzicht van de erfpacht.`,
    keywords: ['Erfpacht', 'Canon', 'Afkopen', 'Betalen'],
  },
  {
    url: AppRoutes.MILIEUZONE,
    title: 'Milieuzone',
    description: `Een overzicht van milieuzone.`,
    keywords: ['Milieuzone', 'Ontheffing'],
  },
];

export const dynamicSearchIndex: PageEntry[] = [];

interface ApiSearchConfig {
  keywordSourceProps:
    | string[]
    | ((item: any, config: ApiSearchConfig) => string[]);
  description: string | ((item: any, config: ApiSearchConfig) => string);
  title: string | ((item: any, config: ApiSearchConfig) => string);
  url: string | ((item: any, config: ApiSearchConfig) => string);
}

export const apiSearchConfigs: Record<string, ApiSearchConfig> = {
  VERGUNNINGEN: {
    keywordSourceProps: (vergunning: Vergunning): string[] => {
      const props = ['caseType', 'title', 'status'];
      switch (vergunning.caseType) {
        case 'Evenement melding':
          return props.concat(['eventType', 'activities', 'location']);
        default:
          return props;
      }
    },
    title: (vergunning: Vergunning) => {
      return vergunning.link.title;
    },
    url: (vergunning: Vergunning) => {
      return vergunning.link.to;
    },
    description: (vergunning: Vergunning) => {
      return `Bekijk uw aanvraag ${vergunning.caseType} met gemeentelijk zaaknummer ${vergunning.identifier}`;
    },
  },
};

export function generateSearchIndexPageEntry(
  item: any,
  config: ApiSearchConfig
) {
  const keywordSourceProps =
    typeof config.keywordSourceProps === 'function'
      ? config.keywordSourceProps(item, config)
      : config.keywordSourceProps;
  const title =
    typeof config.title === 'function'
      ? config.title(item, config)
      : config.title;
  const description =
    typeof config.description === 'function'
      ? config.description(item, config)
      : config.description;
  const url =
    typeof config.url === 'function' ? config.url(item, config) : config.url;

  return {
    keywords: Object.values(pick(item, keywordSourceProps)),
    title,
    description,
    url,
  };
}

export function generateSearchIndexPageEntries(
  apiName: string,
  data: any
): PageEntry[] {
  const config = apiSearchConfigs[apiName];

  if (Array.isArray(data)) {
    return data.map((item) => {
      return generateSearchIndexPageEntry(item, config);
    });
  }

  return [generateSearchIndexPageEntry(data, config)];
}

export function addItemsToSearchIndex(apiName: string, data: any): void {
  const pageEntries = generateSearchIndexPageEntries(apiName, data);
  // TODO: Check of data has already been added
  console.info(
    `Added ${pageEntries.length} ${apiName} items to the search index.`
  );
  dynamicSearchIndex.push(...pageEntries);
}

interface AmsterdamSearchResult {
  title: string;
  sections: string[];
  description: string;
  url: string;
}

let activeSource: CancelTokenSource;

export async function addAmsterdamResults(
  keywords: string,
  resultCountPerPage: number = 5
) {
  if (activeSource) {
    activeSource.cancel('Search renewed');
  }
  activeSource = axios.CancelToken.source();
  const response = await axios.get(
    `https://api.swiftype.com/api/v1/public/engines/suggest.json?q=${keywords}&engine_key=zw32MDuzZjzNC8VutizD&per_page=${resultCountPerPage}`,
    {
      cancelToken: activeSource.token,
      transformResponse: (responseData) => {
        if (Array.isArray(responseData?.records?.page)) {
          return responseData.records.page.map(
            (page: AmsterdamSearchResult) => {
              return {
                title: page.title,
                keywords: page.sections,
                description: page.description,
                url: page.url,
              };
            }
          );
        }
        return [];
      },
    }
  );
  return response.data;
}
