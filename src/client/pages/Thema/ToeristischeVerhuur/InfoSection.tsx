import {
  featureToggle,
  themaId,
  themaTitle,
} from './ToeristischeVerhuur-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const toeristischeverhuurSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Uw aanvraag voor een vergunning vakantieverhuur of bed & breakfast',
    'Uw landelijk registratienummer toeristische verhuur',
    'Link naar het landelijk portaal om vakantieverhuur door te geven en het aantal nachten verhuur in te zien',
  ],
  active: featureToggle.toeristischeVerhuurActive,
};
