import { generatePath } from 'react-router';

import { themaConfig } from './Erfpacht-thema-config';
import type { AfisFactuurState } from '../../../../server/services/afis/afis-types';
import { type AfisFactuurFrontend } from '../Afis/Afis-thema-config';
import { getFactuurNummerLink } from '../Afis/useAfisFacturenApi';

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
