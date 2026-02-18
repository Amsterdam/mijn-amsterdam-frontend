import { useParams } from 'react-router';

import { useBezwarenThemaData } from './useBezwarenThemaData.hook';
import { BezwaarDetail } from '../../../../server/services/bezwaren/bezwaren';
import { hasFailedDependency } from '../../../../universal/helpers/api';
import { uniqueArray } from '../../../../universal/helpers/utils';
import { useBffApi } from '../../../hooks/api/useBffApi';

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
