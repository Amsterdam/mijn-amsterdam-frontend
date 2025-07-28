import { themaId, themaTitle } from './Inkomen-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const inkomenSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    {
      text: 'Uw aanvraag voor een bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    },
    {
      text: 'De uitkeringsspecificaties en jaaropgaven van uw bijstandsuitkering of bijstand voor zelfstandigen (Bbz)',
    },
    {
      text: 'Uw aanvraag voor de Tijdelijke overbruggingsregeling zelfstandig ondernemers (Tozo 1, 2, 3 en 4)',
    },
    {
      text: 'Uw aanvraag voor de Tijdelijke Ondersteuning Noodzakelijke Kosten (TONK)',
    },
    {
      text: 'Uw aanvraag voor de Inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen (IOAZ)',
    },
  ],
};
