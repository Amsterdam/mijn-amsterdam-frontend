import { afisRoutes } from './afis.ts';
import { amsappSurveyRoutes } from './amsapp-survey.ts';
import { appAmsterdamNlRoutes } from './app-amsterdam-nl.ts';
import { belastingenRoutes } from './belastingen.ts';
import { bezwarenRoutes } from './bezwaren.ts';
import { brpRoutes } from './brp.ts';
import { cleopatraRoutes } from './cleopatra.ts';
import { cmsRoutes } from './cms.ts';
import { decosRoutes } from './decos.ts';
import { enableu2SmileRoutes } from './enableu-2-smile.ts';
import { erfpachtRoutes } from './erfpacht.ts';
import { gpassRoutes } from './gpass.ts';
import { iamDatapuntRoutes } from './iam-datapunt.ts';
import { krefiaRoutes } from './krefia.ts';
import { kvkRoutes } from './kvk.ts';
import { loodmetingenRoutes } from './loodmetingen.ts';
import { msOauthRoutes } from './ms-oauth.ts';
import { parkerenRoutes } from './parkeren.ts';
import { patroonCRoutes } from './patroon-c.ts';
import { pomRoutes } from './pom.ts';
import { powerbrowserRoutes } from './powerbrowser.ts';
import { salesforceRoutes } from './salesforce.ts';
import { searchConfigRoutes } from './search-config.ts';
import { subsidieRoutes } from './subsidie.ts';
import { svwiRoutes } from './svwi.ts';
import { toeristischeVerhuurRegistratiesRoutes } from './toeristische-verhuur-registraties.ts';
import { wpiRoutes } from './wpi.ts';
import { zorgnedRoutes } from './zorgned.ts';
import { zwdRoutes } from './zwd.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  ...afisRoutes,
  ...amsappSurveyRoutes,
  ...appAmsterdamNlRoutes,
  ...belastingenRoutes,
  ...bezwarenRoutes,
  ...brpRoutes,
  ...cleopatraRoutes,
  ...cmsRoutes,
  ...decosRoutes,
  ...kvkRoutes,
  ...enableu2SmileRoutes,
  ...erfpachtRoutes,
  ...gpassRoutes,
  ...iamDatapuntRoutes,
  ...krefiaRoutes,
  ...loodmetingenRoutes,
  ...msOauthRoutes,
  ...parkerenRoutes,
  ...patroonCRoutes,
  ...pomRoutes,
  ...powerbrowserRoutes,
  ...salesforceRoutes,
  ...searchConfigRoutes,
  ...subsidieRoutes,
  ...svwiRoutes,
  ...toeristischeVerhuurRegistratiesRoutes,
  ...wpiRoutes,
  ...zorgnedRoutes,
  ...zwdRoutes,
];
