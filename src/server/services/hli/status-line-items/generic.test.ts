import { forTesting } from './generic';
import { ZorgnedAanvraagTransformed } from '../../zorgned/zorgned-types';

describe('HLI/Status-line-items/Generic', () => {
  describe('getEindeRechtDescription', () => {
    test('Actual, with date visible', () => {
      const description = forTesting.getEindeRechtDescription({
        titel: 'HLI regeling',
        isActueel: true,
        datumEindeGeldigheid: '2024-05-23',
      } as ZorgnedAanvraagTransformed);

      expect(description).toMatchInlineSnapshot(
        `"Uw recht op HLI regeling stopt per 23 mei 2024. U kunt daarna opnieuw een HLI regeling aanvragen."`
      );
    });

    test('Not actual, with date visible', () => {
      const description = forTesting.getEindeRechtDescription({
        titel: 'HLI regeling',
        isActueel: false,
        datumEindeGeldigheid: '2024-05-23',
      } as ZorgnedAanvraagTransformed);

      expect(description).toMatchInlineSnapshot(
        `"Uw recht op HLI regeling is beëindigd per 23 mei 2024."`
      );
    });

    test('Actual, without date visible', () => {
      const description = forTesting.getEindeRechtDescription({
        titel: 'HLI regeling',
        isActueel: true,
        datumEindeGeldigheid: null,
      } as ZorgnedAanvraagTransformed);

      expect(description).toMatchInlineSnapshot(
        `"Als uw recht op HLI regeling stopt, krijgt u hiervan tijdig bericht."`
      );
    });

    test('Not actual, with date visible', () => {
      const description = forTesting.getEindeRechtDescription({
        titel: 'HLI regeling',
        isActueel: false,
        datumEindeGeldigheid: null,
      } as ZorgnedAanvraagTransformed);

      expect(description).toMatchInlineSnapshot(
        `"Uw recht op HLI regeling is beëindigd."`
      );
    });
  });
});
