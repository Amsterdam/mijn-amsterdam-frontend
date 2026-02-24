import { themaConfig } from './Inkomen-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const inkomenSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: [
    'Uw aanvraag voor een bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    'De uitkeringsspecificaties en jaaropgaven van uw bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    'Uw aanvraag voor de Tijdelijke overbruggingsregeling zelfstandig ondernemers (Tozo 1, 2, 3, 4 en 5)',
    'Uw aanvraag voor de Tijdelijke Ondersteuning Noodzakelijke Kosten (TONK)',
    'Uw aanvraag voor de Inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen (IOAZ)',
  ],
  active: true,
};
