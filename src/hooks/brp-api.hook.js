import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';

export const useBrpApi = (initialState = {}) => {
  const options = { url: ApiUrls.BRP };
  const { data, refetch } = useDataApi(options, initialState);

  return { persoon: data.persoon || {}, refetch };
};

export function getProfileLabel(persoon) {
  let profileLabel = 'Persoonlijke gegevens';

  if (persoon) {
    if (persoon.voorvoegselGeslachtsnaam) {
      profileLabel = `${persoon.voornamen} ${
        persoon.voorvoegselGeslachtsnaam
      } ${persoon.geslachtsnaam}`;
    } else {
      profileLabel = `${persoon.voornamen} ${persoon.geslachtsnaam}`;
    }
  }

  return profileLabel;
}
