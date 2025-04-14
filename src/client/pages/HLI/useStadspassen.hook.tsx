import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import {
  PasblokkadeByPasnummer,
  StadspasFrontend,
} from '../../../server/services/hli/stadspas-types';
import { ApiResponse_DEPRECATED } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useStadspassen() {
  const { HLI } = useAppStateGetter();
  const { data: passBlokkadeByPasnummer } = useBlockStadspas();
  const stadspassen = (HLI.content?.stadspas || []).map((pas) => {
    const isGeblokkeerd = passBlokkadeByPasnummer?.[pas.passNumber];
    const stadspas: StadspasFrontend = {
      ...pas,
      actief: isGeblokkeerd ?? pas.actief,
    };

    return stadspas;
  });

  return stadspassen;
}

type BlokkeerURL = string;

export function useBlockStadspas() {
  const { data } = useSWR<PasblokkadeByPasnummer>('pasblokkades');
  const mutation = useSWRMutation<
    | PasblokkadeByPasnummer
    | ApiResponse_DEPRECATED<PasblokkadeByPasnummer | null>,
    Error,
    'pasblokkades',
    BlokkeerURL
  >(
    'pasblokkades',
    async (_key, { arg }) => {
      const response = await fetch(arg, {
        credentials: 'include',
      }).then((response) => response.json());

      if (response.status !== 'OK') {
        throw new Error(response.message);
      }

      return response;
    },
    {
      revalidate: false,
      populateCache: (response, pasBlokkadeByPasnummer) => {
        const newState = {
          ...pasBlokkadeByPasnummer,
          ...('content' in response ? response.content : {}),
        };
        return newState;
      },
    }
  );

  return {
    ...mutation,
    data,
  };
}

type DeblokkeerURL = string;

export function useUnblockStadspas() {
  const { data } = useSWR<PasblokkadeByPasnummer>('pasdeblokkades');
  const mutation = useSWRMutation<
    | PasblokkadeByPasnummer
    | ApiResponse_DEPRECATED<PasblokkadeByPasnummer | null>,
    Error,
    'pasdeblokkades',
    DeblokkeerURL
  >(
    'pasdeblokkades',
    async (_key, { arg }) => {
      console.log(arg);
      const response = await fetch(arg, {
        credentials: 'include',
      }).then((response) => response.json());

      if (response.status !== 'OK') {
        throw new Error(response.message);
      }

      return response;
    },
    {
      revalidate: false,
      populateCache: (response, pasBlokkadeByPasnummer) => {
        const newState = {
          ...pasBlokkadeByPasnummer,
          ...('content' in response ? response.content : {}),
        };
        return newState;
      },
    }
  );

  return {
    ...mutation,
    data,
  };
}
