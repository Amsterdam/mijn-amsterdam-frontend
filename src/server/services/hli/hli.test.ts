import { forTesting } from './hli';
import { StatusLineItem } from '../../../universal/types';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../zorgned/zorgned-types';

describe('HLI', () => {
  test('getDisplayStatus', () => {
    const regeling1 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems1 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling1, statusLineItems1)).toBe(
      'Afgewezen'
    );

    const regeling2 = {
      resultaat: 'toegewezen',
      isActueel: false,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems2 = [{ status: 'Einde recht' }] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling2, statusLineItems2)).toBe(
      'Einde recht'
    );

    const regeling3 = {
      resultaat: 'toegewezen',
      isActueel: false,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems3 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling3, statusLineItems3)).toBe(
      'Toegewezen'
    );

    const regeling4 = {
      resultaat: 'afgewezen',
      isActueel: true,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems4 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling4, statusLineItems4)).toBe(
      'Onbekend'
    );

    const regeling5 = {
      resultaat: 'afgewezen',
      isActueel: true,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems5 = [{ status: 'Foo Bar' }] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling5, statusLineItems5)).toBe(
      'Foo Bar'
    );

    const regeling6 = {
      isActueel: false,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems6 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling6, statusLineItems6)).toBe(
      'Afgewezen'
    );

    const regeling7 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.getDisplayStatus(regeling7, [])).toBe('Afgewezen');

    const regeling8 = {
      productIdentificatie: 'AV-FOOBAR',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.getDisplayStatus(regeling8, [])).toBe('Toegewezen');
  });
});
