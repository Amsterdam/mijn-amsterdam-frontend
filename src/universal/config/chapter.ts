// Within the team we call these Themes
export type Chapter =
  | 'AFVAL'
  | 'BELASTINGEN'
  | 'BURGERZAKEN'
  | 'BUURT'
  | 'INKOMEN'
  | 'MIJN_GEGEVENS'
  | 'MILIEUZONE'
  | 'NOTIFICATIONS'
  | 'ROOT'
  | 'TIPS'
  | 'WONEN'
  | 'ZORG'
  | string;

export const Chapters: Record<Chapter, Chapter> = {
  AFVAL: 'AFVAL',
  BELASTINGEN: 'BELASTINGEN',
  BURGERZAKEN: 'BURGERZAKEN',
  BUURT: 'BUURT',
  INKOMEN: 'INKOMEN',
  MIJN_GEGEVENS: 'MIJN_GEGEVENS',
  MILIEUZONE: 'MILIEUZONE',
  NOTIFICATIONS: 'NOTIFICATIONS',
  ROOT: 'ROOT',
  TIPS: 'TIPS',
  WONEN: 'WONEN',
  ZORG: 'ZORG',
};

// These are used for PageHeadings and link title props for example.
export const ChapterTitles: { [chapter in Chapter | 'MY_CASES']: string } = {
  AFVAL: 'Afval',
  BELASTINGEN: 'Belastingen',
  BURGERZAKEN: 'Burgerzaken',
  BUURT: 'Mijn buurt',
  INKOMEN: 'Inkomen en Stadspas',
  MIJN_GEGEVENS: 'Mijn gegevens',
  MILIEUZONE: 'Milieuzone',
  MY_CASES: 'Lopende zaken',
  NOTIFICATIONS: 'Actueel',
  ROOT: 'Home',
  TIPS: 'Mijn tips',
  WONEN: 'Erfpacht',
  ZORG: 'Zorg en ondersteuning',
};
