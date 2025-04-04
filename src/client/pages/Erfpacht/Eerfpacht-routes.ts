import { ErfpachtDossierDetail } from './DossierDetail/ErfpachtDossierDetail';
import { Erfpacht } from './Erfpacht';
import { ErfpachtDossiers } from './ErfpachtDossiers';
import { ErfpachtFacturen } from './ErfpachtFacturen';
import { ErfpachtOpenFacturen } from './ErfpachtOpenFacturen';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

export const ErfpachtRoutes = [
  {
    route: '/erfpacht/lijst/open-facturen/:page?',
    Component: ErfpachtOpenFacturen,
    isActive: FeatureToggle.erfpachtActive,
  },
  {
    route: '/erfpacht/facturen/lijst/:dossierNummerUrlParam/:page?',
    Component: ErfpachtFacturen,
    isActive: FeatureToggle.erfpachtActive,
  },
  {
    route: '/erfpacht/dossiers/:page?',
    Component: ErfpachtDossiers,
    isActive: FeatureToggle.erfpachtActive,
  },
  {
    route: '/erfpacht/dossier/:dossierNummerUrlParam',
    Component: ErfpachtDossierDetail,
    isActive: FeatureToggle.erfpachtActive,
  },
  {
    route: '/erfpacht',
    Component: Erfpacht,
    isActive: FeatureToggle.erfpachtActive,
  },
];
