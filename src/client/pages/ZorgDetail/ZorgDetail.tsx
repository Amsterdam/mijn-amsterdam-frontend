import { InfoDetail } from '../../components';
import StatusDetail from '../StatusDetail/StatusDetail';

export default function ZorgDetail() {
  return (
    <StatusDetail
      stateKey="WMO"
      chapter="ZORG"
      pageContent={(isLoading, statusItem) => {
        return (
          statusItem?.supplier && (
            <InfoDetail label="Aanbieder" value={statusItem.supplier} />
          )
        );
      }}
    />
  );
}
