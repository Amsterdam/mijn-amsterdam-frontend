import { type ReactNode, useMemo } from 'react';

import { generatePath } from 'react-router';

import {
  routeConfig,
  type AfisFacturenByStateFrontend,
} from './Afis-thema-config';
import type {
  AfisThemaResponse,
  AfisFactuurState,
  AfisFacturenResponse,
  AfisFacturenByStateResponse,
  AfisFactuur,
} from '../../../../server/services/afis/afis-types';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { entries } from '../../../../universal/helpers/utils';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink';
import { generateBffApiUrlWithEncryptedPayloadQuery } from '../../../helpers/api';
import { useBffApi } from '../../../hooks/api/useBffApi';

function getInvoiceStatusDescriptionFrontend(factuur: AfisFactuur): ReactNode {
  switch (true) {
    case factuur.status === 'openstaand' && !!factuur.paylink:
      return (
        <>
          <>{capitalizeFirstLetter(factuur.status)}:&nbsp;</>
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

export function getDocumentLink(factuur: AfisFactuur): ReactNode {
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

function transformFactuur(factuur: AfisFactuur, state: AfisFactuurState) {
  const factuurNummerEl: ReactNode = (
    <MaRouterLink
      maVariant="fatNoDefaultUnderline"
      href={generatePath(routeConfig.detailPage.path, {
        factuurNummer: factuur.factuurNummer,
        state,
      })}
    >
      {factuur.factuurNummer}
    </MaRouterLink>
  );

  return {
    ...factuur,
    statusDescription: getInvoiceStatusDescriptionFrontend(factuur),
    factuurNummerEl,
  };
}

export function useTransformFacturen(
  facturenByState: AfisFacturenByStateResponse | null
): AfisFacturenByStateFrontend | null {
  const facturenByStateTransformed: AfisFacturenByStateFrontend | null =
    useMemo(() => {
      if (facturenByState) {
        return Object.fromEntries(
          entries(facturenByState)
            .filter(([_state, facturenResponse]) => facturenResponse !== null)
            .map(([state, facturenResponse]) => [
              state,
              {
                ...facturenResponse,
                facturen:
                  facturenResponse?.facturen?.map((factuur) =>
                    transformFactuur(factuur, state)
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
  state: AfisFactuurState
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
