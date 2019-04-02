import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';

export const useBrpApi = (initialState = {}) => {
  const options = { url: ApiUrls.BRP };
  const { data, refetch } = useDataApi(options, initialState);

  if (data.persoon) {
    const me = data.persoon || {};

    const partnerItem = Array.isArray(me.heeftAlsEchtgenootPartner)
      ? me.heeftAlsEchtgenootPartner.find(item => !('datumOntbinding' in item))
      : me.heeftAlsEchtgenootPartner || null;

    const partner = partnerItem && partnerItem.gerelateerde;

    const address = {
      current: {
        locality: `${me.verblijfsadres.straatnaam} ${
          me.verblijfsadres.huisnummer
        }
        ${me.verblijfsadres.postcode} ${me.verblijfsadres.woonplaatsNaam ||
          ''}`,
        dateStarted: me.verblijfsadres.begindatumVerblijf,
      },
    };

    const legalCommitment = me.omschrijvingBurgerlijkeStaat && {
      type: me.omschrijvingBurgerlijkeStaat,
      dateStarted: me.tijdvakGeldigheid.beginGeldigheid,
      place:
        me.plaatsnaamSluiting ||
        (partnerItem && partnerItem.plaatsnaamSluitingOmschrijving),
      country:
        me.landnaamSluiting || (partnerItem && partnerItem.landnaamSluiting),
    };

    return { me, partner, address, legalCommitment, refetch };
  }

  return {};
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
