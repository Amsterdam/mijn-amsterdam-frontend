import { useMemo } from 'react';

import { tableConfig, linkListItems } from './config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { BRPData } from '../../../universal/types';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

function getFilteredDocuments(documents: BRPData['identiteitsbewijzen']) {
  return addLinkElementToProperty(
    (documents ?? [])?.map((doc) => ({
      ...doc,
      datumAfloop: defaultDateFormat(doc.datumAfloop),
      datumUitgifte: defaultDateFormat(doc.datumUitgifte),
      typeAsLink: doc.documentType,
      steps: [],
    })),
    'typeAsLink'
  );
}

export function useBurgerZakenData() {
  const { BRP } = useAppStateGetter();

  const documents = useMemo(
    () => getFilteredDocuments(BRP.content?.identiteitsbewijzen ?? []),
    [BRP.content?.identiteitsbewijzen]
  );

  return {
    tableConfig,
    linkListItems,
    isLoading: isLoading(BRP),
    isError: isError(BRP),
    documents: [...documents, ...documents, ...documents],
  };
}
