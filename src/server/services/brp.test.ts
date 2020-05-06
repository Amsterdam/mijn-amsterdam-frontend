import { getBagSearchAddress } from './brp';
const rs = true;

const adres = {
  inOnderzoek: true,
  huisletter: null,
  huisnummer: '1',
  huisnummertoevoeging: null,
  postcode: '1064 BH',
  straatnaam: 'Burgemeester R\u00f6ellstr',
  woonplaatsNaam: 'Amsterdam',
  begindatumVerblijf: '1967-01-01T00:00:00Z',
};

describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(getBagSearchAddress(adres)).toBe('Burgemeester R\u00f6ellstr 1');
  });
});
