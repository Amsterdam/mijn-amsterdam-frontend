import { ReactComponent as IconBelastingen } from 'assets/icons/belastingen.svg';
import { ReactComponent as IconMyNotifications } from 'assets/icons/Bell.svg';
import { ReactComponent as IconBurgerZaken } from 'assets/icons/burgerzaken.svg';
import { ReactComponent as IconGarbage } from 'assets/icons/Huisvuilkalender.svg';
import { ReactComponent as IconInkomen } from 'assets/icons/inkomen.svg';
import { ReactComponent as IconMijnGegevens } from 'assets/icons/MijnGegevens.svg';
import { ReactComponent as IconMilieuzone } from 'assets/icons/milieuzone.svg';
import { ReactComponent as IconTips } from 'assets/icons/Tip.svg';
import { ReactComponent as IconWonen } from 'assets/icons/wonen.svg';
import { ReactComponent as IconZorg } from 'assets/icons/zorg.svg';
import { MenuItem } from 'components/MainNavBar/MainNavBar.constants';
import { ExternalUrls } from './App.constants';
import { AppRoutes } from './Routing.constants';

// Within the team we call these Themes
export type Chapter =
  | 'ROOT'
  | 'BURGERZAKEN'
  | 'WONEN'
  | 'BELASTINGEN'
  | 'ZORG'
  | 'INKOMEN'
  | 'UPDATES'
  | 'MIJN_BUURT'
  | 'MIJN_TIPS'
  | 'MIJN_GEGEVENS'
  | 'MILIEUZONE'
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
  UPDATES: 'UPDATES',
  MIJN_TIPS: 'MIJN_TIPS',
  AFVAL: 'AFVAL',
  MILIEUZONE: 'MILIEUZONE',
};

// These are used for PageHeadings and link title props for example.
export const ChapterTitles: { [chapter in Chapter | 'MY_CASES']: string } = {
  INKOMEN: 'Inkomen en Stadspas',
  BURGERZAKEN: 'Burgerzaken',
  BELASTINGEN: 'Belastingen',
  WONEN: 'Erfpacht',
  ZORG: 'Zorg en ondersteuning',
  ROOT: 'Home',
  UPDATES: 'Actueel',
  MIJN_GEGEVENS: 'Mijn gegevens',
  MIJN_BUURT: 'Mijn buurt',
  MIJN_TIPS: 'Mijn tips',
  AFVAL: 'Afval',
  MILIEUZONE: 'Milieuzone',
  MY_CASES: 'Lopende zaken',
};

export const ChapterIcons: {
  [chapter in Chapter]: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
} = {
  AFVAL: IconGarbage,
  MIJN_TIPS: IconTips,
  WONEN: IconWonen,
  INKOMEN: IconInkomen,
  BELASTINGEN: IconBelastingen,
  ZORG: IconZorg,
  UPDATES: IconMyNotifications,
  MIJN_GEGEVENS: IconMijnGegevens,
  MILIEUZONE: IconMilieuzone,
  ROOT: IconBurgerZaken,
  MIJN_BUURT: IconBurgerZaken,
  BURGERZAKEN: IconBurgerZaken,
};

export const myChaptersMenuItems: MenuItem[] = [
  {
    title: ChapterTitles.MIJN_GEGEVENS,
    id: Chapters.MIJN_GEGEVENS,
    to: AppRoutes.MIJN_GEGEVENS,
    Icon: ChapterIcons[Chapters.MIJN_GEGEVENS],
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    Icon: ChapterIcons[Chapters.BELASTINGEN],
    rel: 'external',
  },
  {
    title: ChapterTitles.BURGERZAKEN,
    id: Chapters.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    Icon: ChapterIcons[Chapters.BURGERZAKEN],
  },
  {
    title: ChapterTitles.WONEN,
    id: Chapters.WONEN,
    to: ExternalUrls.SSO_ERFPACHT || '',
    Icon: ChapterIcons[Chapters.WONEN],
    rel: 'external',
  },

  {
    title: ChapterTitles.ZORG,
    id: Chapters.ZORG,
    to: AppRoutes.ZORG,
    Icon: ChapterIcons[Chapters.ZORG],
  },
  {
    title: ChapterTitles.INKOMEN,
    id: Chapters.INKOMEN,
    to: AppRoutes.INKOMEN,
    Icon: ChapterIcons[Chapters.INKOMEN],
  },
  {
    title: ChapterTitles.AFVAL,
    id: Chapters.AFVAL,
    to: AppRoutes.AFVAL,
    Icon: ChapterIcons[Chapters.AFVAL],
  },
  {
    title: ChapterTitles.MILIEUZONE,
    id: Chapters.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    Icon: ChapterIcons[Chapters.MILIEUZONE],
    rel: 'external',
  },
];
