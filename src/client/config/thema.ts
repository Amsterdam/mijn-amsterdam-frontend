import { generatePath } from 'react-router-dom';
import { AppState } from '../AppState';
import { getThemaTitleWithAppState } from '../pages/HLI/helpers';
import { LinkProps } from '../../universal/types/App.types';
import { AppRoute, AppRoutes } from '../../universal/config/routes';
import { Thema, Themas } from '../../universal/config/thema';
import { ExternalUrls } from './external-urls';
import { TrackingConfig } from './routes';

export type BagThema = `${Thema}_BAG`;

export const BagThemas: Record<Thema, BagThema> = Object.fromEntries(
  Object.entries(Themas).map(([key, key2]) => {
    return [key, `${key2}_BAG`];
  })
);

// These are used for PageHeadings and link title props for example.
export const ThemaTitles: { [thema in Thema]: string } = {
  AFIS: 'Facturen en betalen',
  AFVAL: 'Afval',
  BELASTINGEN: 'Belastingen',
  BURGERZAKEN: 'Burgerzaken',
  BUURT: 'Mijn buurt',
  BEZWAREN: 'Bezwaren',
  INKOMEN: 'Inkomen',
  STADSPAS: 'Stadspas',
  HLI: 'Stadspas en regelingen bij laag inkomen',
  BRP: 'Mijn gegevens',
  MILIEUZONE: 'Milieuzone',
  OVERTREDINGEN: 'Overtredingen voertuigen',
  NOTIFICATIONS: 'Actueel',
  ROOT: 'Home',
  ERFPACHT: 'Erfpacht',
  ERFPACHTv2: 'Erfpacht V2',
  SUBSIDIE: 'Subsidies',
  ZORG: 'Zorg en ondersteuning',
  VERGUNNINGEN: 'Vergunningen en ontheffingen',
  VERGUNNINGEN_LOPEND: 'Vergunningen',
  VERGUNNINGEN_EERDER: 'Vergunningen',
  KVK: 'Mijn onderneming',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur',
  KREFIA: 'Kredietbank & FIBU',
  SEARCH: 'Zoeken',
  PARKEREN: 'Parkeren',
  KLACHTEN: 'Klachten',
  HORECA: 'Horeca',
  AVG: 'AVG persoonsgegevens',
  BODEM: 'Bodem',
  SVWI: 'SVWI',
};

export const NOT_FOUND_TITLE = 'Pagina niet gevonden';
export const DocumentTitleMain = 'Mijn Amsterdam';
export const PageTitleMain = 'Mijn Amsterdam';

