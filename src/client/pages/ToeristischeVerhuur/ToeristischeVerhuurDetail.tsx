import { useEffect } from 'react';

import { Grid, Link, Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import styles from './ToeristischeVerhuurDetail.module.scss';
import { useToeristischeVerhuurThemaData } from './useToeristischeVerhuur.hook';
import { ToeristischeVerhuurVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-types';
import { isLoading } from '../../../universal/helpers/api';
import { GenericDocument } from '../../../universal/types';
import { LoadingContent } from '../../components';
import { Datalist, Row, RowSet } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { LocationModal } from '../../components/LocationModal/LocationModal';
import { BagThemas } from '../../config/thema';
import { useAppStateBagApi } from '../../hooks/useAppState';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

function DocumentInfo() {
  return (
    <Paragraph>
      Ziet u niet het juiste document? Stuur een mail naar:{' '}
      <Link href="mailto:bedandbreakfast@amsterdam.nl" rel="noreferrer">
        bedandbreakfast@amsterdam.nl
      </Link>{' '}
      om uw document in te kunnen zien.
    </Paragraph>
  );
}

interface VerhuurDocumentListProps {
  vergunning: ToeristischeVerhuurVergunning;
}

function VerhuurDocumentList({ vergunning }: VerhuurDocumentListProps) {
  const [documentsResponseData, fetch, isApiDataCached] = useAppStateBagApi<
    GenericDocument[]
  >({
    bagThema: BagThemas.TOERISTISCHE_VERHUUR,
    key: vergunning.id,
  });

  const isApiLoading = isLoading(documentsResponseData);
  const hasResult = !!vergunning.result;
  const hasDocuments = !!documentsResponseData.content?.length;
  const hasDocumentsFetch = !!vergunning.fetchDocumentsUrl;
  const hasBesluit = documentsResponseData.content?.some((document) =>
    document.title.includes('Besluit')
  );

  useEffect(() => {
    if (vergunning.fetchDocumentsUrl && !isApiDataCached) {
      fetch({ url: vergunning.fetchDocumentsUrl });
    }
  }, [vergunning.fetchDocumentsUrl, isApiDataCached]);

  if (hasDocumentsFetch && isApiLoading) {
    return <LoadingContent />;
  }

  return (
    <>
      <DocumentListV2
        documents={documentsResponseData.content ?? []}
        columns={['', '']}
        className="ams-mb--sm"
      />
      {!hasDocumentsFetch ||
        (!isApiLoading && !hasDocuments) ||
        (!hasBesluit && hasResult && <DocumentInfo />)}
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
          <span className={styles.Address}>{vergunning.adres}</span>
          <LocationModal location={vergunning.adres} />
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
