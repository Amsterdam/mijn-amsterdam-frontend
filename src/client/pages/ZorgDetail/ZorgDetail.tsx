import { Grid } from '@amsterdam/design-system-react';
import { Datalist } from '../../components/Datalist/Datalist';
import StatusDetail from '../StatusDetail/StatusDetail';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';

export default function ZorgDetail() {
  return (
    <StatusDetail
      stateKey="WMO"
      thema="ZORG"
      pageContent={(isLoading, statusItem) => {
        const rows = [];
        if (statusItem?.resultaat) {
          rows.push({ content: statusItem?.resultaat, label: 'Resultaat' });
        }
        if (statusItem?.supplier) {
          rows.push({ content: statusItem?.supplier, label: 'Aanbieder' });
        }

        return (
          <>
            {!!rows.length && (
              <Grid.Cell span="all">
                <Datalist rows={rows} />
              </Grid.Cell>
            )}
            {status?.documents?.length > 0 && (
              <Grid.Cell span="all">
                <DocumentListV2
                  documents={statusItem.documents}
                  columns={['Documenten', 'Verzenddatum']}
                />
              </Grid.Cell>
            )}
          </>
        );
      }}
      documentPathForTracking={(document) =>
        `/downloads/zorg-en-ondersteuning/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
