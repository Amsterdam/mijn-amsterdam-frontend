import { generatePath } from 'react-router';

import { themaConfig } from './Erfpacht-thema-config.ts';
import type { AfisFactuurState } from '../../../../server/services/afis/afis-types.ts';
import { type AfisFactuurFrontend } from '../Afis/Afis-thema-config.ts';
import { getFactuurNummerLink } from '../Afis/useAfisFacturenApi.tsx';

export const filterErfpachtFacturen = (factuur: AfisFactuurFrontend) =>
  factuur.afzender.toLowerCase().includes('erfpacht');

export const mapErfpachtFacturen = (
  factuur: AfisFactuurFrontend,
  state: AfisFactuurState = 'open'
) => {
  return {
    ...factuur,
    factuurNummerEl: getFactuurNummerLink(
      factuur,
      generatePath(themaConfig.detailPageFactuur.route.path, {
        state,
        factuurNummer: factuur.factuurNummer,
      })
    ),
  };
};
