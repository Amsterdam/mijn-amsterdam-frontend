import React from 'react';

import styles from './BezwarenDetail.module.scss';
import { BezwarenStatusLines } from './BezwarenStatusLines';
import { useBezwarenDetailData } from './useBezwarenDetailData.hook';
import { Bezwaar } from '../../../server/services/bezwaren/types';
import { entries } from '../../../universal/helpers/utils';
import { Datalist, Row, RowSet } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import {
  InfoDetailGroup,
  InfoDetailHeading,
} from '../../components/InfoDetail/InfoDetail';
import { TextClamp } from '../../components/InfoDetail/TextClamp';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

type BezwaarDetailContentProps = {
  bezwaar: Bezwaar;
  documentCategories: string[];
  documents: Bezwaar['documenten'];
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
    <PageContentCell>
      <Datalist rows={rows} />

      {documentCategories.map((category) => {
        const docs = documents.filter((d) => d.dossiertype === category);
        return (
          <InfoDetailGroup
            key={category}
            label={
              <div className={styles.DocumentListHeader}>
                <InfoDetailHeading
                  label={`Document${
                    documents.length > 1 ? 'en' : ''
                  } ${category.toLowerCase()}`}
                />
              </div>
            }
          >
            <DocumentListV2 documents={docs} />
          </InfoDetailGroup>
        );
      })}
    </PageContentCell>
  );
}

export function BezwarenDetailPagina() {
  const {
    bezwaar,
    isError,
    isErrorThemaData,
    isLoading,
    isLoadingThemaData,
    routes,
    documentCategories,
    documents,
    statussen,
    dependencyErrors,
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
    <ThemaDetailPagina<Bezwaar>
      title={bezwaar?.identificatie ?? 'Bezwaar'}
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
              <BezwarenStatusLines statussen={statussen} />
            </PageContentCell>
          )}
        </>
      }
      backLink={routes.themaPage}
    />
  );
}
