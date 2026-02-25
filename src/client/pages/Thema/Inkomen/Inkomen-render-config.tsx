import { themaConfig } from './Inkomen-thema-config';
import { InkomenDetailBbz } from './InkomenDetailBbz';
import { InkomenDetailTonk } from './InkomenDetailTonk';
import { InkomenDetailTozo } from './InkomenDetailTozo';
import { InkomenDetailUitkering } from './InkomenDetailUitkering';
import { default as InkomenIcon } from './InkomenIcon.svg?react';
import { InkomenList } from './InkomenList';
import { InkomenListSpecificaties } from './InkomenListSpecificaties';
import { InkomenThema } from './InkomenThema';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import { isLoading } from '../../../../universal/helpers/api';
import { AppState } from '../../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types';

export const InkomenRoutes = [
  {
    route: themaConfig.detailPageTozo.route.path,
    Component: InkomenDetailTozo,
  },
  {
    route: themaConfig.detailPageTonk.route.path,
    Component: InkomenDetailTonk,
  },
  {
    route: themaConfig.listPageSpecificaties.route.path,
    Component: InkomenListSpecificaties,
  },
  {
    route: themaConfig.detailPageUitkering.route.path,
    Component: InkomenDetailUitkering,
  },
  {
    route: themaConfig.detailPageBbz.route.path,
    Component: InkomenDetailBbz,
    isActive: FeatureToggle.inkomenBBZActive,
  },
  { route: themaConfig.listPage.route.path, Component: InkomenList },
  { route: themaConfig.route.path, Component: InkomenThema },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  redactedScope: themaConfig.redactedScope,
  profileTypes: themaConfig.profileTypes,
  isActive: isInkomenThemaActive, // TO DO YACINE > moet deze ook in de themaConfig worden opgenomen?
  IconSVG: InkomenIcon,
};

function isInkomenThemaActive(appState: AppState): boolean {
  const { WPI_AANVRAGEN, WPI_SPECIFICATIES, WPI_TOZO, WPI_TONK, WPI_BBZ } =
    appState;
  const { jaaropgaven, uitkeringsspecificaties } =
    WPI_SPECIFICATIES?.content ?? {};
  const hasAanvragen = !!WPI_AANVRAGEN?.content?.length;
  const hasTozo = !!WPI_TOZO?.content?.length;
  const hasTonk = !!WPI_TONK?.content?.length;
  const hasBbz = !!WPI_BBZ?.content?.length;
  const hasJaaropgaven = !!jaaropgaven?.length;
  const hasUitkeringsspecificaties = !!uitkeringsspecificaties?.length;

  return (
    themaConfig.featureToggle.active &&
    !(
      isLoading(WPI_AANVRAGEN) &&
      isLoading(WPI_SPECIFICATIES) &&
      isLoading(WPI_TOZO) &&
      isLoading(WPI_TONK) &&
      isLoading(WPI_BBZ)
    ) &&
    (hasAanvragen ||
      hasTozo ||
      hasTonk ||
      hasJaaropgaven ||
      hasBbz ||
      hasUitkeringsspecificaties)
  );
}
