import { StatusLineItem } from '../../../universal/types';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types';
import { forTesting } from './hli';

describe('HLI', () => {
  test('getDisplayStatus', () => {
    const regeling1 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagTransformed;

    const statusLineItems1 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling1, statusLineItems1)).toBe(
      'Afgewezen'
    );

    const regeling2 = {
      resultaat: 'toegewezen',
      isActueel: false,
    } as ZorgnedAanvraagTransformed;

    const statusLineItems2 = [{ status: 'Einde recht' }] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling2, statusLineItems2)).toBe(
      'Einde recht'
    );

    const regeling3 = {
      resultaat: 'toegewezen',
      isActueel: false,
    } as ZorgnedAanvraagTransformed;

    const statusLineItems3 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling3, statusLineItems3)).toBe(
      'Toegewezen'
    );

    const regeling4 = {
      resultaat: 'afgewezen',
      isActueel: true,
    } as ZorgnedAanvraagTransformed;

    const statusLineItems4 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling4, statusLineItems4)).toBe(
      'Onbekend'
    );

    const regeling5 = {
      resultaat: 'afgewezen',
      isActueel: true,
    } as ZorgnedAanvraagTransformed;

    const statusLineItems5 = [{ status: 'Foo Bar' }] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling5, statusLineItems5)).toBe(
      'Foo Bar'
    );

    const regeling6 = {
      isActueel: false,
    } as ZorgnedAanvraagTransformed;

    const statusLineItems6 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling6, statusLineItems6)).toBe(
      'Afgewezen'
    );
  });
});
