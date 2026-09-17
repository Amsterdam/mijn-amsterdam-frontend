import { useParams } from 'react-router';

import { addLinkToDossiernummers } from './Erfpacht-helpers.tsx';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook.tsx';
import type { ErfpachtZaakDetailFrontend } from '../../../../../../server/services/erfpacht/erfpacht-zaken-types.ts';
import { useBffApi } from '../../../../../hooks/api/useBffApi.ts';

export function useZaakDetailData() {
  const { uuid } = useParams<{
    uuid: string;
  }>();

  const {
    zaken,
    dossiers,
    isError: isErrorThemaData,
    isLoading: isLoadingThemaData,
    breadcrumbs,
    themaId,
    themaConfig,
    tableConfig,
  } = useErfpachtThemaData();

  const zaakBase = zaken.find((zaak) => zaak.zaakUuid === uuid);

  const { data, isLoading, isError } = useBffApi<ErfpachtZaakDetailFrontend>(
    zaakBase?.fetchZaakDetailUrl ?? null
  );
  const zaak = data?.content ? addLinkToDossiernummers(data.content) : null;
  const dossiers_ =
    zaak?.zaakDossiers
      ?.map((dossierNummer) => {
        return (
          dossiers.find(
            (dossierBase) => dossierBase.dossierNummer === dossierNummer
          ) ?? null
        );
      })
      .filter((dossier) => dossier !== null) ?? [];

  return {
    themaId,
    title: zaak?.title ?? 'Wijzigingsaanvraag erfpachtrecht',
    zaak,
    dossiers: dossiers_,
    isLoading,
    isError,
    isLoadingThemaData,
    isErrorThemaData,
    breadcrumbs,
    themaConfig,
    tableConfig,
  };
}
