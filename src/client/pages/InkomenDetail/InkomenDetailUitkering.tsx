import { useCallback } from 'react';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export const MAX_STEP_COUNT_WPI_REQUEST = 4;

export default function InkomenDetailUitkering() {
  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <p>
            Hieronder ziet u de status van uw aanvraag voor een
            bijstandsuitkering. Het duurt maximaal 3 werkdagen voordat uw
            documenten over de bijstandsuitkering in Mijn Amsterdam staan.
          </p>
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_BIJSTANDSUITKERING}>
              Meer informatie over de bijstandsuitkering
            </Linkd>
          </p>
        </>
      );
    },
    []
  );

  return (
    <StatusDetail
      chapter="INKOMEN"
      stateKey="WPI_AANVRAGEN"
      pageContent={pageContent}
      maxStepCount={(hasDecision) =>
        !hasDecision ? MAX_STEP_COUNT_WPI_REQUEST : undefined
      }
      documentPathForTracking={(document) =>
        `/downloads/inkomen/bijstandsuitkering/${document.title.replace(
          /\\n/,
          ''
        )}`
      }
    />
  );
}
