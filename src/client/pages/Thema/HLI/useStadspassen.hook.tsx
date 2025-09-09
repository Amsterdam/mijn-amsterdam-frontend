import {
  StadspasFrontend,
  type PasblokkadeByPasnummer,
} from '../../../../server/services/hli/stadspas-types';
import { createApiHook } from '../../../hooks/api/useDataApi-v2';
import {
  createItemStoreHook,
  useApiStoreByKey,
} from '../../../hooks/api/useItemStore';
import { useAppStateGetter } from '../../../hooks/useAppState';

const useBlockStadspasApi = createApiHook<PasblokkadeByPasnummer>();
const useBlockStadspasStore =
  createItemStoreHook<PasblokkadeByPasnummer>('passNumber');

export function useStadspassen() {
  const { HLI } = useAppStateGetter();
  const { getItem } = useBlockStadspasStore();
  const stadspassen = (HLI.content?.stadspas?.stadspassen || []).map((pas) => {
    const pasBlokkade = getItem(pas.passNumber);
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

export function useBlockStadspas() {
  const store = useApiStoreByKey<PasblokkadeByPasnummer>(
    useBlockStadspasApi,
    useBlockStadspasStore,
    'passNumber',
    null
  );

  return store;
}
