import { featureToggle, themaTitle, themaId } from './Jeugd-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const JeugdSectionProps: Section = {
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
