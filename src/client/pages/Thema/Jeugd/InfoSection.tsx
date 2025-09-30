import { featureToggle, themaTitle, themaId } from './Jeugd-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const JeugdSectionProps: InfoSection = {
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
