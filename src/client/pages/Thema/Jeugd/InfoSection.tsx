import { featureToggle, themaTitle, themaId } from './Jeugd-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const JeugdSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Openbaar vervoer abonnement',
    'Openbaar vervoer vergoeding',
    'Eigen vervoer',
    'Fietsvergoeding',
    'Aangepast individueel vervoer',
    'Aangepast groepsvervoer',
  ],
  active: featureToggle.leerlingenvervoerActive,
};
