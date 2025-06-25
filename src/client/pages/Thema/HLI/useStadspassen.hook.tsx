import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import {
  StadspasFrontend,
  type PasblokkadeByPasnummer,
} from '../../../../server/services/hli/stadspas-types';
import { useAppStateGetter } from '../../../hooks/useAppState';

export function useStadspassen() {
  const { HLI } = useAppStateGetter();
  const { data: passBlokkadeByPasnummer } = useBlockStadspas();
  const stadspassen = (HLI.content?.stadspas?.stadspassen || []).map((pas) => {
    const isGeblokkeerd = passBlokkadeByPasnummer?.[pas.passNumber];
    const stadspas: StadspasFrontend = {
      ...pas,
      actief:
        typeof isGeblokkeerd !== 'undefined' ? !isGeblokkeerd : pas.actief,
    };

    return stadspas;
  });

  return stadspassen;
}

type BlokkeerURL = string;

export function useBlockStadspas() {
  const { data } = useSWR<PasblokkadeByPasnummer>('pasblokkades');
  const mutation = useSWRMutation<
    PasblokkadeByPasnummer,
    Error,
    'pasblokkades',
    BlokkeerURL
  >(
    'pasblokkades',
    async (_key, { arg: url }) => {
      const response = await fetch(url, {
        credentials: 'include',
      }).then((response) => response.json());

      if (response.status !== 'OK') {
        throw new Error(response.message);
      }

      return response.content;
    },
    {
      revalidate: false,
      populateCache: (responseContent, pasBlokkadeByPasnummer) => {
        const newState = {
          ...pasBlokkadeByPasnummer,
          ...responseContent,
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
