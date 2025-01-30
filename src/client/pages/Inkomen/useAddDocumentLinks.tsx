import { useMemo } from 'react';

import { WpiIncomeSpecificationTransformed } from '../../../server/services/wpi/wpi-types';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';

export function useAddDocumentLinkComponents(
  specificaties: WpiIncomeSpecificationTransformed[],
  jaaropgaven: WpiIncomeSpecificationTransformed[]
) {
  return useMemo(() => {
    if (jaaropgaven.length) {
      jaaropgaven = jaaropgaven.map((document) => {
        const documentUrl = <DocumentLink document={document} label="PDF" />;
        return Object.assign({}, document, { documentUrl });
      });
    }
    if (specificaties.length) {
      specificaties = specificaties.map((document) => {
        const documentUrl = <DocumentLink document={document} label="PDF" />;
        return Object.assign({}, document, { documentUrl });
      });
    }
    return {
      jaaropgaven,
      specificaties,
    };
  }, [specificaties, jaaropgaven]);
}
