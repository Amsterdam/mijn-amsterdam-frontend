import { getBagSearchAddress, getFullAddress } from '../../universal/helpers';
import { BRPData } from '../../universal/types/brp';
import brpData from '../mock-data/json/brp.json';
import { transformBRPData, transformBRPNotifications } from './brp';

const { adres } = brpData;
const brpDataTyped: BRPData = brpData;

describe('BRP data api + transformation', () => {
  it('should construct a bag search addresss', () => {
    expect(getBagSearchAddress(adres)).toBe('Burgemeester R\u00f6ellstr 1');
  });

  it('should construct a complete addresss', () => {
    expect(
      getFullAddress({ ...adres, huisletter: 'X', huisnummertoevoeging: 'h' })
    ).toBe('Burgemeester R\u00f6ellstr 1 X h');
  });

  it('should transform the source data', () => {
    expect(transformBRPData(brpDataTyped)).toMatchSnapshot();
  });

  it('should transform the source data into notifications', () => {
    expect(
      transformBRPNotifications(brpDataTyped, new Date(2020, 3, 23))
    ).toMatchSnapshot();
  });
});
