import { InkomenThemaPagina } from './Inkomen';
import { InkomenDetailBbz } from './InkomenDetailBbz';
import { InkomenDetailTonk } from './InkomenDetailTonk';
import { InkomenDetailTozo } from './InkomenDetailTozo';
import { InkomenDetailUitkering } from './InkomenDetailUitkering';
import { InkomenLijstPagina } from './InkomenListPage';
import { InkomenSpecificaties } from './InkomenSpecificaties';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const InkomenRoutes = [
  { route: '/inkomen/tozo/:version/:id', Component: InkomenDetailTozo },
  { route: '/inkomen/tonk/:version/:id', Component: InkomenDetailTonk },
  {
    route: '/inkomen/specificaties/lijst/:kind/:page?',
    Component: InkomenSpecificaties,
  },
  {
    route: '/inkomen/bijstandsuitkering/:id',
    Component: InkomenDetailUitkering,
  },
  {
    route: '/inkomen/bbz/:version/:id',
    Component: InkomenDetailBbz,
    isActive: FeatureToggle.inkomenBBZActive,
  },
  { route: '/inkomen/:kind/:page?', Component: InkomenLijstPagina },
  { route: '/inkomen', Component: InkomenThemaPagina },
];
