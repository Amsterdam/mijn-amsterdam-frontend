import { Link, Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import { THEMA_DETAIL_TITLE_DEFAULT } from './toeristischeVerhuur-thema-config';
import styles from './ToeristischeVerhuurDetail.module.scss';
import { useToeristischeVerhuurThemaData } from './useToeristischeVerhuur.hook';
import { ToeristischeVerhuurVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import { getFullAddress, getFullName } from '../../../universal/helpers/brp';
import { Datalist, Row, RowSet } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { AddressDisplayAndModal } from '../../components/LocationModal/LocationModal';
import { PageContentCell } from '../../components/Page/Page';
import { useAppStateGetter } from '../../hooks/useAppState';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { useVergunningDocumentList } from '../Vergunningen/detail-page-content/useVergunningDocumentsList.hook';

function getMailBody(
  vergunning: ToeristischeVerhuurVergunning,
  fullName: string,
  fullAddress: string
) {
  return `Geachte heer/mevrouw,%0D%0A%0D%0AHierbij verzoek ik u om het [document type] document van de vergunning met zaaknummer ${vergunning.identifier} op te sturen.%0D%0A%0D%0AMet vriendelijke groet,%0D%0A%0D%0A${fullName}%0D%0A%0D%0A${fullAddress}`;
}

function getMailSubject(vergunning: ToeristischeVerhuurVergunning) {
  return `${vergunning.identifier} - Document opvragen`;
}

function BnBDocumentInfo({
  vergunning,
}: {
  vergunning: ToeristischeVerhuurVergunning;
}) {
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
  return (
    <Paragraph>
      <strong>Ziet u niet het juiste document?</strong> Stuur een mail naar:{' '}
      <Link
        href={`mailto:bedandbreakfast@amsterdam.nl?subject=${getMailSubject(vergunning)}&body=${getMailBody(vergunning, fullName, fullAddress)}`}
        rel="noreferrer"
      >
        bedandbreakfast@amsterdam.nl
      </Link>{' '}
      om uw document op te vragen.
    </Paragraph>
  );
}

type DetailPageContentProps = {
  vergunning: ToeristischeVerhuurVergunning;
};

function DetailPageContent({ vergunning }: DetailPageContentProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Gemeentelijk zaaknummer',
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
      isVisible: vergunning.decision === 'Verleend',
    },
    {
      label: 'Adres',
      content: (
        <>
          <AddressDisplayAndModal address={vergunning.location ?? ''} />
        </>
      ),
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
              variant="inline"
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

export function ToeristischeVerhuurDetailPagina() {
  const { vergunningen, isError, isLoading, routes } =
    useToeristischeVerhuurThemaData();
  const { id } = useParams<{ id: string }>();
  const vergunning = vergunningen.find((v) => v.id === id);
  const isBnBVergunning = vergunning?.title === 'Vergunning bed & breakfast';
  const fetchDocumentsUrl = isBnBVergunning
    ? undefined
    : vergunning?.fetchDocumentsUrl;

  let vergunningDocuments = useVergunningDocumentList(fetchDocumentsUrl);

  if (isBnBVergunning) {
    vergunningDocuments = vergunning.documents;
  }

  return (
    <ThemaDetailPagina<ToeristischeVerhuurVergunning>
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
                        <DocumentListV2
                          documents={vergunningDocuments}
                          columns={['', '']}
                          className="ams-mb--sm"
                        />
                        {vergunning.title === 'Vergunning bed & breakfast' && (
                          <BnBDocumentInfo vergunning={vergunning} />
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
      backLink={routes.themaPage}
    />
  );
}
