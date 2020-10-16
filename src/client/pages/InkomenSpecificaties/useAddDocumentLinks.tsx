import React, { useMemo } from 'react';
import { AppState } from '../../AppState';
import { DocumentLink } from '../../components/DocumentList/DocumentList';

export function useAddDocumentLinkComponents(
  FOCUS_SPECIFICATIES: AppState['FOCUS_SPECIFICATIES']
) {
  return useMemo(() => {
    if (FOCUS_SPECIFICATIES?.content) {
      const focusSpecificatiesContent = {
        ...FOCUS_SPECIFICATIES.content,
      };
      if (focusSpecificatiesContent.jaaropgaven) {
        focusSpecificatiesContent.jaaropgaven = focusSpecificatiesContent.jaaropgaven.map(
          document => {
            const documentUrl = (
              <DocumentLink document={document} label="PDF" />
            );
            return Object.assign({}, document, { documentUrl });
          }
        );
      }
      if (focusSpecificatiesContent.uitkeringsspecificaties) {
        focusSpecificatiesContent.uitkeringsspecificaties = focusSpecificatiesContent.uitkeringsspecificaties.map(
          document => {
            const documentUrl = (
              <DocumentLink document={document} label="PDF" />
            );
            return Object.assign({}, document, { documentUrl });
          }
        );
      }
      return {
        ...FOCUS_SPECIFICATIES,
        content: focusSpecificatiesContent,
      };
    }
    return FOCUS_SPECIFICATIES;
  }, [FOCUS_SPECIFICATIES]);
}
