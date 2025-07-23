import { themaTitle } from './Belastingen-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const belastingenSectionProps: generalInfo.SectionProps = {
  title: themaTitle,
  listItems: [
    { text: 'Belastingaanslagen betalen' },
    { text: 'Automatische incasso regelen' },
    { text: 'Bezwaar indienen' },
    { text: 'Kwijtschelding aanvragen' },
    { text: 'Betalingsregeling aanvragen' },
    { text: 'Aangifte doen' },
  ],
};
