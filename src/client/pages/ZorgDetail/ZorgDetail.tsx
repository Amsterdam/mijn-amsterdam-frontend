import { Grid } from '@amsterdam/design-system-react';
import { InfoDetail } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import StatusDetail from '../StatusDetail/StatusDetail';

export default function ZorgDetail() {
  return (
    <StatusDetail
      stateKey="WMO"
      thema="ZORG"
      pageContent={(isLoading, statusItem) => {
        return (
          statusItem?.supplier && (
            <Grid.Cell span="all">
              <Datalist
                rows={[{ content: statusItem.supplier, label: 'Aanbieder' }]}
              />
            </Grid.Cell>
          )
        );
      }}
      documentPathForTracking={(document) =>
        `/downloads/zorg-en-ondersteuning/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
