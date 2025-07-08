import { isInkomenThemaActive } from './Inkomen-helpers.ts';
import { routeConfig, themaId, themaTitle } from './Inkomen-thema-config.ts';
import { InkomenDetailBbz } from './InkomenDetailBbz.tsx';
import { InkomenDetailTonk } from './InkomenDetailTonk.tsx';
import { InkomenDetailTozo } from './InkomenDetailTozo.tsx';
import { InkomenDetailUitkering } from './InkomenDetailUitkering.tsx';
import { default as InkomenIcon } from './InkomenIcon.svg?react';
import { InkomenList } from './InkomenList.tsx';
import { InkomenListSpecificaties } from './InkomenListSpecificaties.tsx';
import { InkomenThema } from './InkomenThema.tsx';
import { FeatureToggle } from '../../../../universal/config/feature-toggles.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const InkomenRoutes = [
  {
    route: routeConfig.detailPageTozo.path,
    Component: InkomenDetailTozo,
  },
  {
    route: routeConfig.detailPageTonk.path,
    Component: InkomenDetailTonk,
  },
  {
    route: routeConfig.listPageSpecificaties.path,
    Component: InkomenListSpecificaties,
  },
  {
    route: routeConfig.detailPageUitkering.path,
    Component: InkomenDetailUitkering,
  },
  {
    route: routeConfig.detailPageBbz.path,
    Component: InkomenDetailBbz,
    isActive: FeatureToggle.inkomenBBZActive,
  },
  { route: routeConfig.listPage.path, Component: InkomenList },
  { route: routeConfig.themaPage.path, Component: InkomenThema },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: ['private'],
  isActive: isInkomenThemaActive,
  IconSVG: InkomenIcon,
};
