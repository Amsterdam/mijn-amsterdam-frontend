import { AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS } from 'components/AutoLogoutDialog/AutoLogoutDialog';
import { getApiUrl } from 'helpers/App';
import { useEffect, useMemo, useState } from 'react';
import { useDataApi } from './api.hook';
import { ApiRequestOptions, ApiState } from './api.types';

export interface SessionState {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  refetch: () => void;
}

const INITIAL_SESSION_STATE: Omit<SessionState, 'refetch'> = {
  isAuthenticated: false,
  validUntil: -1,
  validityInSeconds: -1,
};

const requestOptions: ApiRequestOptions = {
  url: getApiUrl('AUTH'),
  resetToInitialDataOnError: true,
  postpone: true,
};

export type SessionApiState = Omit<ApiState, 'data'> & SessionState;

function post(path: string, params: any, method = 'post') {
  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  const form = document.createElement('form');
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}

export function useTMALogout() {
  const [tgtBlob, setTgtBlob] = useState('');
  useEffect(() => {
    if (!tgtBlob) {
      const url = new URL(
        'https://mijn.amsterdam.nl/api/login?aselect_credentials=5pLdp0PtVW8aS4Psyc7papbZ81stmuQi5a*GmTWWvM9Zj1lXlD*RSWFiJPx4FhzROO7yUCWzMR-qtQdTuVYA3JdKr01vxpZxsH1WLsqW24Y5WLENF159iEZx2EQEr-26nvpqBPk6kODGl-M-I0XDXxjqjM9G6VyIvxz5UMXlRU4_&rid=R2F3E2DDDAFF7E61DC0117E7A9B31926E6C19B977&a-select-server=tma.amsterdam.nl&language=nl'
      );
      const queryParams: any = new URLSearchParams(url.search);
      setTgtBlob(queryParams.get('aselect_credentials'));
    }
  }, []);

  return () => {
    const params = {
      request: 'logout',
      tgt_blob: tgtBlob,
      'a-select-server': 'tma.amsterdam.nl',
      logoutbutton: ' Log Out ',
    };
    post('https://tma.amsterdam.nl/aselectserver/server', params);
  };
}

export default function useSessionApi(
  initialData = INITIAL_SESSION_STATE
): SessionApiState {
  const [
    {
      data: { isAuthenticated, validUntil },
      isLoading,
      isDirty,
      ...rest
    },
    refetch,
  ] = useDataApi(requestOptions, initialData);

  return useMemo(() => {
    const validityInSeconds = Math.max(
      Math.round(
        (validUntil - new Date().getTime()) / 1000 -
          AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS
      ),
      0
    );

    return {
      ...rest,
      isLoading,
      isAuthenticated,
      validUntil,
      validityInSeconds,
      isDirty,
      refetch: () => refetch(requestOptions),
    };
  }, [isAuthenticated, isDirty]);
}
