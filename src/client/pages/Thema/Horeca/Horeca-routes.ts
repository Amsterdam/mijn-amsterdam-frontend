import { HorecaThemaPagina } from './Horeca';
import { HorecaDetailPagina } from './HorecaDetail';
import { HorecaLijstPagina } from './HorecaList';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const HorecaRoutes = [
  {
    route: '/horeca/lijst/:kind/:page?',
    Component: HorecaLijstPagina,
    isActive: FeatureToggle.horecaActive,
  },
  {
    route: '/horeca/:caseType/:id',
    Component: HorecaDetailPagina,
    isActive: FeatureToggle.horecaActive,
  },
  {
    route: '/horeca/',
    Component: HorecaThemaPagina,
    isActive: FeatureToggle.horecaActive,
  },
];
