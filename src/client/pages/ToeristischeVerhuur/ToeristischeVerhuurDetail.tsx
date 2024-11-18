import { Grid, Link, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';

import styles from './ToeristischeVerhuurDetail.module.scss';
import { useToeristischeVerhuurThemaData } from './useToeristischeVerhuur.hook';
import { ToeristischeVerhuurVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-types';
import { getFullAddress, getFullName } from '../../../universal/helpers/brp';
import { Datalist, Row, RowSet } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { LocationModal } from '../../components/LocationModal/LocationModal';
import { useAppStateGetter } from '../../hooks/useAppState';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

function getMailBody(
  vergunning: ToeristischeVerhuurVergunning,
  fullName: string,
  fullAddress: string
) {
  return `Geachte heer/mevrouw,%0D%0A%0D%0AHierbij verzoek ik u om het [document type] document van de vergunning met zaaknummer ${vergunning.zaaknummer} op te sturen.%0D%0A%0D%0AMet vriendelijke groet,%0D%0A%0D%0A${fullName}%0D%0A%0D%0A${fullAddress}`;
}

function getMailSubject(vergunning: ToeristischeVerhuurVergunning) {
  return `${vergunning.zaaknummer} - Document opvragen`;
}

function DocumentInfo({
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

interface VerhuurDocumentListProps {
  vergunning: ToeristischeVerhuurVergunning;
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
  vergunning: ToeristischeVerhuurVergunning;
};

function DetailPageContent({ vergunning }: DetailPageContentProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Gemeentelijk zaaknummer',
      content: vergunning.zaaknummer,
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
      isVisible: vergunning.result === 'Verleend',
    },
    {
      label: 'Adres',
      content: (
        <>
          <span className={classNames(styles.Address, 'ams-mb--xs')}>
            {vergunning.adres}
          </span>
          <LocationModal address={vergunning.adres} />
        </>
      ),
    },
    {
      label: 'Resultaat',
      content: vergunning.result,
      isVisible: !!vergunning.result,
    },
  ];

  const isVakantieVerhuur = vergunning.title === 'Vergunning vakantieverhuur';

  return (
    <>
      {isVakantieVerhuur && (
        <Grid.Cell span="all">
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
        </Grid.Cell>
      )}
      {!!rows.length && (
        <Grid.Cell span="all">
          <Datalist rows={rows} />
        </Grid.Cell>
      )}

      <Grid.Cell span={8}>
        <Datalist
          rows={[
            {
              label: 'Document',
              content: <VerhuurDocumentList vergunning={vergunning} />,
            },
          ]}
        />
      </Grid.Cell>
    </>
  );
}

export function ToeristischeVerhuurDetail() {
  const { vergunningen, isError, isLoading, title, routes } =
    useToeristischeVerhuurThemaData();
  const { id } = useParams<{ id: string }>();
  const vergunning = vergunningen?.find((item) => item.id === id) ?? null;

  return (
    <ThemaDetailPagina<ToeristischeVerhuurVergunning>
      title={vergunning?.title ?? 'Vergunning toeristische verhuur'}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={
        vergunning && <DetailPageContent vergunning={vergunning} />
      }
      backLink={{
        title: title,
        to: routes.themaPage,
      }}
      documentPathForTracking={(document) =>
        `/downloads/toeristische-verhuur/vergunning/${vergunning?.title}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
