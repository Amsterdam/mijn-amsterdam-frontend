import type { ZaakStatussenResponseSource } from './erfpacht-zaken-types.ts';
import { forTesting } from './erfpacht-zaken.ts';
import ERFPACHT_ZAAK_DETAIL from '../../../mocks-server/fixtures/erfpacht/erfpacht-zaak-detail.json' with { type: 'json' };

describe('erfpacht-zaken', () => {
  describe('transformErfpachtZaakDetailResponse', () => {
    test('should transform zaak detail response correctly', () => {
      const transformedResponse =
        forTesting.transformErfpachtZaakDetailResponse(
          ERFPACHT_ZAAK_DETAIL as ZaakStatussenResponseSource
        );
      expect(transformedResponse).toMatchInlineSnapshot(`
        {
          "result": "Aangegaan",
          "steps": [
            {
              "datePublished": "2026-02-25T14:12:22.808Z",
              "description": "",
              "id": "392366984",
              "isActive": false,
              "isChecked": true,
              "isVisible": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "",
              "description": "",
              "id": "444832057",
              "isActive": false,
              "isChecked": false,
              "isVisible": false,
              "status": "Meer informatie nodig",
            },
            {
              "datePublished": "2026-02-25T14:14:55.89Z",
              "description": "Wij hebben uw aanvraag in behandeling genomen.",
              "id": "1078733647",
              "isActive": false,
              "isChecked": true,
              "isVisible": true,
              "status": "In behandeling",
            },
            {
              "datePublished": "2026-02-25T14:22:42.057Z",
              "description": "Wij hebben uw aanvraag afgerond en hebben u hierover bericht gestuurd.",
              "id": "508338350",
              "isActive": true,
              "isChecked": true,
              "isVisible": true,
              "status": "Afgehandeld",
            },
          ],
        }
      `);
    });
  });
});
