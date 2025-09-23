import { themaId, themaTitle } from './Inkomen-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const inkomenSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Uw aanvraag voor een bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    'De uitkeringsspecificaties en jaaropgaven van uw bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    'Uw aanvraag voor de Tijdelijke overbruggingsregeling zelfstandig ondernemers (Tozo 1, 2, 3, 4 en 5)',
    'Uw aanvraag voor de Tijdelijke Ondersteuning Noodzakelijke Kosten (TONK)',
    'Uw aanvraag voor de Inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen (IOAZ)',
  ],
  active: true,
};
