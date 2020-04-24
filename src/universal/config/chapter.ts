// Within the team we call these Themes
export type Chapter =
  | 'AFVAL'
  | 'BELASTINGEN'
  | 'BURGERZAKEN'
  | 'BUURT'
  | 'INKOMEN'
  | 'BRP'
  | 'MILIEUZONE'
  | 'NOTIFICATIONS'
  | 'ROOT'
  | 'TIPS'
  | 'ERFPACHT'
  | 'ZORG'
  | string;

export const Chapters: Record<Chapter, Chapter> = {
  AFVAL: 'AFVAL',
  BELASTINGEN: 'BELASTINGEN',
  BURGERZAKEN: 'BURGERZAKEN',
  BUURT: 'BUURT',
  INKOMEN: 'INKOMEN',
  BRP: 'BRP',
  MILIEUZONE: 'MILIEUZONE',
  NOTIFICATIONS: 'NOTIFICATIONS',
  ROOT: 'ROOT',
  TIPS: 'TIPS',
  ERFPACHT: 'ERFPACHT',
  ZORG: 'ZORG',
};

// These are used for PageHeadings and link title props for example.
export const ChapterTitles: { [chapter in Chapter]: string } = {
  AFVAL: 'Afval',
  BELASTINGEN: 'Belastingen',
  BURGERZAKEN: 'Burgerzaken',
  BUURT: 'Mijn buurt',
  INKOMEN: 'Inkomen en Stadspas',
  BRP: 'Mijn gegevens',
  MILIEUZONE: 'Milieuzone',
  NOTIFICATIONS: 'Actueel',
  ROOT: 'Home',
  TIPS: 'Mijn tips',
  ERFPACHT: 'Erfpacht',
  ZORG: 'Zorg en ondersteuning',
};
