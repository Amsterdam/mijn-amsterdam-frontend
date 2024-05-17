import { useCallback } from 'react';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export default function InkomenDetailTonk() {
  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <p>
            Hieronder ziet u de status van uw aanvraag TONK. Als u meerdere
            aanvragen voor de TONK hebt gedaan, dan krijgt u 1 besluit als
            antwoord op al deze aanvragen. Het duurt maximaal 3 werkdagen
            voordat uw documenten over de TONK in Mijn Amsterdam staan.
          </p>
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_TONK}>
              Meer informatie over de TONK
            </Linkd>
          </p>
        </>
      );
    },
    []
  );

  return (
    <StatusDetail
      thema="INKOMEN"
      stateKey="WPI_TONK"
      pageContent={pageContent}
      maxStepCount={() => -1}
      highlightKey={false}
      statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
      documentPathForTracking={(document) =>
        `/downloads/inkomen/tonk/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
