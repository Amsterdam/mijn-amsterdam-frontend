import { themaTitle } from './ToeristischeVerhuur-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const toeristischeverhuurSectionProps: generalInfo.SectionProps = {
  title: themaTitle,
  listItems: [
    {
      text: 'Uw aanvraag voor een vergunning vakantieverhuur of bed & breakfast',
    },
    { text: 'Uw landelijk registratienummer toeristische verhuur' },
    {
      text: 'Link naar het landelijk portaal om vakantieverhuur door te geven en het aantal nachten verhuur in te zien',
    },
  ],
};
