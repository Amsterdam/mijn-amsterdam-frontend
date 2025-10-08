import { useContactmomenten } from './useContactmomenten.hook';
import { isError, isLoading } from '../../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../../hooks/useAppState';
// Eerst haalde ik themaConfig uit Bodem-thema-config en nu haal ik het themaId en themaTitle uit Profile-thema-config
import { themaTitle, themaIdBRP } from '../Profile-thema-config';

export function useProfileThemaData() {
  const { BRP } = useAppStateGetter();
  const {
    isError: isErrorContactmomenten,
    isLoading: isLoadingContactmomenten,
    contactmomenten,
  } = useContactmomenten();

  return {
    themaId: themaIdBRP, // Eerst stond het op themaConfig.id (Bodem), maar nu heb ik het verbeterd naar themaIdBRP (Profile)
    title: themaTitle.BRP, // Eerst haalde ik het via Bodem maar nu verbeterd naar themaTitle.BRP ("Mijn gegevens")
    brpContent: BRP.content,
    isErrorBrp: isError(BRP),
    isErrorContactmomenten,
    isLoadingBrp: isLoading(BRP),
    isLoadingContactmomenten,
    hasContactMomenten: !!contactmomenten?.length,
    linkListItems: [],
  };
}
