import { generatePath } from 'react-router';

import { themaConfig } from './Erfpacht-thema-config.ts';
import type { AfisFactuurState } from '../../../../../../server/services/afis/afis-types.ts';
import type { LinkProps } from '../../../../../../universal/types/App.types.ts';
import { MaRouterLink } from '../../../../../components/MaLink/MaLink.tsx';
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

export function addLinkToDossiernummers<
  T extends { dossierLinks?: Array<string | LinkProps> },
>(zaak: T) {
  return {
    ...zaak,
    dossierLinks: (
      zaak.dossierLinks?.map((link) => {
        if (typeof link === 'string') {
          return link;
        }
        return (
          <MaRouterLink maVariant="noUnderline" key={link.to} href={link.to}>
            {link.title}
          </MaRouterLink>
        );
      }) ?? []
    ).flatMap((x, i, all) => {
      return i < all.length - 1 ? [x, ', '] : x;
    }),
  };
}
