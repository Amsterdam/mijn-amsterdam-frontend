import { useParams } from 'react-router';
import useSWR from 'swr';

import { useBezwarenThemaData } from './useBezwarenThemaData.hook.ts';
import { BezwaarDetail } from '../../../../server/services/bezwaren/bezwaren.ts';
import { FIFTEEN_MINUTES_MS } from '../../../../universal/config/app.ts';
import {
  ApiSuccessResponse,
  hasFailedDependency,
  isError,
} from '../../../../universal/helpers/api.ts';
import { uniqueArray } from '../../../../universal/helpers/utils.ts';

export function useBezwarenDetailData() {
  const {
    bezwaren,
    routeConfig,
    isError: isErrorThemaData,
    isLoading: isLoadingThemaData,
    breadcrumbs,
  } = useBezwarenThemaData();
  const { uuid } = useParams<{ uuid: string }>();

  const bezwaar = bezwaren.find((b) => b.uuid === uuid) ?? null;

  const {
    data: bezwaarDetailResponse,
    isLoading,
    error,
  } = useSWR<ApiSuccessResponse<BezwaarDetail>>(
    bezwaar?.fetchUrl,
    (url: string) =>
      fetch(url, { credentials: 'include' }).then((response) =>
        response.json()
      ),

    { dedupingInterval: FIFTEEN_MINUTES_MS }
  );

  const bezwaarDetail = bezwaarDetailResponse?.content;
  const documents = bezwaarDetail?.documents ?? [];
  const statussen = bezwaarDetail?.statussen ?? [];

  const documentCategories = uniqueArray(
    documents.map((d) => d.dossiertype).filter(Boolean)
  ).sort();

  return {
    title: bezwaar?.identificatie ?? 'Bezwaar',
    routeConfig,
    bezwaar,
    bezwaarDetail,
    documents,
    statussen,
    documentCategories,
    isLoading,
    isLoadingThemaData,
    isErrorThemaData,
    isError:
      !!error ||
      (bezwaarDetailResponse ? isError(bezwaarDetailResponse) : false),
    dependencyErrors: bezwaarDetailResponse
      ? {
          Documenten: hasFailedDependency(bezwaarDetailResponse, 'documents'),
          Statussen: hasFailedDependency(bezwaarDetailResponse, 'statussen'),
        }
      : null,
    breadcrumbs,
  };
}
