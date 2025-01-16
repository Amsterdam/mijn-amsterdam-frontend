import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

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
  const { data } = useSWR('pasblokkades');
  const mutation = useSWRMutation(
    'pasblokkades',
    async (key, { arg }: { arg: BlokkeerURL }) => {
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
          ...response.content,
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
