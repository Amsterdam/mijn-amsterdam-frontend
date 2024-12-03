import { transformBRPData, transformBRPNotifications } from './brp';
import brpData from '../../../mocks/fixtures/brp.json';
import { ApiSuccessResponse } from '../../universal/helpers/api';
import { getBagSearchAddress } from '../../universal/helpers/bag';
import { getFullAddress } from '../../universal/helpers/brp';
import { BRPDataFromSource } from '../../universal/types/brp';

const brpDataTyped = brpData as ApiSuccessResponse<BRPDataFromSource>;
const {
  content: { adres },
} = brpDataTyped;

describe('BRP data api + transformation', () => {
  it('should construct a bag search addresss', () => {
    expect(getBagSearchAddress(adres)).toBe('Weesperstraat 113');
  });

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
    ).toMatchSnapshot();
  });
});
