import React from 'react';

import styles from './BezwarenDetail.module.scss';
import { BezwarenStatusLines } from './BezwarenStatusLines';
import { useBezwarenDetailData } from './useBezwarenDetailData.hook';
import { Bezwaar } from '../../../server/services/bezwaren/types';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { entries } from '../../../universal/helpers/utils';
import { InfoDetail } from '../../components';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import {
  InfoDetailGroup,
  InfoDetailHeading,
} from '../../components/InfoDetail/InfoDetail';
import { TextClamp } from '../../components/InfoDetail/TextClamp';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

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
      pageContentTop={
        <>
          <PageContentCell>
            {!!bezwaar && (
              <>
                {bezwaar.omschrijving && (
                  <InfoDetail label="Onderwerp" value={bezwaar.omschrijving} />
                )}
                {bezwaar.toelichting && (
                  <InfoDetail
                    label="Reden bezwaar"
                    value={
                      <TextClamp
                        tagName="span"
                        minHeight="100px"
                        maxHeight="200px"
                      >
                        {bezwaar.toelichting}
                      </TextClamp>
                    }
                  />
                )}
                {bezwaar.primairbesluit && bezwaar.primairbesluitdatum && (
                  <InfoDetailGroup>
                    <InfoDetail
                      label="Besluit waartegen u bezwaar maakt"
                      value={bezwaar.primairbesluit}
                    />
                    <InfoDetail
                      label="Datum"
                      value={defaultDateFormat(bezwaar.primairbesluitdatum)}
                    />
                  </InfoDetailGroup>
                )}
                {bezwaar.einddatum && bezwaar.resultaat && (
                  <InfoDetailGroup>
                    <InfoDetail
                      label="Resultaat bezwaar"
                      value={bezwaar.resultaat}
                    />
                    {!!bezwaar.datumResultaat && (
                      <InfoDetail
                        label="Datum"
                        value={defaultDateFormat(bezwaar.datumResultaat)}
                      />
                    )}
                  </InfoDetailGroup>
                )}
              </>
            )}

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
