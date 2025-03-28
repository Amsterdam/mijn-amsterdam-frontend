import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import { useBezwarenThemaData } from './useBezwarenThemaData.hook';
import { BezwaarDetail } from '../../../server/services/bezwaren/bezwaren';
import { FIFTEEN_MINUTES_MS } from '../../../universal/config/app';
import {
  ApiSuccessResponse,
  hasFailedDependency,
  isError,
} from '../../../universal/helpers/api';
import { uniqueArray } from '../../../universal/helpers/utils';

export function useBezwarenDetailData() {
  const {
    bezwaren,
    routes,
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
    routes,
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
