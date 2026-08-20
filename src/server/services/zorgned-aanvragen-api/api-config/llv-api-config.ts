import { entries } from '../../../../universal/helpers/utils.ts';
import { jeugdStatusLineItemsConfig } from '../../jzd/jeugd/status-line-items.ts';
import type { AanvragenApiConfig } from '../zorgned-aanvragen-api-types.ts';

export const llvAanvragenApiConfig: AanvragenApiConfig[] = [
  /////////////////////////////
  // Leerlingenvervoer ////////
  /////////////////////////////
  {
    assign: {
      maCategorie: ['A-LLV'],
      maActies: ['stopzetten', 'stopzetten-tijdelijk'],
    },
    include: {
      isActueel: true,
      productIdentificatie: [
        'LLVFV',
        'LLVOVA',
        'LLVOVV',
        'LLVEV',
        'LLVAV',
        'LLVAVG',
      ],
    },
  },
  // // // // // // // // // // // // // // // // // // // // // // // // //
  // No specific actions assigned, but we still want to make these items available in the API for filtering based on productgroep.
  // // // // // // // // // // // // // // // // // // // // // // // // //
  ...jeugdStatusLineItemsConfig
    .filter((lineItemConfig) => {
      return lineItemConfig.isDisabled !== true;
    })
    .map((lineItemConfig) => {
      const match = {
        leveringsVorm: lineItemConfig.leveringsVorm,
        resultaat: lineItemConfig.resultaat,
        productsoortCode: lineItemConfig.productsoortCodes,
      };

      return {
        include: Object.fromEntries(
          entries(match).filter(([_, value]) => typeof value !== 'undefined')
        ) as AanvragenApiConfig['include'],
        assign: {
          maProductgroep: lineItemConfig.productgroep,
        },
      };
    }),
];
