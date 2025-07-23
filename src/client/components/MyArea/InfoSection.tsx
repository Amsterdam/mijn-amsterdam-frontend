import { themaTitle } from './MyArea-thema-config';
import * as generalInfo from '../../pages/GeneralInfo/GeneralInfo';

export const myAreaSectionProps: generalInfo.SectionProps = {
  title: themaTitle,
  listItems: [
    { text: 'Overzicht van gemeentelijke informatie rond uw woning' },
  ],
};
