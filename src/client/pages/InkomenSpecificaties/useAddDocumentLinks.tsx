import { useMemo } from 'react';
import { AppState } from '../../AppState';
import { DocumentLink } from '../../components/DocumentList/DocumentList';

export function useAddDocumentLinkComponents(
  WPI_SPECIFICATIES: AppState['WPI_SPECIFICATIES']
) {
  return useMemo(() => {
    if (WPI_SPECIFICATIES?.content) {
      const focusSpecificatiesContent = {
        ...WPI_SPECIFICATIES.content,
      };
      if (focusSpecificatiesContent.jaaropgaven) {
        focusSpecificatiesContent.jaaropgaven =
          focusSpecificatiesContent.jaaropgaven.map((document) => {
            const documentUrl = (
              <DocumentLink
                document={document}
                label="PDF"
                trackPath={(document) =>
                  `/downloads/inkomen/jaaropgave/${document.title}`
                }
              />
            );
            return Object.assign({}, document, { documentUrl });
          });
      }
      if (focusSpecificatiesContent.uitkeringsspecificaties) {
        focusSpecificatiesContent.uitkeringsspecificaties =
          focusSpecificatiesContent.uitkeringsspecificaties.map((document) => {
            const documentUrl = (
              <DocumentLink
                document={document}
                label="PDF"
                trackPath={(document) =>
                  `/downloads/inkomen/uitkeringsspecificatie/${document.title}`
                }
              />
            );
            return Object.assign({}, document, { documentUrl });
          });
      }
      return {
        ...WPI_SPECIFICATIES,
        content: focusSpecificatiesContent,
      };
    }
    return WPI_SPECIFICATIES;
  }, [WPI_SPECIFICATIES]);
}
