import { useMemo } from 'react';
import { AppState } from '../../AppState';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';

export function useAddDocumentLinkComponents(
  WPI_SPECIFICATIES: AppState['WPI_SPECIFICATIES']
) {
  return useMemo(() => {
    if (WPI_SPECIFICATIES?.content) {
      const wpiSpecificatiesContent = {
        ...WPI_SPECIFICATIES.content,
      };
      if (wpiSpecificatiesContent.jaaropgaven) {
        wpiSpecificatiesContent.jaaropgaven =
          wpiSpecificatiesContent.jaaropgaven.map((document) => {
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
      if (wpiSpecificatiesContent.uitkeringsspecificaties) {
        wpiSpecificatiesContent.uitkeringsspecificaties =
          wpiSpecificatiesContent.uitkeringsspecificaties.map((document) => {
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
        content: wpiSpecificatiesContent,
      };
    }
    return WPI_SPECIFICATIES;
  }, [WPI_SPECIFICATIES]);
}
