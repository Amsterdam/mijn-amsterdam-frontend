import { featureToggle, themaId, themaTitle } from './Belastingen-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const belastingenSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Belastingaanslagen betalen',
    'Automatische incasso regelen',
    'Bezwaar indienen',
    'Kwijtschelding aanvragen',
    'Betalingsregeling aanvragen',
    'Aangifte doen',
  ],
  active: featureToggle.belastingenActive,
};
