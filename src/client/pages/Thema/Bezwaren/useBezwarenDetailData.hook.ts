import { useEffect } from 'react';

import { useParams } from 'react-router';

import { useBezwarenThemaData } from './useBezwarenThemaData.hook';
import { BezwaarDetail } from '../../../../server/services/bezwaren/bezwaren';
import { uniqueArray } from '../../../../universal/helpers/utils';
import { createApiHook } from '../../../hooks/api/useDataApi-v2';
import {
  createItemStoreHook,
  useApiStoreByKey,
} from '../../../hooks/api/useItemStore';

const useBezwarenDetailApi = createApiHook<BezwaarDetail>();
const useBezwarenItemStore = createItemStoreHook<BezwaarDetail>('zaakId');

export function useBezwarenDetailData() {
  const {
    bezwaren,
    themaId,
    routeConfig,
    isError: isErrorThemaData,
    isLoading: isLoadingThemaData,
    breadcrumbs,
  } = useBezwarenThemaData();
  const { uuid } = useParams<{ uuid: string }>();

  const bezwaar = bezwaren.find((b) => b.uuid === uuid) ?? null;

  const {
    item: bezwaarDetail,
    meta: bezwaarDetailMeta,
    items,
    isLoading,
    isError,
    fetch,
  } = useApiStoreByKey<BezwaarDetail>(
    useBezwarenDetailApi,
    useBezwarenItemStore,
    'zaakId',
    uuid ?? null
  );

  useEffect(() => {
    if (bezwaar?.fetchUrl) {
      fetch(bezwaar.fetchUrl);
    }
  }, [fetch, bezwaar?.fetchUrl]);

  const documents = bezwaarDetail?.documents ?? [];
  const statussen = bezwaarDetail?.statussen ?? [];

  const documentCategories = uniqueArray(
    documents.map((d) => d.dossiertype).filter(Boolean)
  ).sort();

  return {
    themaId,
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
      isError || isErrorThemaData || !!bezwaarDetailMeta?.failedDependencies,
    dependencyErrors: bezwaarDetailMeta
      ? {
          Documenten: 'documents' in bezwaarDetailMeta.failedDependencies,
          Statussen: 'statussen' in bezwaarDetailMeta.failedDependencies,
        }
      : null,
    breadcrumbs,
  };
}
