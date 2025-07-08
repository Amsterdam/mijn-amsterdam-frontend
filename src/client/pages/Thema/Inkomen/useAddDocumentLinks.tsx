import { useMemo } from 'react';

import { WpiIncomeSpecificationTransformed } from '../../../../server/services/wpi/wpi-types.ts';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink.tsx';

export function useAddDocumentLinkComponents(
  specificaties: WpiIncomeSpecificationTransformed[]
) {
  return useMemo(() => {
    return specificaties.map((document) => {
      const documentUrl = <DocumentLink document={document} label="PDF" />;
      return Object.assign({}, document, { documentUrl });
    });
  }, [specificaties]);
}
