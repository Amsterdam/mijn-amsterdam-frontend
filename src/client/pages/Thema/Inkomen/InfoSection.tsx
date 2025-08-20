import { themaId, themaTitle } from './Inkomen-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const inkomenSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    'Uw aanvraag voor een bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    'De uitkeringsspecificaties en jaaropgaven van uw bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    'Uw aanvraag voor de Tijdelijke overbruggingsregeling zelfstandig ondernemers (Tozo 1, 2, 3 en 4)',
    'Uw aanvraag voor de Tijdelijke Ondersteuning Noodzakelijke Kosten (TONK)',
    'Uw aanvraag voor de Inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen (IOAZ)',
  ],
  active: true,
};
