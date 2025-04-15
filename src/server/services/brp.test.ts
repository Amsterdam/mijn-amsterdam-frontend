import { transformBRPData, transformBRPNotifications } from './brp';
import brpData from '../../../mocks/fixtures/brp.json';
import { ApiSuccessResponse } from '../../universal/helpers/api';
import { getFullAddress } from '../../universal/helpers/brp';
import { BRPDataFromSource } from '../../universal/types/brp';

const brpDataTyped = brpData as ApiSuccessResponse<BRPDataFromSource>;
const {
  content: { adres },
} = brpDataTyped;

describe('BRP data api + transformation', () => {
  it('should construct a complete addresss', () => {
    expect(
      getFullAddress({ ...adres, huisletter: 'X', huisnummertoevoeging: 'h' })
    ).toBe('Weesperstraat 113 X h');
  });

  it('should transform the source data', () => {
    expect(transformBRPData(brpDataTyped)).toMatchSnapshot();
  });

  it('should transform the source data into notifications', () => {
    const data = transformBRPData(brpDataTyped);
    expect(
      transformBRPNotifications(data, new Date(2020, 3, 23))
    ).toStrictEqual([
      {
        datePublished: '2020-04-22T22:00:00.000Z',
        description: 'Op dit moment onderzoeken wij op welk adres u nu woont.',
        id: 'brpAdresInOnderzoek',
        isAlert: true,
        link: {
          title: 'Meer informatie',
          to: '/persoonlijke-gegevens',
        },
        themaID: 'BRP',
        title: 'Adres in onderzoek',
      },
      {
        datePublished: '2020-04-22T22:00:00.000Z',
        description:
          "U staat sinds 01 januari 1967 in de Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.",
        id: 'brpVertrokkenOnbekendWaarheen',
        isAlert: true,
        link: {
          title: 'Meer informatie',
          to: '/persoonlijke-gegevens',
        },
        themaID: 'BRP',
        title: 'Vertrokken Onbekend Waarheen (VOW)',
      },
    ]);
  });
});
