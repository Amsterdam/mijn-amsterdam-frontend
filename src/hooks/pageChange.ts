import { AppRoutes, ChapterTitles } from 'config/App.constants';
import { useEffect } from 'react';
import { matchPath } from 'react-router-dom';
import useRouter from 'use-react-router';
import { trackPageView } from './analytics.hook';

export const PageTitleMain = 'Mijn Amsterdam';

const PageTitles = {
  [AppRoutes.ROOT]: 'Home | Dashboard',
  [AppRoutes.BURGERZAKEN]: ChapterTitles.BURGERZAKEN,
  [AppRoutes.BELASTINGEN]: ChapterTitles.BELASTINGEN,
  [AppRoutes.ZORG]: `${ChapterTitles.ZORG} overzicht`,
  [AppRoutes['ZORG/VOORZIENINGEN']]: `Voorziening | ${ChapterTitles.ZORG}`,
  [AppRoutes.JEUGDHULP]: `${ChapterTitles.JEUGDHULP} | overzicht`,
  [AppRoutes.INKOMEN]: `${ChapterTitles.INKOMEN} | overzicht`,
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]: `Bijstandsuitkering`,
  [AppRoutes['INKOMEN/STADSPAS']]: `Stadspas | ${ChapterTitles.INKOMEN}`,
  [AppRoutes[
    'INKOMEN/BIJZONDERE_BIJSTAND'
  ]]: `Bijzondere bijstand | ${ChapterTitles.INKOMEN}`,
  [AppRoutes.PROFILE]: `Profiel`,
  [AppRoutes.MY_AREA]: `Mijn buurt`,
  [AppRoutes.PROCLAIMER]: `Proclaimer`,
  [AppRoutes.MY_TIPS]: `Mijn Tips | overzicht`,
  [AppRoutes.MY_NOTIFICATIONS]: `${ChapterTitles.MELDINGEN} | overzicht`,
  [AppRoutes.AFVAL]: `${ChapterTitles.AFVAL} rond uw adres`,
};

const CustomTrackingUrls = {
  [AppRoutes.ROOT]: 'https://mijn.amsterdam.nl/home',
};

const ExcludePageViewTrackingUrls = [AppRoutes.API_LOGIN];

const sortedPageTitleRoutes = Object.keys(PageTitles).sort((a, b) => {
  if (a.length === b.length) {
    return 0;
  }
  return a.length < b.length ? 1 : -1;
});

export default function usePageChange() {
  const { location } = useRouter();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Change Page title on route change
    const index = sortedPageTitleRoutes.findIndex(route => {
      return (
        location.pathname === route ||
        !!matchPath(location.pathname, {
          path: route,
          exact: true,
          strict: false,
        })
      );
    });

    const route = sortedPageTitleRoutes[index];

    const title = index !== -1 ? PageTitles[route] : PageTitleMain;

    document.title = title;

    if (!ExcludePageViewTrackingUrls.includes(location.pathname)) {
      trackPageView(
        title,
        CustomTrackingUrls[location.pathname] || location.pathname
      );
    }
  }, [location.pathname]);
}
