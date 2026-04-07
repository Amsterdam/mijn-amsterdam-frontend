import { Paragraph } from '@amsterdam/design-system-react';

import type { GenericDocument } from '../../../../../universal/types/App.types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import { DocumentListV2 } from '../../../../components/DocumentList/DocumentListV2.tsx';
import {
  MissingDocumentMailto,
  type MissingDocumentMailtoConfig,
} from '../../../../components/DocumentList/MissingDocumentMailto/MissingDocumentMailto.tsx';
import LoadingContent from '../../../../components/LoadingContent/LoadingContent.tsx';

type GenericVergunning = { identifier: string };

function getMailBody(vergunning: GenericVergunning) {
  return `\
Geachte heer/mevrouw,

Hierbij verzoek ik u om het [document type] document van de vergunning met zaaknummer ${vergunning.identifier} op te sturen.`;
}

function getMailSubject(vergunning: GenericVergunning) {
  return `${vergunning.identifier} - Document opvragen`;
}

function defaultMissingDocumentMailto(
  config: MissingDocumentMailtoConfigParam,
  vergunning: GenericVergunning
): MissingDocumentMailtoConfig {
  return {
    subject: getMailSubject(vergunning),
    body: getMailBody(vergunning),
    includeUserSignature: true,
    ...config,
  };
}

type MissingDocumentMailtoConfigParam = Partial<MissingDocumentMailtoConfig> &
  Pick<MissingDocumentMailtoConfig, 'to'>;

type VergunningDetailDocumentsListProps = {
  vergunning: GenericVergunning;
  documents: GenericDocument[];
  isLoading: boolean;
  isError: boolean;
  label?: string;
  missingDocumentMailtoConfig?: MissingDocumentMailtoConfigParam;
};

export function VergunningDetailDocumentsList({
  vergunning,
  documents,
  label = 'Documenten',
  missingDocumentMailtoConfig,
  isLoading,
  isError,
}: VergunningDetailDocumentsListProps) {
  const missingDocumentMailto = missingDocumentMailtoConfig?.to
    ? defaultMissingDocumentMailto(missingDocumentMailtoConfig, vergunning)
    : null;
  return (
    <Datalist
      rows={[
        {
          label,
          content: (
            <>
              {isLoading && (
                <LoadingContent barConfig={[['300px', '30px', '20px']]} />
              )}
              {!isLoading && isError && (
                <Paragraph>Documenten ophalen is mislukt.</Paragraph>
              )}
              {!isLoading && !isError && (
                <>
                  {!documents.length && (
                    <Paragraph
                      className={missingDocumentMailto ? 'ams-mb-m' : ''}
                    >
                      Geen document beschikbaar.
                    </Paragraph>
                  )}
                  {!!documents.length && (
                    <DocumentListV2
                      documents={documents}
                      columns={['', '']}
                      className={missingDocumentMailto ? 'ams-mb-m' : ''}
                    />
                  )}
                </>
              )}
              {!isLoading && !isError && missingDocumentMailto && (
                <MissingDocumentMailto config={missingDocumentMailto} />
              )}
            </>
          ),
        },
      ]}
    />
  );
}