// Used in <html><head><title>{PageTitle}</title></head>
export const DocumentTitles: {
  [key in AppRoute]: string | ((config: TrackingConfig) => string);
} = {
  [AppRoutes.ROOT]: (config) => {
    switch (true) {
      case config.profileType === 'private-attributes' &&
        config.isAuthenticated:
        return 'Home | Meldingen overzicht';
      case config.profileType !== 'private-attributes' &&
        config.isAuthenticated:
        return 'Home | Dashboard';
      default:
        return 'Inloggen | Mijn Amsterdam';
    }
  },
  [AppRoutes.BURGERZAKEN]: `${ThemaTitles.BURGERZAKEN} | overzicht`,
  [AppRoutes['BURGERZAKEN/ID-KAART']]: `ID-Kaart | ${ThemaTitles.BURGERZAKEN}`,
  [AppRoutes.ZORG]: `${ThemaTitles.ZORG} | overzicht`,
  [AppRoutes['ZORG/VOORZIENINGEN']]: `Voorziening | ${ThemaTitles.ZORG}`,
  [AppRoutes.INKOMEN]: `${ThemaTitles.INKOMEN} | overzicht`,
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]:
    `Bijstandsuitkering | ${ThemaTitles.INKOMEN}`,
  [AppRoutes.STADSPAS]: `Stadspas | overzicht`,
  [AppRoutes['STADSPAS/AANVRAAG']]: `Stadspas | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['STADSPAS/SALDO']]: `Stadspas saldo | ${ThemaTitles.INKOMEN}`,

  [AppRoutes.HLI]: `Regelingen bij laag inkomen | overzicht`,
  [AppRoutes['HLI/STADSPAS']]: `Stadspas | ${ThemaTitles.HLI}`,
  [AppRoutes['HLI/REGELING']]: `Regeling | ${ThemaTitles.HLI}`,
  [AppRoutes['HLI/REGELINGEN_LIJST']]: `Regelingen | ${ThemaTitles.HLI}`,

  [AppRoutes['INKOMEN/TOZO']]: `Tozo | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/TONK']]: `TONK | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/BBZ']]: `Bbz | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/SPECIFICATIES']]:
    `Uitkeringsspecificaties | ${ThemaTitles.INKOMEN}`,
  [`${AppRoutes['INKOMEN/SPECIFICATIES']}/jaaropgaven`]: `Jaaropgaven | ${ThemaTitles.INKOMEN}`,
  [AppRoutes.BRP]: `Mijn gegevens`,
  [AppRoutes.ACCESSIBILITY]: `Toegankelijkheidsverklaring`,
  [AppRoutes.GENERAL_INFO]: `Dit ziet u in Mijn Amsterdam`,
  [AppRoutes.VERGUNNINGEN]: `${ThemaTitles.VERGUNNINGEN} | overzicht`,
  [AppRoutes['VERGUNNINGEN/LIST']]:
    `Vergunningen | ${ThemaTitles.VERGUNNINGEN}`,
  [AppRoutes['VERGUNNINGEN/DETAIL']]:
    `Vergunning | ${ThemaTitles.VERGUNNINGEN}`,
  [AppRoutes.KVK]: `Mijn onderneming`,
  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.BEZWAREN]: `${ThemaTitles.BEZWAREN} | overzicht`,
  [AppRoutes['BEZWAREN/DETAIL']]: `${ThemaTitles.BEZWAREN} | bezwaar`,
  [AppRoutes.NOTIFICATIONS]: `${ThemaTitles.NOTIFICATIONS} | overzicht`,
  [AppRoutes.AFVAL]: `${ThemaTitles.AFVAL} rond uw adres`,
  [AppRoutes.TOERISTISCHE_VERHUUR]: `${ThemaTitles.TOERISTISCHE_VERHUUR} | overzicht`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']]:
    `Vergunning | ${ThemaTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB']]:
    `Vergunning Bed & Breakfast | ${ThemaTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV']]:
    `Vergunning vakantieverhuur | ${ThemaTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes.KREFIA]: `${ThemaTitles.KREFIA}`,
  [AppRoutes.SEARCH]: `Zoeken`,
  [AppRoutes.PARKEREN]: 'Parkeren',
  [AppRoutes.KLACHTEN]: `${ThemaTitles.KLACHTEN} | overzicht`,
  [AppRoutes['KLACHTEN/KLACHT']]: `${ThemaTitles.KLACHTEN} | klacht`,
  [AppRoutes.HORECA]: 'Horeca | overzicht',
  [AppRoutes['HORECA/DETAIL']]: 'Vergunning | Horeca',
  [AppRoutes.AVG]: `${ThemaTitles.AVG} | verzoeken`,
  [AppRoutes['AVG/DETAIL']]: `${ThemaTitles.AVG} | verzoek`,
  [AppRoutes.BFF_500_ERROR]: '500 Server Error | Mijn Amsterdam',
  [AppRoutes.BODEM]: 'Bodem | overzicht',
  [AppRoutes['BODEM/LOOD_METING']]: 'Bodem | lood in de bodem-check',
  [AppRoutes.ERFPACHTv2]: 'Erfpacht | overzicht',
  [AppRoutes['ERFPACHTv2/DOSSIERS']]: 'Erfpacht | Lijst met dossiers',
  [AppRoutes['ERFPACHTv2/OPEN_FACTUREN']]: 'Erfpacht | Lijst met open facturen',
  [AppRoutes['ERFPACHTv2/ALLE_FACTUREN']]: 'Erfpacht | Lijst met facturen',
  [AppRoutes['ERFPACHTv2/DOSSIERDETAIL']]: 'Erfpacht | dossier',
  [AppRoutes.API_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API1_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API2_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.ZAAK_STATUS]: 'Status van uw Zaak | Mijn Amsterdam',
  [AppRoutes.AFIS]: 'Facturen en betalen | Mijn Amsterdam',
};

