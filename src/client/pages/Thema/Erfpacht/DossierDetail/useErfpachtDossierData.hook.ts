import { useParams } from 'react-router';

import type { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types.ts';
import { BFFApiUrls } from '../../../../config/api.ts';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { useErfpachtThemaData } from '../useErfpachtThemaData.hook.ts';

export function useDossierData() {
  const { dossierId } = useParams<{
    dossierId: string;
  }>();

  const {
    isLoading: isLoadingThemaData,
    isError: isErrorThemaData,
    relatieCode,
    breadcrumbs,
    themaId,
    themaConfig,
  } = useErfpachtThemaData();
  const url = dossierId
    ? `${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierId}`
    : undefined;

  const { data, isLoading, isError } = useBffApi<ErfpachtDossiersDetail>(url);
  const dossier = data?.content ?? null;

  return {
    themaId,
    title: dossier?.title ?? 'Erfpachtdossier',
    dossier,
    isLoading,
    isError,
    isLoadingThemaData,
    isErrorThemaData,
    relatieCode,
    breadcrumbs,
    themaConfig,
  };
}
