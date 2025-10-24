import { useContactmomenten } from './useContactmomenten.hook';
import { isError, isLoading } from '../../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore';
import { themaTitle, themaIdBRP } from '../Profile-thema-config';

export function useProfileThemaData() {
  const { BRP } = useAppStateGetter();
  const {
    isError: isErrorContactmomenten,
    isLoading: isLoadingContactmomenten,
    contactmomenten,
  } = useContactmomenten();

  return {
    id: themaIdBRP,
    title: themaTitle.BRP,
    brpContent: BRP.content,
    isErrorBrp: isError(BRP),
    isErrorContactmomenten,
    isLoadingBrp: isLoading(BRP),
    isLoadingContactmomenten,
    hasContactMomenten: !!contactmomenten?.length,
    linkListItems: [],
  };
}
