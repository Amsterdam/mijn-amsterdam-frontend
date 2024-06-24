import { InfoDetail } from '../../components';
import StatusDetail from '../StatusDetail/StatusDetail';

export default function ZorgDetail() {
  return (
    <StatusDetail
      stateKey="WMO"
      thema="ZORG"
      pageContent={(isLoading, statusItem) => {
        return (
          statusItem?.supplier && (
            <InfoDetail label="Aanbieder" value={statusItem.supplier} />
          )
        );
      }}
      documentPathForTracking={(document) =>
        `/downloads/zorg-en-ondersteuning/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
