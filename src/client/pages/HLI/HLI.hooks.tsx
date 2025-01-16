import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { PasblokkadeByPasnummer } from '../../../server/services/hli/stadspas-types';
import { ApiResponse } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useStadspassen() {
  const { HLI } = useAppStateGetter();
  const { data: passBlokkadeByPasnummer } = useBlockStadspas();
  const stadspassen = (HLI.content?.stadspas || []).map((pas) => {
    const isGeblokkeerd = passBlokkadeByPasnummer?.[pas.passNumber];
    const stadspas = {
      ...pas,
      actief: isGeblokkeerd ?? pas.actief,
    };

    return stadspas;
  });

  return [stadspassen] as const;
}

type BlokkeerURL = string;

export function useBlockStadspas() {
  const { data } = useSWR<PasblokkadeByPasnummer>('pasblokkades');
  const mutation = useSWRMutation<
    PasblokkadeByPasnummer | ApiResponse<PasblokkadeByPasnummer | null>,
    Error,
    'pasblokkades',
    BlokkeerURL
  >(
    'pasblokkades',
    async (key, { arg }) => {
      const response = await fetch(arg, {
        method: 'POST',
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
