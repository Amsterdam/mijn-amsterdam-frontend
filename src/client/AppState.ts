import { createContext } from 'react';

import { FeatureToggle } from '../universal/config/feature-toggles';
import { apiPristineResult } from '../universal/helpers/api';
import { AppState } from '../universal/types/App.types';
import { featureToggle as featureToggleAVG } from './pages/Thema/AVG/AVG-thema-config';
import { featureToggle as featureToggleAVG } from './pages/Thema/AVG/AVG-thema-config';
import { featureToggle as featureToggleBezwaren } from './pages/Thema/Bezwaren/Bezwaren-thema-config';
import { zorgnedLeerlingenvervoerActive } from './pages/Thema/Jeugd/Jeugd-thema-config';

export const PRISTINE_APPSTATE: AppState = {
  // Generated
  NOTIFICATIONS: apiPristineResult([]),

  VAREN: apiPristineResult(
    { reder: null, zaken: [] },
    {
      isActive: FeatureToggle.varenActive,
      profileTypes: ['commercial'],
    }
  ),

  AFIS: apiPristineResult(
    {
      isKnown: false,
      businessPartnerIdEncrypted: null,
      businessPartnerId: null,
      facturen: null,
    },
    {
      isActive: FeatureToggle.afisActive,
      profileTypes: ['private', 'commercial'],
    }
  ),
  WPI_SPECIFICATIES: apiPristineResult(
    {
      jaaropgaven: [],
      uitkeringsspecificaties: [],
    },
    {
      profileTypes: ['private'],
    }
  ),
  KREFIA: apiPristineResult(null, {
    isActive: FeatureToggle.krefiaActive,
    profileTypes: ['private'],
  }),
  WPI_AANVRAGEN: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  WPI_TOZO: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  WPI_TONK: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  WPI_BBZ: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  HLI: apiPristineResult(
    {
      stadspas: [],
      regelingen: [],
    },
    {
      profileTypes: ['private'],
      isActive: FeatureToggle.hliThemaActive,
    }
  ),
  SVWI: apiPristineResult(null, {
    isActive: FeatureToggle.svwiLinkActive,
    profileTypes: ['private'],
  }),
  WMO: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  JEUGD: apiPristineResult([], {
    isActive: zorgnedLeerlingenvervoerActive,
    profileTypes: ['private'],
  }),
  ERFPACHT: apiPristineResult(null, {
    isActive: FeatureToggle.erfpachtActive,
    profileTypes: ['private', 'commercial'],
  }),
  SUBSIDIE: apiPristineResult(
    { isKnown: false, notifications: [] },
    { isActive: FeatureToggle.subsidieActive }
  ),
  BELASTINGEN: apiPristineResult(
    { isKnown: true },
    { profileTypes: ['private'] }
  ),
  BEZWAREN: apiPristineResult([], {
    isActive: featureToggleBezwaren.BezwarenActive,
    profileTypes: ['private'],
  }),
  MILIEUZONE: apiPristineResult({ isKnown: false }),
  OVERTREDINGEN: apiPristineResult(
    { isKnown: false },
    { isActive: FeatureToggle.overtredingenActive }
  ),
  PARKEREN: apiPristineResult(
    { isKnown: true, url: undefined, vergunningen: [] },
    {
      isActive: FeatureToggle.parkerenActive,
      profileTypes: ['private', 'commercial'],
    }
  ),
  TOERISTISCHE_VERHUUR: apiPristineResult({
    vakantieverhuurVergunningen: [],
    lvvRegistraties: [],
    bbVergunningen: [],
  }),
  VERGUNNINGEN: apiPristineResult([]),

  // KVK / Handelsregister
  KVK: apiPristineResult(null),

  // Related
  BRP: apiPristineResult(null, {
    profileTypes: ['private'],
  }),
  KLANT_CONTACT: apiPristineResult([], {
    profileTypes: ['private'],
    isActive: FeatureToggle.contactmomentenActive,
  }),
  PROFILE: apiPristineResult(null, {
    profileTypes: ['private-attributes'],
  }),
  AFVAL: apiPristineResult([]),
  AFVALPUNTEN: apiPristineResult({
    centers: [],
    datePublished: '',
  }),
  MY_LOCATION: apiPristineResult(null),

  // CMS content
  CMS_CONTENT: apiPristineResult({
    generalInfo: null,
    footer: null,
  }),
  CMS_MAINTENANCE_NOTIFICATIONS: apiPristineResult([]),

  KLACHTEN: apiPristineResult(
    { aantal: 0, klachten: [] },
    { profileTypes: ['private'] }
  ),

  HORECA: apiPristineResult([]),

  AVG: apiPristineResult(null, {
    isActive: featureToggleAVG.AvgActive,
    profileTypes: ['private'],
  }),

  BODEM: apiPristineResult(null, { isActive: FeatureToggle.bodemActive }),
};

export const ALL_ERROR_STATE_KEY = 'ALL';

export function createAllErrorState(state: AppState, message: string) {
  return Object.assign({}, state, {
    [ALL_ERROR_STATE_KEY]: {
      status: 'ERROR',
      message,
    },
  });
}

export const AppContext = createContext<AppState>(PRISTINE_APPSTATE);
