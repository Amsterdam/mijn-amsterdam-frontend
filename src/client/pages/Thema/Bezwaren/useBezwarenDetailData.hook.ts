import { useParams } from 'react-router';

import { useBezwarenThemaData } from './useBezwarenThemaData.hook.ts';
import type { BezwaarDetail } from '../../../../server/services/bezwaren/bezwaren.ts';
import { hasFailedDependency } from '../../../../universal/helpers/api.ts';
import { uniqueArray } from '../../../../universal/helpers/utils.ts';
import { useBffApi } from '../../../hooks/api/useBffApi.ts';

export function useBezwarenDetailData() {
  const {
    bezwaren,
    isError: isErrorThemaData,
    isLoading: isLoadingThemaData,
    breadcrumbs,
    themaConfig,
    themaId,
  } = useBezwarenThemaData();
  const { uuid } = useParams<{ uuid: string }>();

  const bezwaar = bezwaren.find((b) => b.uuid === uuid) ?? null;

  const url = bezwaar?.fetchUrl;
  const { data, isLoading, isError } = useBffApi<BezwaarDetail>(url);
  const bezwaarDetail = data?.content ?? null;

  const documents = bezwaarDetail?.documents ?? [];
  const statussen = bezwaarDetail?.statussen ?? [];

  const documentCategories = uniqueArray(
    documents.map((d) => d.dossiertype).filter(Boolean)
  ).sort();

  const hasFailedDependencies =
    hasFailedDependency(data, 'documents') ||
    hasFailedDependency(data, 'statussen');

  return {
    themaId,
    title: bezwaar?.identificatie ?? 'Bezwaar',
    bezwaar,
    bezwaarDetail,
    documents,
    statussen,
    documentCategories,
    isLoading,
    isLoadingThemaData,
    isErrorThemaData,
    isError: isError || isErrorThemaData || hasFailedDependencies,
    dependencyErrors: hasFailedDependencies
      ? {
          Documenten: hasFailedDependency(data, 'documents'),
          Statussen: hasFailedDependency(data, 'statussen'),
        }
      : null,
    breadcrumbs,
    themaConfig,
  };
}
