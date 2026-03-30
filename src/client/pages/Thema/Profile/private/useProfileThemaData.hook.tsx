import { useContactmomenten } from './useContactmomenten.hook.tsx';
import { isError, isLoading } from '../../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { themaConfig } from '../Profile-thema-config.ts';

export function useProfileThemaData() {
  const { BRP } = useAppStateGetter();
  const {
    isError: isErrorContactmomenten,
    isLoading: isLoadingContactmomenten,
    contactmomenten,
  } = useContactmomenten();

  return {
    id: themaConfig.BRP.id,
    title: themaConfig.BRP.title,
    brpContent: BRP.content,
    isErrorBrp: isError(BRP),
    isErrorContactmomenten,
    isLoadingBrp: isLoading(BRP),
    isLoadingContactmomenten,
    hasContactMomenten: !!contactmomenten?.length,
    linkListItems: [],
  };
}
