import { generatePath, useParams } from 'react-router';

import type { ErfpachtDossiersDetail } from '../../../../../../../server/services/erfpacht/erfpacht-types.ts';
import { BFFApiUrls } from '../../../../config/api.ts';
<<<<<<<< HEAD:src/client/apps/bob/pages/Thema/Erfpacht/DossierDetail/useErfpachtDossierData.hook.ts
import { useBffApi } from '../../../../../../hooks/api/useBffApi.ts';
import { useErfpachtThemaData } from '../useErfpachtThemaData.hook.ts';
========
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { useErfpachtThemaData } from '../useErfpachtThemaData.hook.tsx';
>>>>>>>> origin/main:src/client/apps/bob/pages/Thema/Erfpacht/DossierDetail/useErfpachtDossierDetailData.hook.ts

export function useDossierDetailData() {
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
    zaken,
    tableConfig,
  } = useErfpachtThemaData();

  const url = dossierId
    ? `${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierId}`
    : undefined;

  const { data, isLoading, isError } = useBffApi<ErfpachtDossiersDetail>(url);
  const dossier = data?.content ?? null;
  const zaken_ = dossier
    ? zaken.filter((zaak) => zaak.zaakDossiers?.includes(dossier.dossierNummer))
    : [];

  return {
    themaId,
    title: dossier?.title ?? 'Erfpachtdossier',
    dossier,
    zaken: zaken_,
    isLoading,
    isError,
    isLoadingThemaData,
    isErrorThemaData,
    relatieCode,
    breadcrumbs,
    themaConfig,
    tableConfigZaken: {
      ...tableConfig['erfpacht-dossier-detail-zaken'],
      listPageRoute: dossierId
        ? generatePath(themaConfig.listPageDossierZaken.route.path, {
            dossierId,
          })
        : '',
    },
  };
}