export interface ThemaMenuItem extends Omit<LinkProps, 'title'> {
  id: Thema;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
  title: LinkProps['title'] | ((appState: AppState) => string);
}

export const myThemasMenuItems: ThemaMenuItem[] = [
  {
    title: ThemaTitles.BRP,
    id: Themas.BRP,
    to: AppRoutes.BRP,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.KVK,
    id: Themas.KVK,
    to: AppRoutes.KVK,
    profileTypes: ['commercial', 'private'],
  },
  {
    title: ThemaTitles.BELASTINGEN,
    id: Themas.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.AFIS,
    id: Themas.AFIS,
    to: AppRoutes.AFIS,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.BEZWAREN,
    id: Themas.BEZWAREN,
    to: AppRoutes.BEZWAREN,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.BELASTINGEN,
    id: Themas.BELASTINGEN,
    to: ExternalUrls.EH_SSO_BELASTINGEN,
    rel: 'external',
    profileTypes: ['commercial'],
    isAlwaysVisible: true,
  },
  {
    title: ThemaTitles.BURGERZAKEN,
    id: Themas.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHT,
    id: Themas.ERFPACHT,
    to: ExternalUrls.SSO_ERFPACHT || '',
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHTv2,
    id: Themas.ERFPACHTv2,
    to: AppRoutes.ERFPACHTv2,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHTv2,
    id: Themas.ERFPACHTv2,
    to: ExternalUrls.ERFPACHTv2_ZAKELIJK,
    profileTypes: ['commercial'],
    rel: 'external',
  },
  {
    title: ThemaTitles.ERFPACHT,
    id: Themas.ERFPACHT,
    to: ExternalUrls.EH_SSO_ERFPACHT || '',
    rel: 'external',
    profileTypes: ['commercial'],
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: Themas.SUBSIDIE,
    to: `${ExternalUrls.SSO_SUBSIDIE}?authMethod=digid`,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: Themas.SUBSIDIE,
    to: `${ExternalUrls.SSO_SUBSIDIE}?authMethod=eherkenning`,
    rel: 'external',
    profileTypes: ['commercial'],
  },
  {
    title: ThemaTitles.ZORG,
    id: Themas.ZORG,
    to: AppRoutes.ZORG,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.INKOMEN,
    id: Themas.INKOMEN,
    to: AppRoutes.INKOMEN,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.SVWI,
    id: Themas.SVWI,
    to: ExternalUrls.SVWI,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.STADSPAS,
    id: Themas.STADSPAS,
    to: AppRoutes.STADSPAS,
    profileTypes: ['private'],
  },
  {
    title: (appState: AppState) => {
      return getThemaTitleWithAppState(appState);
    },
    id: Themas.HLI,
    to: AppRoutes.HLI,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.AFVAL,
    id: Themas.AFVAL,
    to: AppRoutes.AFVAL,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.VERGUNNINGEN,
    id: Themas.VERGUNNINGEN,
    to: AppRoutes.VERGUNNINGEN,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.MILIEUZONE,
    id: Themas.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    rel: 'external',
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.OVERTREDINGEN,
    id: Themas.OVERTREDINGEN,
    to: ExternalUrls.SSO_MILIEUZONE || '', // TODO: In de toekomst wordt dit een andere link
    rel: 'external',
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.TOERISTISCHE_VERHUUR,
    id: Themas.TOERISTISCHE_VERHUUR,
    to: AppRoutes.TOERISTISCHE_VERHUUR,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.KREFIA,
    id: Themas.KREFIA,
    to: AppRoutes.KREFIA,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.PARKEREN,
    id: Themas.PARKEREN,
    to: AppRoutes.PARKEREN,
    profileTypes: ['private', 'commercial'],
    hasAppStateValue: false,
  },
  {
    title: ThemaTitles.KLACHTEN,
    id: Themas.KLACHTEN,
    to: generatePath(AppRoutes.KLACHTEN, { page: 1 }),
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.HORECA,
    id: Themas.HORECA,
    to: AppRoutes.HORECA,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.AVG,
    id: Themas.AVG,
    to: generatePath(AppRoutes.AVG, { page: 1 }),
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.BODEM,
    id: Themas.BODEM,
    to: AppRoutes.BODEM,
    profileTypes: ['private', 'commercial'],
  },
];
