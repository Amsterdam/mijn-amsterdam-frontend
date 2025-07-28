import { themaId, themaTitle } from './Subsidies-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const subsidiesSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [{ text: 'Uw aanvraag voor een subsidie' }],
};
