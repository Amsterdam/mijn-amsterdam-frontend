import { AppRoutes } from '../../universal/config/routing';
import { ChapterTitles } from '../../universal/config/chapter';

export const PageTitleMain = 'Mijn Amsterdam';

// Used in <html><head><title>{PageTitle}</title></head>
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
  [AppRoutes.BRP]: `Profiel`,
  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.PROCLAIMER]: `Proclaimer`,
  [AppRoutes.TIPS]: `Mijn Tips | overzicht`,
  [AppRoutes.NOTIFICATIONS]: `${ChapterTitles.NOTIFICATIONS} | overzicht`,
  [AppRoutes.AFVAL]: `${ChapterTitles.AFVAL} rond uw adres`,
};
