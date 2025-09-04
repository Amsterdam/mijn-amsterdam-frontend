import { featureToggle, themaId, themaTitle } from './Varen-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const varensectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    {
      text: 'Inzien en wijzigen van uw vergunning passagiersvaart:',
      listItems: [
        'Vaartuig vervangen door een bestaand vaartuig',
        'Vaartuig vervangen door een te (ver)bouwen vaartuig',
        'Exploitatievergunning op naam van een andere onderneming zetten',
        'Vaartuig een andere naam geven',
      ],
    },
  ],
  active: featureToggle.varenActive,
};
