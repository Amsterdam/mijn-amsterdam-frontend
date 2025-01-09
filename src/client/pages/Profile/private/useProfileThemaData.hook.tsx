import { useContactmomenten } from './useContactmomenten.hook';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { ThemaTitles } from '../../../config/thema';
import { useAppStateGetter } from '../../../hooks/useAppState';

export function useProfileThemaData() {
  const { BRP } = useAppStateGetter();
  const {
    isError: isErrorContactmomenten,
    isLoading: isLoadingContactmomenten,
    contactmomenten,
  } = useContactmomenten();

  return {
    title: ThemaTitles.BRP,
    brpContent: BRP.content,
    isErrorBrp: isError(BRP),
    isErrorContactmomenten,
    isLoadingBrp: isLoading(BRP),
    isLoadingContactmomenten,
    hasContactMomenten: !!contactmomenten?.length,
    linkListItems: [],
  };
}
