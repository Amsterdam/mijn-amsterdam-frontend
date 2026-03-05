// @ts-expect-error It is otherwise required to update the module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import { IS_DEVELOPMENT } from '../../universal/config/env';

// Is mutated by the Appconfiguration. Locally this object will be used as is.
const featureToggle = {
  'AFIS.EMandates': true,
  'AMSAPP.notificationService': true,
  'AVG.active': true,
  'BELASTINGEN.api.active': true,
  'BEZWAREN.active': true,
  'BRP.active': true,
  'BRP.aantalBewonersOpAdresTonen': true,
  'COBROWSE.active': false,
  'CONTACTMOMENTEN.active': true,
  'DB.sessions.enabled': true,
  'DECOS.service.active': true,
  'DEV.adHocDependencyRequestCacheTtlMs': !IS_DEVELOPMENT,
  'DEV.passQueryParamsToStreamUrl': !IS_DEVELOPMENT,
  'EHERKENNING.active': true,
  'EHERKENNING.ketenmachtiging.active': !IS_DEVELOPMENT,
  'ERFPACHT.active': true,
  'ERFPACHT.canonmatigingLinkActive': true,
  'HORECA.active': true,
  'INKOMEN.active': true,
  'KLACHTEN.active': true,
  'KREFIA.active': true,
  'KVK.active': true,
  'OIDC.logoutHint.active': true,
  'PARKEREN.active': true,
  'PARKEREN.checkForProductAndPermits.active': !IS_DEVELOPMENT,
  'POWERBROWSER.active': true,
  'SUBSIDIE.active': true,
  'TOERISTISCHEVERHUUR.active': true,
  'USER_FEEDBACK.fetchSurvey': true,
  'MILIEUZONE.active': true,
  'VERGUNNINGEN.active': true,
  'VTH.onPowerbrowser.active': IS_DEVELOPMENT,
  'ZORGNED.documentAttachments.active': true,
  'ZORGNED.documentDecisionDate.active': true,
  'ZORGV2.themapagina.active': true,
};
// globalThis is used to make sure featureToggles imported from frontend *-thema-configs have access.
globalThis.MA_FEATURETOGGLES = featureToggle;

export type FeatureToggles = typeof featureToggle;
export type FeatureToggleKey = keyof FeatureToggles;

export function getAllFeatureToggles(): Readonly<FeatureToggles> {
  return featureToggle;
}

export function isEnabled(featureToggleKey: FeatureToggleKey): boolean {
  if (!(featureToggleKey in featureToggle)) {
    console.warn(
      `Feature toggle \x1b[1m\x1b[31m ${featureToggleKey}\x1b[0m is not defined`
    );
  }
  return featureToggle[featureToggleKey];
}

export async function startAppConfiguration() {
  const connectionString = process.env.APPCONFIGURATION_CONNECTION_STRING;
  if (!connectionString) {
    if (IS_DEVELOPMENT) {
      return;
    }
    throw Error(
      'Environment variable APPCONFIGURATION_CONNECTION_STRING is not defined'
    );
  }
  const appConfig = await load(connectionString, {
    featureFlagOptions: {
      enabled: true,
      refresh: {
        enabled: false,
      },
    },
  });
  const featureManager = new FeatureManager(
    new ConfigurationMapFeatureFlagProvider(appConfig)
  );
  const names = (await featureManager.listFeatureNames()) as FeatureToggleKey[];
  for (const name of names) {
    featureToggle[name] = await featureManager.isEnabled(name);
  }
}
