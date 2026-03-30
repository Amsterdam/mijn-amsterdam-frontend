import { Link, Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import { THEMA_DETAIL_TITLE_DEFAULT } from './ToeristischeVerhuur-thema-config.ts';
import styles from './ToeristischeVerhuurDetail.module.scss';
import { useToeristischeVerhuurThemaData } from './useToeristischeVerhuur.hook.ts';
import type { ToeristischeVerhuurVergunning } from '../../../../server/services/toeristische-verhuur/toeristische-verhuur.types.ts';
import { type VakantieverhuurVergunningFrontend } from '../../../../server/services/toeristische-verhuur/toeristische-verhuur.types.ts';
import type { Row, RowSet } from '../../../components/Datalist/Datalist.tsx';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { DocumentListV2 } from '../../../components/DocumentList/DocumentListV2.tsx';
import { MissingDocumentMailto } from '../../../components/DocumentList/MissingDocumentMailto/MissingDocumentMailto.tsx';
import LoadingContent from '../../../components/LoadingContent/LoadingContent.tsx';
import { AddressDisplayAndModal } from '../../../components/LocationModal/LocationModal.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { useVergunningDocumentList } from '../Vergunningen/detail-page-content/useVergunningDocumentsList.hook.ts';

function getMailBody(vergunning: ToeristischeVerhuurVergunning) {
  return `\
Geachte heer/mevrouw,

Hierbij verzoek ik u om het [document type] document van de vergunning met zaaknummer ${vergunning.identifier} op te sturen.`;
}

function getMailSubject(vergunning: ToeristischeVerhuurVergunning) {
  return `${vergunning.identifier} - Document opvragen`;
}

type DetailPageContentProps = {
  vergunning: ToeristischeVerhuurVergunning;
};

function DetailPageContent({ vergunning }: DetailPageContentProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Zaaknummer',
      content: vergunning.identifier,
    },
    {
      rows: [
        {
          label: 'Vanaf',
          content: vergunning.dateStartFormatted,
          className: styles.VanTot_Col1,
        },
        {
          label: 'Tot',
          content: vergunning.dateEndFormatted,
          className: styles.VanTot_Col2,
        },
      ],
      isVisible: vergunning.isVerleend,
    },
    {
      label: 'Adres',
      content: <AddressDisplayAndModal address={vergunning.location ?? ''} />,
      isVisible: !!vergunning.location,
    },
    {
      label: 'Resultaat',
      content: vergunning.decision,
      isVisible: !!(vergunning.decision && vergunning.dateDecision),
    },
  ];

  const isVakantieVerhuur = vergunning.title === 'Vergunning vakantieverhuur';

  return (
    <>
      {isVakantieVerhuur && (
        <PageContentCell>
          <Paragraph>
            Vakantieverhuur kunt u melden en annuleren via{' '}
            <Link
              rel="noreferrer"
              href="https://www.toeristischeverhuur.nl/portaal/login"
            >
              toeristischeverhuur.nl
            </Link>
            .
          </Paragraph>
        </PageContentCell>
      )}
      {!!rows.length && (
        <PageContentCell>
          <Datalist rows={rows} />
        </PageContentCell>
      )}
    </>
  );
}

export function ToeristischeVerhuurDetail() {
  const {
    vergunningen,
    themaId,
    isError,
    isLoading,
    breadcrumbs,
    themaConfig,
  } = useToeristischeVerhuurThemaData();
  useHTMLDocumentTitle(themaConfig.detailPage.route);

  const { id } = useParams<{ id: string }>();
  const vergunning = vergunningen.find((v) => v.id === id);
  const isBnBVergunning = vergunning?.title === 'Vergunning bed & breakfast';
  const fetchDocumentsUrl = isBnBVergunning
    ? undefined
    : (vergunning as VakantieverhuurVergunningFrontend)?.fetchDocumentsUrl;

  const missingDocumentMailto =
    vergunning && isBnBVergunning
      ? {
          to: 'bedandbreakfast@amsterdam.nl',
          subject: getMailSubject(vergunning),
          body: getMailBody(vergunning),
          includeUserSignature: true,
        }
      : undefined;

  let vergunningDocuments = isBnBVergunning ? vergunning.documents : [];

  const {
    documents,
    isLoading: isLoadingDocuments,
    isError: isErrorDocuments,
  } = useVergunningDocumentList(fetchDocumentsUrl);

  if (!isBnBVergunning) {
    vergunningDocuments = documents;
  }

  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={vergunning?.title ?? THEMA_DETAIL_TITLE_DEFAULT}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        vergunning && (
          <>
            <DetailPageContent vergunning={vergunning} />
            <PageContentCell spanWide={8}>
              <Datalist
                rows={[
                  {
                    label: 'Document',
                    content: (
                      <>
                        {!isBnBVergunning &&
                          !isLoadingDocuments &&
                          !isErrorDocuments &&
                          !vergunningDocuments.length && (
                            <Paragraph>Geen document beschikbaar.</Paragraph>
                          )}
                        {isErrorDocuments && (
                          <Paragraph>Documenten ophalen is mislukt.</Paragraph>
                        )}
                        {isLoadingDocuments && <LoadingContent />}
                        {!isLoadingDocuments && !isLoading && (
                          <>
                            <DocumentListV2
                              documents={vergunningDocuments}
                              columns={['', '']}
                              className={
                                vergunning.title ===
                                'Vergunning bed & breakfast'
                                  ? 'ams-mb-m'
                                  : ''
                              }
                            />
                            {vergunning.title ===
                              'Vergunning bed & breakfast' &&
                              missingDocumentMailto && (
                                <MissingDocumentMailto
                                  config={missingDocumentMailto}
                                />
                              )}
                          </>
                        )}
                      </>
                    ),
                  },
                ]}
              />
            </PageContentCell>
          </>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
