import { atom, useRecoilState } from 'recoil';

import { StadspasFrontend } from '../../../server/services/hli/stadspas-types';
import { useAppStateGetter } from '../../hooks/useAppState';

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

  const stadspassen: StadspasFrontend[] = (HLI.content?.stadspas || []).map(
    (pas) => {
      const stadspas = {
        ...pas,
        actief: stadspasActief[pas.id] ?? true,
      };
      return stadspas;
    }
  );

  return [stadspassen, setStadspassenActiefStatus] as const;
}
