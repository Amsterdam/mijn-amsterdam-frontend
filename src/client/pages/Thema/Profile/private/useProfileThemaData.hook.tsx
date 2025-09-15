import { isError, isLoading } from '../../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../../hooks/useAppState';
import { themaId } from '../../Bodem/Bodem-thema-config';
import { useContactmomenten } from '../../Contact/Contactmomenten/useContactmomenten';
import { routeConfig, themaTitle } from '../Profile-thema-config';

export function useProfileThemaData() {
  const { BRP } = useAppStateGetter();
  const {
    isError: isErrorContactmomenten,
    isLoading: isLoadingContactmomenten,
    contactmomenten,
  } = useContactmomenten();

  const { WMO } = useAppStateGetter();

  return {
    id: themaId,
    title: themaTitle.BRP,
    brpContent: BRP.content,
    isErrorBrp: isError(BRP),
    isErrorContactmomenten,
    isLoadingBrp: isLoading(BRP),
    isLoadingContactmomenten,
    hasContactMomenten: !!contactmomenten?.length,
    hasZorgned: !!WMO.content?.length,
    linkListItems: [],
    routeConfig,
  };
}
