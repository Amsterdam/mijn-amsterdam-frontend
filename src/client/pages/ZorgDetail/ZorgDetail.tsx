import { Grid } from '@amsterdam/design-system-react';
import { DocumentList, InfoDetail } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import StatusDetail from '../StatusDetail/StatusDetail';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';
import { defaultDateFormat } from '../../../universal/helpers/date';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';

export default function ZorgDetail() {
  return (
    <StatusDetail
      stateKey="WMO"
      thema="ZORG"
      pageContent={(isLoading, statusItem) => {
        let documents = statusItem?.steps?.flatMap((step) => step.documents);
        const dates = statusItem?.steps?.map((step) => step.datePublished);
        return (
          <>
            {statusItem?.supplier && (
              <Grid.Cell span="all">
                <Datalist
                  rows={[{ content: statusItem.supplier, label: 'Aanbieder' }]}
                />
              </Grid.Cell>
            )}
            <Grid.Cell span="all">
              <DocumentListV2 documents={documents} />
            </Grid.Cell>{' '}
          </>
        );
      }}
      documentPathForTracking={(document) =>
        `/downloads/zorg-en-ondersteuning/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
