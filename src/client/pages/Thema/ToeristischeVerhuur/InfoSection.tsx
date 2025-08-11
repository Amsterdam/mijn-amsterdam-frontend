import { themaId, themaTitle } from './ToeristischeVerhuur-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const toeristischeverhuurSectionProps: SectionProps = {
  id: themaId,
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
