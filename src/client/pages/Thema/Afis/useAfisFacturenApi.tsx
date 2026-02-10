import { type ReactNode, useMemo } from 'react';

import {
  type AfisFacturenByStateFrontend,
  type AfisFactuurFrontend,
} from './Afis-thema-config';
import type {
  AfisThemaResponse,
  AfisFactuurState,
  AfisFacturenResponse,
  AfisFactuurStateFrontend,
  AfisFacturenOverviewResponse,
  AfisFactuur,
} from '../../../../server/services/afis/afis-types';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { entries, omit } from '../../../../universal/helpers/utils';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink';
import { generateBffApiUrlWithEncryptedPayloadQuery } from '../../../helpers/api';
import { useBffApi } from '../../../hooks/api/useBffApi';

function getInvoiceStatusDescriptionFrontend(factuur: AfisFactuur): ReactNode {
  switch (true) {
    case factuur.status === 'openstaand' && !!factuur.paylink:
      return (
        <>
          <>{capitalizeFirstLetter(factuur.status)}: </>
          <MaLink
            maVariant="fatNoUnderline"
            target="_blank"
            href={factuur.paylink}
          >
            {factuur.statusDescription}
          </MaLink>
        </>
      );
    default:
      return factuur.statusDescription;
  }
}

export function getDocumentLink(factuur: AfisFactuurFrontend): ReactNode {
  if (factuur.documentDownloadLink) {
    return (
      <DocumentLink
        document={{
          id: factuur.factuurNummer,
          datePublished: factuur.datePublished ?? '',
          url: factuur.documentDownloadLink,
          title: `factuur ${factuur.factuurNummer}`,
        }}
      />
    );
  }
  return null;
}

export function getFactuurNummerLink(
  factuur: Pick<AfisFactuur, 'factuurNummer' | 'link'>,
  to?: string
): ReactNode {
  return (
    <MaRouterLink
      maVariant="fatNoDefaultUnderline"
      href={to ?? factuur.link.to}
    >
      {factuur.factuurNummer}
    </MaRouterLink>
  );
}

function transformFactuur(factuur: AfisFactuur): AfisFactuurFrontend {
  const factuurNummerEl: ReactNode = getFactuurNummerLink(factuur);

  return {
    ...factuur,
    statusDescription: getInvoiceStatusDescriptionFrontend(factuur),
    factuurNummerEl,
  };
}

export function useTransformFacturen(
  facturenByState: Partial<AfisFacturenOverviewResponse> | null
): AfisFacturenByStateFrontend | null {
  const facturenByStateTransformed: AfisFacturenByStateFrontend | null =
    useMemo(() => {
      if (facturenByState) {
        return Object.fromEntries(
          entries(facturenByState)
            .filter(
              (
                state
              ): state is [AfisFactuurStateFrontend, AfisFacturenResponse] => {
                const [_state, _facturenResponse] = state;
                return _facturenResponse != null;
              }
            )
            .map(([state, facturenResponse]) => [
              state,
              {
                ...omit(facturenResponse, ['facturen']),
                facturen:
                  facturenResponse?.facturen?.map((factuur) =>
                    transformFactuur(factuur)
                  ) ?? [],
              },
            ])
        );
      }
      return null;
    }, [facturenByState]);

  return facturenByStateTransformed;
}

/**
 * Uses /overview endpoint for Open and Overview facturen (All the Open facuren are loaded with this endpoint)
 * Uses /facturen/(afgehandeld|overgedragen) for the facturen with this state.
 */

export function useAfisFacturenApi(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined,
  state: AfisFactuurState,
  detailPath?: string
) {
  const url =
    businessPartnerIdEncrypted && state && state !== 'open'
      ? generateBffApiUrlWithEncryptedPayloadQuery(
          'AFIS_FACTUREN',
          businessPartnerIdEncrypted,
          {
            state,
          },
          'id'
        )
      : null;

  const { data, isError, isLoading } = useBffApi<AfisFacturenResponse>(url);
  const facturenResponse = data?.content ?? null;
  const facturenByStateApiUpdated = useTransformFacturen(
    facturenResponse
      ? {
          [facturenResponse.state]: facturenResponse,
        }
      : null
  );

  return {
    facturenByState: facturenByStateApiUpdated,
    isLoading,
    isError,
  } as const;
}

export const forTesting = {
  getInvoiceStatusDescriptionFrontend,
  transformFactuur,
};
