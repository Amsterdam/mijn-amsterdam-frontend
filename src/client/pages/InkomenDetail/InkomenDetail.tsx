import React, { useCallback } from 'react';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import StatusDetail from '../StatusDetail/StatusDetail';

export function InkomenDetailTozo() {
  const pageContent = useCallback((isLoading, inkomenItem) => {
    return (
      <>
        <p>
          Hieronder ziet u hoe het staat met uw aanvraag voor een uitkering of
          lening van de {inkomenItem?.productTitle || 'Tozo'}. Als u een
          uitkering én een lening hebt aangevraagd, dan krijgt u voor allebei
          apart een besluit. Het duurt maximaal 3 dagen voordat uw documenten in
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
          Hieronder ziet u hoe het staat met uw aanvraag voor een uitkering of
          lening van de {inkomenItem?.productTitle || 'Tozo'}. Als u een
          uitkering én een lening hebt aangevraagd, dan krijgt u voor allebei
          apart een besluit. Het duurt maximaal 3 dagen voordat uw documenten in
          Mijn Amsterdam staan.
        </p>
        {!isLoading && (
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_TONK}>
              Meer informatie over de Tonk
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

export const MAX_STEP_COUNT_FOCUS_REQUEST = 4;

export function InkomenDetailUitkering() {
  return (
    <StatusDetail
      chapter="INKOMEN"
      stateKey="FOCUS_AANVRAGEN"
      showToggleMore={true}
      maxStepCount={(hasDecision) =>
        !hasDecision ? MAX_STEP_COUNT_FOCUS_REQUEST : undefined
      }
    />
  );
}
