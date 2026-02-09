import { featureToggle, themaId, themaTitle } from './Belastingen-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const belastingenSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Belastingaanslagen betalen',
    'Automatische incasso regelen',
    'Bezwaar indienen',
    'Kwijtschelding aanvragen',
    'Betalingsregeling aanvragen',
    'Aangifte doen',
    'Parkeerbon betalen',
  ],
  active: featureToggle.belastingenActive,
};
