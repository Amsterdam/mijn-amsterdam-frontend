import React from 'react';

import styles from './BezwarenDetail.module.scss';
import { useBezwarenDetailData } from './useBezwarenDetailData.hook';
import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import { entries } from '../../../../universal/helpers/utils';
import { Datalist, Row, RowSet } from '../../../components/Datalist/Datalist';
import DocumentListV2 from '../../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../../components/Page/Page';
import { Steps } from '../../../components/StatusSteps/StatusSteps';
import { TextClamp } from '../../../components/TextClamp/TextClamp';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';

type BezwaarDetailContentProps = {
  bezwaar: BezwaarFrontend;
  documentCategories: string[];
  documents: BezwaarFrontend['documenten'];
};

function BezwaarDetailContent({
  bezwaar,
  documentCategories,
  documents,
}: BezwaarDetailContentProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Onderwerp',
      content: bezwaar.omschrijving,
      isVisible: !!bezwaar.omschrijving,
    },
    {
      isVisible: !!bezwaar.toelichting,
      label: 'Reden bezwaar',
      content: (
        <TextClamp tagName="span" minHeight="100px" maxHeight="200px">
          {bezwaar.toelichting}
        </TextClamp>
      ),
    },
    {
      isVisible: !!(bezwaar.primairbesluit && bezwaar.primairbesluitdatum),
      rows: [
        {
          label: 'Besluit waartegen u bezwaar maakt',
          content: bezwaar.primairbesluit,
        },
        {
          label: 'Datum',
          content: bezwaar.primairbesluitdatumFormatted,
        },
      ],
    },
    {
      isVisible: !!(bezwaar.resultaat && bezwaar.einddatum),
      rows: [
        {
          label: 'Resultaat bezwaar',
          content: bezwaar.resultaat,
        },
        {
          label: 'Datum',
          content: bezwaar.datumResultaatFormatted,
          isVisible: !!bezwaar.datumResultaatFormatted,
        },
      ],
    },
  ];

  return (
    <>
      <PageContentCell>
        <Datalist rows={rows} />
      </PageContentCell>
      <PageContentCell>
        {documentCategories.map((category) => {
          const docs = documents.filter((d) => d.dossiertype === category);
          const rows: Row[] = [
            {
              classNameLabel: styles.DocumentsListLabel,
              label: (
                <>
                  Document{documents.length > 1 ? 'en' : ''}{' '}
                  {category.toLowerCase()}
                </>
              ),
              content: (
                <DocumentListV2
                  className={styles.DocumentList}
                  documents={docs}
                />
              ),
            },
          ];
          return <Datalist key={category} rows={rows} />;
        })}
      </PageContentCell>
    </>
  );
}

export function BezwarenDetail() {
  const {
    bezwaar,
    dependencyErrors,
    documentCategories,
    documents,
    isError,
    isErrorThemaData,
    isLoading,
    isLoadingThemaData,
    breadcrumbs,
    statussen,
    title,
  } = useBezwarenDetailData();

  const pageContentErrorAlert = (
    <>
      We kunnen niet alle gegevens tonen.{' '}
      {dependencyErrors &&
        entries(dependencyErrors)
          .filter(([, hasError]) => hasError)
          .map(([dependency]) => {
            return (
              <React.Fragment key={dependency}>
                <br />- {dependency} kunnen nu niet getoond worden.
              </React.Fragment>
            );
          })}
    </>
  );

  return (
    <ThemaDetailPagina
      title={title}
      zaak={bezwaar}
      isError={isError || isErrorThemaData}
      isLoading={isLoading || isLoadingThemaData}
      errorAlertContent={pageContentErrorAlert}
      pageContentMain={
        <>
          {bezwaar && (
            <BezwaarDetailContent
              bezwaar={bezwaar}
              documentCategories={documentCategories}
              documents={documents}
            />
          )}
          {!!statussen?.length && (
            <PageContentCell>
              <Steps steps={statussen} />
            </PageContentCell>
          )}
        </>
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
