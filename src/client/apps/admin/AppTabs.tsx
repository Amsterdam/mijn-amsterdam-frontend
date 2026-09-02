import { TabNavigation } from '@amsterdam/design-system-react';
import { useLocation } from 'react-router';

import { themaConfig as themaConfigHome } from './Pages/Home/Home-thema-config.ts';
// import { themaConfig as themaConfigUserFeedback } from './Pages/UserFeedback/UserFeedback-thema-config.ts';
import { MaRouterLink } from '../../components/MaLink/MaLink.tsx';

const appTabLinks = [
  {
    title: themaConfigHome.title,
    href: themaConfigHome.route.path,
  },
  // {
  //   title: themaConfigUserFeedback.title,
  //   href: themaConfigUserFeedback.route.path,
  // },
];

export function AppTabs() {
  const location = useLocation();
  return (
    <TabNavigation>
      <TabNavigation.List>
        {appTabLinks.map(({ title, href }) => (
          <TabNavigation.Link
            key={href}
            href={href}
            linkComponent={MaRouterLink}
            aria-current={location.pathname === href ? 'page' : undefined}
          >
            {title}
          </TabNavigation.Link>
        ))}
      </TabNavigation.List>
    </TabNavigation>
  );
}
