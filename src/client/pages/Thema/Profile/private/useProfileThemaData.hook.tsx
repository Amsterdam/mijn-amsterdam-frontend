import { useContactmomenten } from './useContactmomenten.hook';
import { isError, isLoading } from '../../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../../hooks/useAppState';
import { themaTitle } from '../Profile-thema-config';

export function useProfileThemaData() {
  const { BRP } = useAppStateGetter();
  const {
    isError: isErrorContactmomenten,
    isLoading: isLoadingContactmomenten,
    contactmomenten,
  } = useContactmomenten();

  return {
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
