import {
  StadspasFrontend,
  type PasblokkadeByPasnummer,
} from '../../../../server/services/hli/stadspas-types';
import {
  useBffApi,
  useBffApiStateStore,
} from '../../../hooks/api/useDataApi-v2';
import { useAppStateGetter } from '../../../hooks/useAppState';

function getPasBlockedStateKey(passNumber: StadspasFrontend['passNumber']) {
  return `pass-blocked-state-${passNumber}`;
}

export function useStadspassen() {
  const { HLI } = useAppStateGetter();
  const store = useBffApiStateStore();
  const stadspassen = (HLI.content?.stadspas?.stadspassen || []).map((pas) => {
    const pasBlokkade =
      store.get<PasblokkadeByPasnummer>(getPasBlockedStateKey(pas.passNumber))
        ?.data?.content ?? null;
    const isGeblokkeerd =
      pasBlokkade !== null ? !pasBlokkade.actief : undefined;
    const stadspas: StadspasFrontend = {
      ...pas,
      actief:
        typeof isGeblokkeerd !== 'undefined' ? !isGeblokkeerd : pas.actief,
    };

    return stadspas;
  });

  return stadspassen;
}

export function useBlockStadspas(passNumber: StadspasFrontend['passNumber']) {
  return useBffApi<PasblokkadeByPasnummer>(getPasBlockedStateKey(passNumber), {
    fetchImmediately: false,
  });
}
