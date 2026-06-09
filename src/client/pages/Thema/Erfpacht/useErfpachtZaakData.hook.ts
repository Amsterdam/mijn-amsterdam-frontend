import { generatePath, useParams } from 'react-router';

import { useErfpachtThemaData } from './useErfpachtThemaData.hook.ts';
import type { ErfpachtZaakDetailFrontend } from '../../../../server/services/erfpacht/erfpacht-zaken-types.ts';
import { useBffApi } from '../../../hooks/api/useBffApi.ts';

export function useZaakDetailData() {
  const { uuid } = useParams<{
    uuid: string;
  }>();

  const {
    zaken,
    isError: isErrorThemaData,
    isLoading: isLoadingThemaData,
    breadcrumbs,
    themaId,
    themaConfig,
  } = useErfpachtThemaData();

  const zaakBase = zaken.find((zaak) => zaak.zaakUuid === uuid);

  const { data, isLoading, isError } = useBffApi<ErfpachtZaakDetailFrontend>(
    zaakBase?.fetchZaakDetailUrl ?? null
  );
  const zaak = data?.content ?? null;

  return {
    themaId,
    title: zaak?.title ?? 'Wijzigen Erfpachtrecht',
    zaak,
    dossiersLinks:
      zaakBase?.zaakDossiers?.map((dossierId) => {
        return {
          url: generatePath(themaConfig.detailPageDossier.route.path, {
            dossierId,
          }),
          title: dossierId,
        };
      }) ?? [],
    isLoading,
    isError,
    isLoadingThemaData,
    isErrorThemaData,
    breadcrumbs,
    themaConfig,
  };
}
