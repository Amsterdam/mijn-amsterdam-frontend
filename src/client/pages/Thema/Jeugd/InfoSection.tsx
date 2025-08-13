import { themaTitle, themaId } from './Jeugd-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const JeugdSectionProps: SectionProps = {
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
};
