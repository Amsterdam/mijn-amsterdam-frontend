import { useMemo } from 'react';

import { Link, Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import { THEMA_DETAIL_TITLE_DEFAULT } from './toeristischeVerhuur-thema-config';
import styles from './ToeristischeVerhuurDetail.module.scss';
import {
  BBVergunningFrontend,
  ToeristischeVerhuurVergunningFrontend,
  useToeristischeVerhuurThemaData,
  VakantieverhuurVergunningFrontend,
} from './useToeristischeVerhuur.hook';
import { VakantieverhuurVergunningaanvraagIF } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { getFullAddress, getFullName } from '../../../universal/helpers/brp';
import { Datalist, Row, RowSet } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { AddressDisplayAndModal } from '../../components/LocationModal/LocationModal';
import { PageContentCell } from '../../components/Page/Page';
import { useAppStateGetter } from '../../hooks/useAppState';
import NotFound from '../NotFound/NotFound';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { useVergunningDetailData } from '../Vergunningen/detail-page-content/useVergunningDetailData.hook';

function getMailBody(
  vergunning: ToeristischeVerhuurVergunningFrontend,
  fullName: string,
  fullAddress: string
) {
  return `Geachte heer/mevrouw,%0D%0A%0D%0AHierbij verzoek ik u om het [document type] document van de vergunning met zaaknummer ${vergunning.identifier} op te sturen.%0D%0A%0D%0AMet vriendelijke groet,%0D%0A%0D%0A${fullName}%0D%0A%0D%0A${fullAddress}`;
}

function getMailSubject(vergunning: ToeristischeVerhuurVergunningFrontend) {
  return `${vergunning.identifier} - Document opvragen`;
}

function DocumentInfo({
  vergunning,
}: {
  vergunning: ToeristischeVerhuurVergunningFrontend;
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

interface VerhuurDocumentListProps {
  vergunning: ToeristischeVerhuurVergunningFrontend;
}

function VerhuurDocumentList({ vergunning }: VerhuurDocumentListProps) {
  return (
    <>
      <DocumentListV2
        documents={vergunning.documents}
        columns={['', '']}
        className="ams-mb--sm"
      />
      {vergunning.title === 'Vergunning bed & breakfast' && (
        <DocumentInfo vergunning={vergunning} />
      )}
    </>
  );
}

type DetailPageContentProps = {
  vergunning: ToeristischeVerhuurVergunningFrontend;
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

      <PageContentCell spanWide={8}>
        <Datalist
          rows={[
            {
              label: 'Document',
              content: <VerhuurDocumentList vergunning={vergunning} />,
            },
          ]}
        />
      </PageContentCell>
    </>
  );
}

function ToeristischeVerhuurDetail<
  V extends ToeristischeVerhuurVergunningFrontend,
>({
  vergunning,
  backLink,
  isError,
  isLoading,
}: {
  vergunning: V | null;
  backLink: string;
  isError: boolean;
  isLoading: boolean;
}) {
  return (
    <ThemaDetailPagina<V>
      title={vergunning?.title ?? THEMA_DETAIL_TITLE_DEFAULT}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={
        vergunning && <DetailPageContent vergunning={vergunning} />
      }
      backLink={backLink}
      documentPathForTracking={(document) =>
        `/downloads/toeristische-verhuur/vergunning/${vergunning?.title}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}

function VakantieVerhuurVergunningDetail() {
  const {
    vergunningDetail,
    isError,
    isLoading,
    isLoadingThemaData,
    vergunningDocuments,
  } = useVergunningDetailData<VakantieverhuurVergunningaanvraagIF>();

  const vergunning: VakantieverhuurVergunningFrontend | null = useMemo(() => {
    if (vergunningDetail !== null) {
      return {
        ...vergunningDetail,
        documents: vergunningDocuments,
      };
    }
    return null;
  }, [vergunningDetail, vergunningDocuments]);

  return (
    <ToeristischeVerhuurDetail<VakantieverhuurVergunningFrontend>
      vergunning={vergunning}
      backLink={AppRoutes.TOERISTISCHE_VERHUUR}
      isLoading={isLoading || isLoadingThemaData}
      isError={isError}
    />
  );
}

function BedAndBreakfastVergunningDetail() {
  const { vergunningen, isError, isLoading, routes } =
    useToeristischeVerhuurThemaData();
  const { id } = useParams<{ id: string }>();

  let vergunning = null;

  for (const v of vergunningen) {
    if (v.title === 'Vergunning bed & breakfast' && id === v.id) {
      vergunning = v;
    }
  }

  return (
    <ToeristischeVerhuurDetail<BBVergunningFrontend>
      vergunning={vergunning}
      backLink={routes.themaPage}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

export function ToeristischeVerhuurDetailPagina() {
  const { caseType } = useParams<{ caseType: string }>();

  if (caseType == 'vakantieverhuur-vergunningsaanvraag') {
    return <VakantieVerhuurVergunningDetail />;
  }
  if (caseType == 'bed-and-breakfast') {
    return <BedAndBreakfastVergunningDetail />;
  }
  return <NotFound />;
}
