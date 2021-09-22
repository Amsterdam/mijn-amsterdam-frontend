import { useCallback } from 'react';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import StatusDetail from '../StatusDetail/StatusDetail';

export function InkomenDetailTozo() {
  const pageContent = useCallback((isLoading, inkomenItem) => {
    return (
      <>
        <p>
          Hieronder ziet u de status van uw aanvraag voor de{' '}
          {inkomenItem?.productTitle || 'Tozo'}. Als u meerdere aanvragen voor
          de {inkomenItem?.productTitle || 'Tozo'} hebt gedaan, dan krijgt u 1
          besluit als antwoord op al uw aanvragen voor de{' '}
          {inkomenItem?.productTitle || 'Tozo'}. Het duurt maximaal 3 werkdagen
          voordat uw documenten over de {inkomenItem?.productTitle || 'Tozo'} in
          Mijn Amsterdam staan.
        </p>
        {!isLoading && (
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_TOZO}>
              Meer informatie over de Tozo
            </Linkd>
          </p>
        )}
      </>
    );
  }, []);

  return (
    <StatusDetail
      chapter="INKOMEN"
      stateKey="FOCUS_TOZO"
      showToggleMore={false}
      pageContent={pageContent}
      maxStepCount={() => -1}
      highlightKey={false}
      statusLabel={(statusItem) => `${statusItem?.productTitle}-aanvraag`}
    />
  );
}

export function InkomenDetailTonk() {
  const pageContent = useCallback((isLoading, inkomenItem) => {
    return (
      <>
        <p>
          Hieronder ziet u de status van uw aanvraag TONK. Als u meerdere
          aanvragen voor de TONK hebt gedaan, dan krijgt u 1 besluit als
          antwoord op al deze aanvragen. Het duurt maximaal 3 werkdagen voordat
          uw documenten over de TONK in Mijn Amsterdam staan.
        </p>
        {!isLoading && (
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_TONK}>
              Meer informatie over de TONK
            </Linkd>
          </p>
        )}
      </>
    );
  }, []);

  return (
    <StatusDetail
      chapter="INKOMEN"
      stateKey="FOCUS_TONK"
      showToggleMore={false}
      pageContent={pageContent}
      maxStepCount={() => -1}
      highlightKey={false}
      statusLabel={(statusItem) => `${statusItem?.productTitle}-aanvraag`}
    />
  );
}

export function InkomenDetailBbz() {
  const pageContent = useCallback((isLoading, inkomenItem) => {
    return (
      <>
        <p>
          Hieronder ziet u de status van uw aanvraag voor een uitkering of
          lening van het Bbz. Ook als u een IOAZ uitkering heeft aangevraagd
          ziet u de status hieronder. Als u meerdere aanvragen voor het Bbz hebt
          gedaan, dan krijgt u 1 besluit als antwoord op al uw aanvragen voor
          het Bbz. Het duurt maximaal 3 werkdagen voordat uw documenten over het
          Bbz in Mijn Amsterdam staan.
        </p>
        <p>
          Hebt u schuldhulp aangevraagd? Dan wordt daarover contact met u
          opgenomen
        </p>
        {!isLoading && (
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_BBZ}>
              Meer informatie over de Bbz
            </Linkd>
          </p>
        )}
      </>
    );
  }, []);

  return (
    <StatusDetail
      chapter="INKOMEN"
      stateKey="FOCUS_BBZ"
      showToggleMore={false}
      pageContent={pageContent}
      maxStepCount={() => -1}
      highlightKey={false}
      statusLabel={(statusItem) => `${statusItem?.productTitle}-aanvraag`}
    />
  );
}

export const MAX_STEP_COUNT_FOCUS_REQUEST = 4;

export function InkomenDetailUitkering() {
  const pageContent = useCallback((isLoading, inkomenItem) => {
    return (
      <>
        <p>
          Hieronder ziet u de status van uw aanvraag voor een
          bijstandsuitkering. Het duurt maximaal 3 werkdagen voordat uw
          documenten over de bijstandsuitkering in Mijn Amsterdam staan.
        </p>
        {!isLoading && (
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_BIJSTANDSUITKERING}>
              Meer informatie over de bijstandsuitkering
            </Linkd>
          </p>
        )}
      </>
    );
  }, []);

  return (
    <StatusDetail
      chapter="INKOMEN"
      stateKey="FOCUS_AANVRAGEN"
      showToggleMore={true}
      pageContent={pageContent}
      maxStepCount={(hasDecision) =>
        !hasDecision ? MAX_STEP_COUNT_FOCUS_REQUEST : undefined
      }
    />
  );
}
