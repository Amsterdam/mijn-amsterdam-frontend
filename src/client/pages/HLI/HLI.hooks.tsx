import { HttpStatusCode } from 'axios';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { useAppStateGetter } from '../../hooks/useAppState';

export function useStadspassen() {
  const { HLI } = useAppStateGetter();
  const { cache } = useSWRConfig();

  const stadspassen = (HLI.content?.stadspas || []).map((pas) => {
    let cachedPas;
    if (pas.blockPassURL) {
      cachedPas = cache.get(pas.blockPassURL);
    }

    const stadspas = {
      ...pas,
      actief: cachedPas?.data?.actief ?? pas.actief,
    };

    return stadspas;
  });

  return [stadspassen] as const;
}

export function useBlockStadspas(url: string | null) {
  return useSWRMutation(
    url,
    async (url) => {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status !== HttpStatusCode.Ok) {
        throw new Error('Request returned with an error');
      }

      return response.json();
    },
    {
      revalidate: false,
      populateCache: (updatedStadspasResponse, stadspassen) => {
        return { ...stadspassen, ...updatedStadspasResponse.content };
      },
    }
  );
}
