import { Link, Paragraph } from '@amsterdam/design-system-react';

import type {
  DecosVergunning,
  PBVergunning,
  ZaakFrontendCombined,
} from '../../../../../server/services/vergunningen/config-and-types';
import {
  getFullAddress,
  getFullName,
} from '../../../../../universal/helpers/brp';
import { GenericDocument } from '../../../../../universal/types/App.types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import DocumentListV2 from '../../../../components/DocumentList/DocumentListV2';
import LoadingContent from '../../../../components/LoadingContent/LoadingContent';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore';
import { featureToggle } from '../Vergunningen-thema-config';

function getMailSubject(
  vergunning: ZaakFrontendCombined<DecosVergunning | PBVergunning>
) {
  return `${vergunning.identifier} - Document opvragen`;
}

function getMailBody(
  vergunning: ZaakFrontendCombined<DecosVergunning | PBVergunning>,
  fullName: string,
  fullAddress: string
) {
  return `Geachte heer/mevrouw,%0D%0A%0D%0AHierbij verzoek ik u om het [document type] document van de vergunning met zaaknummer ${vergunning.identifier} op te sturen.%0D%0A%0D%0AMet vriendelijke groet,%0D%0A%0D%0A${fullName}%0D%0A%0D%0A${fullAddress}`;
}

type VergunningDetailDocumentsListProps = {
  documents: GenericDocument[];
  isLoading: boolean;
  isError: boolean;
  label?: string;
  vergunning: ZaakFrontendCombined<DecosVergunning | PBVergunning>;
};

export function VergunningDetailDocumentsList({
  documents,
  label = 'Documenten',
  isLoading,
  isError,
  vergunning,
}: VergunningDetailDocumentsListProps) {
  const INCLUDE_WOONPLAATS = true;
  const INCLUDE_LAND = false;
  const SEPARATOR = '%0D%0A';

  const appState = useAppStateGetter();
  const fullName = appState.BRP?.content?.persoon
    ? getFullName(appState.BRP.content.persoon)
    : '[naam]';
  const fullAddress = appState.BRP?.content?.adres
    ? getFullAddress(
        appState.BRP.content?.adres,
        INCLUDE_WOONPLAATS,
        INCLUDE_LAND,
        SEPARATOR
      )
    : '[adres]';

  let mailTo = undefined; // TODO: Pass organisation or email from the backend
  if (
    vergunning.caseType === 'Ligplaatsvergunning woonboot' ||
    vergunning.caseType === 'Ligplaatsvergunning bedrijfsvaartuig'
  ) {
    mailTo = 'vth@amsterdam.nl';
  }
  return (
    <>
      <Datalist
        rows={[
          {
            label,
            content: (
              <>
                {isLoading && (
                  <LoadingContent barConfig={[['300px', '30px', '20px']]} />
                )}
                {!isLoading && !isError && !documents.length && (
                  <Paragraph>Geen document beschikbaar.</Paragraph>
                )}
                {isError && !isLoading && (
                  <Paragraph>Documenten ophalen is mislukt.</Paragraph>
                )}
                {!isLoading && !!documents.length && (
                  <DocumentListV2 documents={documents} columns={['', '']} />
                )}
              </>
            ),
          },
        ]}
      />
      {featureToggle.documentOpvragenMail && !!mailTo && (
        <Paragraph>
          <strong>Ziet u niet het juiste document?</strong> Stuur een mail naar:{' '}
          <Link
            href={`mailto:${mailTo}?subject=${getMailSubject(vergunning)}&body=${getMailBody(vergunning, fullName, fullAddress)}`}
            rel="noreferrer"
          >
            {mailTo}
          </Link>{' '}
          om uw document op te vragen.
        </Paragraph>
      )}
    </>
  );
}
