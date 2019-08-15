import { AppRoutes, ChapterTitles } from 'App.constants';
import { useEffect } from 'react';
import useRouter from 'use-react-router';
import { trackPageView } from './analytics.hook';

export const PageTitleMain = 'Mijn Amsterdam';
export const PageTitleLanding = `Login met DigID | ${PageTitleMain}`;

export const PageTitles = {
  [AppRoutes.ROOT]: `${ChapterTitles.ROOT} | ${PageTitleMain}`,
  [AppRoutes.BURGERZAKEN]: `${ChapterTitles.BURGERZAKEN} | ${PageTitleMain}`,
  [AppRoutes.BIJSTANDSUITKERING]: `Bijstandsuitkering | ${PageTitleMain}`,
  [AppRoutes.BELASTINGEN]: `${ChapterTitles.BELASTINGEN} | ${PageTitleMain}`,
  [AppRoutes.ZORG]: `${ChapterTitles.ZORG} | ${PageTitleMain}`,
  [AppRoutes.JEUGDHULP]: `${ChapterTitles.JEUGDHULP} | ${PageTitleMain}`,
  [AppRoutes.INKOMEN]: `${ChapterTitles.INKOMEN} | ${PageTitleMain}`,
  [AppRoutes.STADSPAS]: `Stadspas | ${PageTitleMain}`,

  [AppRoutes.BIJZONDERE_BIJSTAND]: `Bijzondere bijstand | ${PageTitleMain}`,
  [AppRoutes.PROFILE]: `Profiel | ${PageTitleMain}`,
  [AppRoutes.MY_AREA]: `Mijn buurt | ${PageTitleMain}`,
  [AppRoutes.PROCLAIMER]: `Proclaimer | ${PageTitleMain}`,
  [AppRoutes.MY_TIPS]: `Tips | ${PageTitleMain}`,
  [AppRoutes.MY_NOTIFICATIONS]: `${ChapterTitles.MELDINGEN} | ${PageTitleMain}`,
};

const sortedPageTitleRoutes = Object.keys(PageTitles).sort((a, b) => {
  return a.length < b.length ? 1 : 0;
});

export default function usePageChange() {
  const { location } = useRouter();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Change Page title on route change
    const index = sortedPageTitleRoutes.findIndex(route =>
      location.pathname.startsWith(route)
    );

    document.title =
      index !== -1 ? PageTitles[sortedPageTitleRoutes[index]] : PageTitleMain;

    trackPageView(document.title, location.pathname);
  }, [location.pathname]);
}
