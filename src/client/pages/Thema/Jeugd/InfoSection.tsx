import { themaConfig } from './Jeugd-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const JeugdSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: [
    'Openbaar vervoer abonnement',
    'Openbaar vervoer vergoeding',
    'Eigen vervoer',
    'Fietsvergoeding',
    'Aangepast individueel vervoer',
    'Aangepast groepsvervoer',
  ],
  active: themaConfig.featureToggle.active,
};
