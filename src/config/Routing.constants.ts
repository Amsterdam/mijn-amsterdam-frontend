import { ChapterTitles } from './Chapter.constants';

export const PageTitleMain = 'Mijn Amsterdam';

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  WONEN: '/wonen',
  BELASTINGEN: '/belastingen',
  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',
  INKOMEN: '/werk-en-inkomen',
  'INKOMEN/STADSPAS': '/werk-en-inkomen/stadspas/:id',
  'INKOMEN/BIJSTANDSUITKERING': '/werk-en-inkomen/bijstandsuitkering/:id',
  'INKOMEN/BIJZONDERE_BIJSTAND': '/werk-en-inkomen/bijzondere-bijstand/:id',
  'INKOMEN/SPECIFICATIES': '/werk-en-inkomen/specificaties',
  MIJN_GEGEVENS: '/persoonlijke-gegevens',
  MIJN_BUURT: '/buurt',
  ABOUT: '/over-mijn-amsterdam',
  PROCLAIMER: '/proclaimer',
  API_LOGIN: '/api/login',
  MIJN_TIPS: '/overzicht-tips',
  MELDINGEN: '/overzicht-meldingen',
  AFVAL: '/afval',
};

export const PublicRoutes = [AppRoutes.PROCLAIMER, AppRoutes.API_LOGIN];
export const PrivateRoutes = Object.values(AppRoutes).filter(
  path => !PublicRoutes.includes(path)
);

export const PageTitles = {
  [AppRoutes.ROOT]: 'Home | Dashboard',
  [AppRoutes.BURGERZAKEN]: ChapterTitles.BURGERZAKEN,
  [AppRoutes.BELASTINGEN]: ChapterTitles.BELASTINGEN,
  [AppRoutes.ZORG]: `${ChapterTitles.ZORG} overzicht`,
  [AppRoutes['ZORG/VOORZIENINGEN']]: `Voorziening | ${ChapterTitles.ZORG}`,
  [AppRoutes.INKOMEN]: `${ChapterTitles.INKOMEN} | overzicht`,
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]: `Bijstandsuitkering`,
  [AppRoutes['INKOMEN/STADSPAS']]: `Stadspas | ${ChapterTitles.INKOMEN}`,
  [AppRoutes[
    'INKOMEN/BIJZONDERE_BIJSTAND'
  ]]: `Bijzondere bijstand | ${ChapterTitles.INKOMEN}`,
  [AppRoutes.MIJN_GEGEVENS]: `Profiel`,
  [AppRoutes.MIJN_BUURT]: `Mijn buurt`,
  [AppRoutes.PROCLAIMER]: `Proclaimer`,
  [AppRoutes.MIJN_TIPS]: `Mijn Tips | overzicht`,
  [AppRoutes.MELDINGEN]: `${ChapterTitles.MELDINGEN} | overzicht`,
  [AppRoutes.AFVAL]: `${ChapterTitles.AFVAL} rond uw adres`,
};

export const CustomTrackingUrls = {
  [AppRoutes.ROOT]: 'https://mijn.amsterdam.nl/home',
};
