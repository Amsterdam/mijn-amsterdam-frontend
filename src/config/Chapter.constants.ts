// Within the team we call these Themes
export type Chapter =
  | 'ROOT'
  | 'BURGERZAKEN'
  | 'WONEN'
  | 'BELASTINGEN'
  | 'ZORG'
  | 'INKOMEN'
  | 'MELDINGEN'
  | 'MIJN_BUURT'
  | 'MIJN_TIPS'
  | 'MIJN_GEGEVENS'
  | 'AFVAL';

export const Chapters: { [chapter in Chapter]: Chapter } = {
  ROOT: 'ROOT',
  MIJN_BUURT: 'MIJN_BUURT',
  BURGERZAKEN: 'BURGERZAKEN',
  MIJN_GEGEVENS: 'MIJN_GEGEVENS',
  WONEN: 'WONEN',
  BELASTINGEN: 'BELASTINGEN',
  ZORG: 'ZORG',
  INKOMEN: 'INKOMEN',
  MELDINGEN: 'MELDINGEN',
  MIJN_TIPS: 'MIJN_TIPS',
  AFVAL: 'AFVAL',
};

// These are used for PageHeadings and link title props for example.
export const ChapterTitles: { [chapter in Chapter]: string } = {
  INKOMEN: 'Werk en inkomen',
  BURGERZAKEN: 'Burgerzaken',
  BELASTINGEN: 'Belastingen',
  WONEN: 'Erfpacht',
  ZORG: 'Zorg en ondersteuning',
  ROOT: 'Home',
  MELDINGEN: 'Actueel',
  MIJN_GEGEVENS: 'Mijn gegevens',
  MIJN_BUURT: 'Mijn buurt',
  MIJN_TIPS: 'Mijn tips',
  AFVAL: 'Afval',
};
