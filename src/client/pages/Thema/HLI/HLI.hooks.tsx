import { atom, useRecoilState } from 'recoil';
import useSWRMutation from 'swr/mutation';

import { StadspasFrontend } from '../../../../server/services/hli/stadspas-types';
import { useAppStateGetter } from '../../../hooks/useAppState';

type StadspasActiefByID = {
  [id: string]: boolean;
};

const stadspasActiefAtom = atom<StadspasActiefByID>({
  key: 'stadspasActief',
  default: {},
});

export function useStadspassen() {
  const { HLI } = useAppStateGetter();
  const [stadspasActief, setStadspassenActiefStatus] =
    useRecoilState(stadspasActiefAtom);

  const stadspassen: StadspasFrontend[] = (
    HLI.content?.stadspas?.stadspassen || []
  ).map((pas) => {
    const stadspas = {
      ...pas,
      actief: stadspasActief[pas.id] ?? true,
    };
    return stadspas;
  });

  return [stadspassen, setStadspassenActiefStatus] as const;
}

export function useBlockStadspas(url: string | null, stadspasId: string) {
  const setStadspassenActiefStatus = useStadspassen()[1];

  return useSWRMutation(
    url,
    async (url) => {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Request returned with an error');
      }

      setStadspassenActiefStatus((stadspasActiefState) => {
        return { ...stadspasActiefState, [stadspasId]: false };
      });

      return response;
    },
    { revalidate: false, populateCache: false }
  );
}
