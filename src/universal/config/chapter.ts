import { AppRoute, AppRoutes, TrackingConfig } from './routes';

// Within the team we call these Themes
export type Chapter =
  | 'AFVAL'
  | 'BELASTINGEN'
  | 'BURGERZAKEN'
  | 'BUURT'
  | 'BEZWAREN'
  | 'INKOMEN'
  | 'INKOMEN_SVWI'
  | 'STADSPAS'
  | 'BRP'
  | 'MILIEUZONE'
  | 'NOTIFICATIONS'
  | 'ROOT'
  | 'ERFPACHT'
  | 'ZORG'
  | 'VERGUNNINGEN'
  | 'KVK'
  | 'SIA'
  | 'TOERISTISCHE_VERHUUR'
  | 'SEARCH'
  | 'SUBSIDIE'
  | 'PARKEREN'
  | 'KLACHTEN'
  | 'HORECA'
  | 'KREFIA'
  | 'AVG'
  | 'BODEM'
  | string;

export const Chapters: Record<Chapter, Chapter> = {
  AFVAL: 'AFVAL',
  BELASTINGEN: 'BELASTINGEN',
  BURGERZAKEN: 'BURGERZAKEN',
  BUURT: 'BUURT',
  BEZWAREN: 'BEZWAREN',
  INKOMEN: 'INKOMEN',
  INKOMEN_SVWI: 'INKOMEN_SVWI',
  STADSPAS: 'STADSPAS',
  BRP: 'BRP',
  MILIEUZONE: 'MILIEUZONE',
  NOTIFICATIONS: 'NOTIFICATIONS',
  ROOT: 'ROOT',
  ERFPACHT: 'ERFPACHT',
  ZORG: 'ZORG',
  VERGUNNINGEN: 'VERGUNNINGEN',
  KVK: 'KVK',
  SIA: 'SIA',
  TOERISTISCHE_VERHUUR: 'TOERISTISCHE_VERHUUR',
  KREFIA: 'KREFIA',
  SEARCH: 'SEARCH',
  SUBSIDIE: 'SUBSIDIE',
  PARKEREN: 'PARKEREN',
  KLACHTEN: 'KLACHTEN',
  HORECA: 'HORECA',
  AVG: 'AVG',
  BODEM: 'BODEM',
};

