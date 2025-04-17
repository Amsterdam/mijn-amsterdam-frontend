import { ToeristscheVerhuurThema } from './ToeristischeVerhuur';
import { ToeristischeVerhuurDetailPagina } from './ToeristischeVerhuurDetail';
import { ToeristischeVerhuurVergunningen } from './ToeristischeVerhuurVergunningenList';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

export const ToeristischeVerhuurRoutes = [
  {
    route: '/toeristische-verhuur/vergunning/lijst/:kind/:page?',
    Component: ToeristischeVerhuurVergunningen,
    isActive: FeatureToggle.toeristischeVerhuurActive,
  },
  {
    route: '/toeristische-verhuur/vergunning/:caseType/:id',
    Component: ToeristischeVerhuurDetailPagina,
    isActive: FeatureToggle.toeristischeVerhuurActive,
  },
  {
    route: '/toeristische-verhuur',
    Component: ToeristscheVerhuurThema,
    isActive: FeatureToggle.toeristischeVerhuurActive,
  },
];
