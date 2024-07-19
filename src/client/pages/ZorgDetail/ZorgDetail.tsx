import { Grid } from '@amsterdam/design-system-react';
import { Datalist } from '../../components/Datalist/Datalist';
import StatusDetail from '../StatusDetail/StatusDetail';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';

export default function ZorgDetail() {
  return (
    <StatusDetail
      stateKey="WMO"
      thema="ZORG"
      pageContent={(isLoading, statusItem) => {
        let documents = statusItem?.steps?.flatMap((step) => step.documents);
        const resultaat =
          statusItem?.resultaat && capitalizeFirstLetter(statusItem?.resultaat);
        return (
          <>
            {resultaat && (
              <Grid.Cell span="all">
                <Datalist rows={[{ content: resultaat, label: 'Resultaat' }]} />
              </Grid.Cell>
            )}
            {statusItem?.supplier && (
              <Grid.Cell span="all">
                <Datalist
                  rows={[{ content: statusItem.supplier, label: 'Aanbieder' }]}
                />
              </Grid.Cell>
            )}
            <Grid.Cell span="all">
              <DocumentListV2
                documents={documents}
                columns={['Documenten', 'Verzenddatum']}
              />
            </Grid.Cell>
          </>
        );
      }}
      documentPathForTracking={(document) =>
        `/downloads/zorg-en-ondersteuning/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