// These are used for PageHeadings and link title props for example.
export const ChapterTitles: { [chapter in Chapter]: string } = {
  AFVAL: 'Afval',
  BELASTINGEN: 'Belastingen',
  BURGERZAKEN: 'Burgerzaken',
  BUURT: 'Mijn buurt',
  BEZWAREN: 'Bezwaren',
  INKOMEN: 'Inkomen',
  INKOMEN_SVWI: 'Werk & Inkomen SVWI',
  STADSPAS: 'Stadspas',
  BRP: 'Mijn gegevens',
  MILIEUZONE: 'Milieuzone',
  NOTIFICATIONS: 'Actueel',
  ROOT: 'Home',
  ERFPACHT: 'Erfpacht',
  SUBSIDIE: 'Subsidies',
  ZORG: 'Zorg en ondersteuning',
  VERGUNNINGEN: 'Vergunningen',
  VERGUNNINGEN_LOPEND: 'Vergunningen',
  VERGUNNINGEN_EERDER: 'Vergunningen',
  KVK: 'Mijn onderneming',
  SIA: 'Meldingen',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur',
  KREFIA: 'Kredietbank & FIBU',
  SEARCH: 'Zoeken',
  PARKEREN: 'Parkeren',
  KLACHTEN: 'Klachten',
  HORECA: 'Horeca',
  AVG: 'AVG persoonsgegevens',
  BODEM: 'Bodem',
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
      case config.profileType === 'private-attributes' &&
        !config.isAuthenticated:
        return 'Inloggen met yivi | Mijn Amsterdam';
      case config.profileType !== 'private-attributes' &&
        config.isAuthenticated:
        return 'Home | Dashboard';
      default:
        return 'Inloggen | Mijn Amsterdam';
    }
  },
  [AppRoutes.BURGERZAKEN]: `${ChapterTitles.BURGERZAKEN} | overzicht`,
  [AppRoutes[
    'BURGERZAKEN/ID-KAART'
  ]]: `ID-Kaart | ${ChapterTitles.BURGERZAKEN}`,
  [AppRoutes.ZORG]: `${ChapterTitles.ZORG} | overzicht`,
  [AppRoutes['ZORG/VOORZIENINGEN']]: `Voorziening | ${ChapterTitles.ZORG}`,
  [AppRoutes.INKOMEN]: `${ChapterTitles.INKOMEN} | overzicht`,
  [AppRoutes[
    'INKOMEN/BIJSTANDSUITKERING'
  ]]: `Bijstandsuitkering | ${ChapterTitles.INKOMEN}`,
  [AppRoutes.STADSPAS]: `Stadspas | overzicht`,
  [AppRoutes['STADSPAS/AANVRAAG']]: `Stadspas | ${ChapterTitles.INKOMEN}`,
  [AppRoutes['STADSPAS/SALDO']]: `Stadspas saldo | ${ChapterTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/TOZO']]: `Tozo | ${ChapterTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/TONK']]: `TONK | ${ChapterTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/BBZ']]: `Bbz | ${ChapterTitles.INKOMEN}`,
  [AppRoutes[
    'INKOMEN/SPECIFICATIES'
  ]]: `Uitkeringsspecificaties | ${ChapterTitles.INKOMEN}`,
  [`${AppRoutes['INKOMEN/SPECIFICATIES']}/jaaropgaven`]: `Jaaropgaven | ${ChapterTitles.INKOMEN}`,
  [AppRoutes.BRP]: `Mijn gegevens`,
  [AppRoutes.ACCESSIBILITY]: `Toegankelijkheidsverklaring`,
  [AppRoutes.GENERAL_INFO]: `Dit ziet u in Mijn Amsterdam`,
  [AppRoutes.VERGUNNINGEN]: `${ChapterTitles.VERGUNNINGEN} | overzicht`,
  [AppRoutes[
    'VERGUNNINGEN/DETAIL'
  ]]: `Vergunning | ${ChapterTitles.VERGUNNINGEN}`,
  [AppRoutes.KVK]: `Mijn onderneming`,
  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.BEZWAREN]: `${ChapterTitles.BEZWAREN} | overzicht`,
  [AppRoutes['BEZWAREN/DETAIL']]: `${ChapterTitles.BEZWAREN} | bezwaar`,
  [AppRoutes.NOTIFICATIONS]: `${ChapterTitles.NOTIFICATIONS} | overzicht`,
  [AppRoutes.AFVAL]: `${ChapterTitles.AFVAL} rond uw adres`,
  [AppRoutes.SIA]: `${ChapterTitles.SIA} overzicht`,
  [AppRoutes['SIA/DETAIL/OPEN']]: `Melding open | ${ChapterTitles.SIA}`,
  [AppRoutes['SIA/DETAIL/CLOSED']]: `Melding afgesloten | ${ChapterTitles.SIA}`,
  [AppRoutes.SIA_OPEN]: `Meldingen | Alle openstaande meldingen`,
  [AppRoutes.SIA_CLOSED]: `Meldingen | Alle afgesloten meldingen`,
  [AppRoutes.TOERISTISCHE_VERHUUR]: `${ChapterTitles.TOERISTISCHE_VERHUUR} | overzicht`,
  [AppRoutes[
    'TOERISTISCHE_VERHUUR/VERGUNNING'
  ]]: `Vergunning | ${ChapterTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes[
    'TOERISTISCHE_VERHUUR/VERGUNNING/BB'
  ]]: `Vergunning Bed & Breakfast | ${ChapterTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes[
    'TOERISTISCHE_VERHUUR/VERGUNNING/VV'
  ]]: `Vergunning vakantieverhuur | ${ChapterTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes.KREFIA]: `${ChapterTitles.KREFIA}`,
  [AppRoutes.SEARCH]: `Zoeken`,
  [AppRoutes.PARKEREN]: 'Parkeren',
  [AppRoutes.KLACHTEN]: `${ChapterTitles.KLACHTEN} | overzicht`,
  [AppRoutes['KLACHTEN/KLACHT']]: `${ChapterTitles.KLACHTEN} | klacht`,
  [AppRoutes.HORECA]: 'Horeca | overzicht',
  [AppRoutes['HORECA/DETAIL']]: 'Vergunning | Horeca',
  [AppRoutes.YIVI_LANDING]: 'Inloggen met yivi | Mijn Amsterdam',
  [AppRoutes.AVG]: `${ChapterTitles.AVG} | verzoeken`,
  [AppRoutes['AVG/DETAIL']]: `${ChapterTitles.AVG} | verzoek`,
  [AppRoutes.BFF_500_ERROR]: '500 Server Error | Mijn Amsterdam',
  [AppRoutes.BODEM]: 'Bodem | overzicht',
  [AppRoutes['BODEM/LOOD_METING']]: 'Bodem | lood in de bodem-check',
  [AppRoutes.API_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API1_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API2_LOGIN]: 'Inloggen | Mijn Amsterdam',
};
