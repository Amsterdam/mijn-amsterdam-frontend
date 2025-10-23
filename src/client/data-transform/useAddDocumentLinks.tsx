import { useMemo } from 'react';

import { GenericDocument } from '../../universal/types/App.types';
import { DocumentLink } from '../components/DocumentList/DocumentLink';

export function useAddDocumentLinkComponents<T extends GenericDocument>(
  specificaties: T[]
) {
  return useMemo(() => {
    return specificaties.map((document) => {
      const documentUrl = <DocumentLink document={document} label="PDF" />;
      return Object.assign({}, document, { documentUrl });
    });
  }, [specificaties]);
}
