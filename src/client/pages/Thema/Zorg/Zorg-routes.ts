import { ZorgThemaPagina } from './Zorg';
import { ZorgDetail } from './ZorgDetail';
import { ZorgList } from './ZorgList';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const ZorgRoutes = [
  { route: '/zorg-en-ondersteuning/voorziening/:id', Component: ZorgDetail },
  {
    route: '/zorg-en-ondersteuning/lijst/:kind/:page?',
    Component: ZorgList,
    isActive: FeatureToggle.zorgv2ThemapaginaActive,
  },
  {
    route: '/zorg-en-ondersteuning',
    Component: ZorgThemaPagina,
    isActive: FeatureToggle.zorgv2ThemapaginaActive,
  },
];
