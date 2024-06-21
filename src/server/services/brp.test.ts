import { ApiSuccessResponse, getFullAddress } from '../../universal/helpers';
import { getBagSearchAddress } from '../../universal/helpers/bag';
import { BRPDataFromSource } from '../../universal/types/brp';
import brpData from '../../../mocks/fixtures/brp.json';
import { transformBRPData, transformBRPNotifications } from './brp';

const brpDataTyped = brpData as ApiSuccessResponse<BRPDataFromSource>;
const {
  content: { adres },
} = brpDataTyped;

describe('BRP data api + transformation', () => {
  it('should construct a bag search addresss', () => {
    expect(getBagSearchAddress(adres)).toBe('Amstel 1');
  });

  it('should construct a complete addresss', () => {
    expect(
      getFullAddress({ ...adres, huisletter: 'X', huisnummertoevoeging: 'h' })
    ).toBe('Amstel 1 X h');
  });

  it('should transform the source data', () => {
    expect(transformBRPData(brpDataTyped)).toMatchSnapshot();
  });

  it('should transform the source data into notifications', () => {
    const data = transformBRPData(brpDataTyped);
    expect(
      transformBRPNotifications(data, new Date(2020, 3, 23))
    ).toMatchSnapshot();
  });
});
