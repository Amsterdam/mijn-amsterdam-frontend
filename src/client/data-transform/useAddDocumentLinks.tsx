import { useMemo } from 'react';

import type { GenericDocument } from '../../universal/types/App.types.ts';
import { DocumentLink } from '../components/DocumentList/DocumentLink.tsx';

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
