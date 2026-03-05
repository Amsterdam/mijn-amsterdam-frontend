// @ts-expect-error It is otherwise required to update the module resolver.
import { load } from '@azure/app-configuration-provider';
import {
  FeatureManager,
  ConfigurationMapFeatureFlagProvider,
} from '@microsoft/feature-management';

import { IS_DEVELOPMENT } from '../../universal/config/env';

// Is mutated by the Appconfiguration. Locally this object will be used as is.
const featureToggle = {
  'avg.active': true,
  'klachten.active': true,
  'belastingen.api.active': true,
  'bezwaren.active': true,
  'db.sessions.enabled': true,
  'eherkenning.ketenmachtiging.active': !IS_DEVELOPMENT,
  'eherkenning.active': true,
  'erfpacht.active': true,
  'erfpacht.endpoint.active': true,
  'afval.garbageInformationPage': true,
  'horeca.active': true,
  'inkomen.active': true,
  'krefia.active': true,
  'kvk.active': true,
  'oidc.logoutHint.active': true,
  'dev.passQueryParamsToStreamUrl': !IS_DEVELOPMENT,
  'dev.adHocDependencyRequestCacheTtlMs': !IS_DEVELOPMENT,
  'milieuzone.overtredingen.active': true,
  'milieuzone.cleopatraApi.active': true,
  'parkeren.active': true,
  'parkeren.checkForProductAndPermits.active': !IS_DEVELOPMENT,
  'subsidie.active': true,
  'contactmomenten.active': true,
  'toeristischeVerhuur.active': true,
  'powerbrowser.active': true,
  'bb.documentDownloads.active': true,
  'vergunningen.active': true,
  'decos.service.active': true,
  'zorgned.documentAttachments.active': true,
  'zorgned.documentDecisionDate.active': true,
  'zorgv2.themapagina.active': true,
  'cobrowse.active': false,
  'vth.onPowerbrowser.active': IS_DEVELOPMENT,
  // Existing toggles
  'AFIS.EMandates': true,
  'AMSAPP.notificationService': true,
  'BRP.aantalBewonersOpAdresTonen': true,
  'USER_FEEDBACK.fetchSurvey': true,
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
