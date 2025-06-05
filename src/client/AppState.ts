import { createContext } from 'react';

import { apiPristineResult } from '../universal/helpers/api';
import { AppState } from '../universal/types/App.types';

export const PRISTINE_APPSTATE: AppState = {
  // Generated
  NOTIFICATIONS: apiPristineResult([]),

  VAREN: apiPristineResult(
    { reder: null, zaken: [] },
    {
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
    }
  ),
  SVWI: apiPristineResult(null, {
    profileTypes: ['private'],
  }),
  WMO: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  JEUGD: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  ERFPACHT: apiPristineResult(null, {
    profileTypes: ['private', 'commercial'],
  }),
  SUBSIDIES: apiPristineResult({ isKnown: false, notifications: [] }),
  BELASTINGEN: apiPristineResult(
    { isKnown: true },
    { profileTypes: ['private'] }
  ),
  BEZWAREN: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  MILIEUZONE: apiPristineResult({ isKnown: false }),
  OVERTREDINGEN: apiPristineResult({ isKnown: false }),
  PARKEREN: apiPristineResult(
    { isKnown: true, url: undefined, vergunningen: [] },
    {
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
  CMS_CONTENT: apiPristineResult(null),
  CMS_MAINTENANCE_NOTIFICATIONS: apiPristineResult([]),

  KLACHTEN: apiPristineResult([], { profileTypes: ['private'] }),

  HORECA: apiPristineResult([]),

  AVG: apiPristineResult(null, {
    profileTypes: ['private'],
  }),

  BODEM: apiPristineResult(null),
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
