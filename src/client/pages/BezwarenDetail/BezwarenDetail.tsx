import { useParams } from 'react-router-dom';
import { useAppStateGetter, usePhoneScreen } from '../../hooks';
import {
  defaultDateFormat,
  isError,
  isLoading,
  uniqueArray,
} from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  PageContent,
  PageHeading,
} from '../../components';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  InfoDetailGroup,
  InfoDetailHeading,
} from '../../components/InfoDetail/InfoDetail';
import BezwarenStatusLines from './BezwarenStatusLines';
import DocumentList from '../../components/DocumentList/DocumentList';
import styles from './BezwarenDetail.module.scss';
import { TextClamp } from '../../components/InfoDetail/TextClamp';
const docs = [
  {
    id: 'JrdD4ETTgLVRNgaAHcm8viKCtrb3UE-2DHsjdcaklK3kr1ks7IoHIV7XIVMP65mU3MIAsShw0pBwBXgjUqhCsg',
    title: 'Export (13).pdf',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/JrdD4ETTgLVRNgaAHcm8viKCtrb3UE-2DHsjdcaklK3kr1ks7IoHIV7XIVMP65mU3MIAsShw0pBwBXgjUqhCsg/attachments',
    dossiertype: 'Online Correspondentie',
  },
  {
    id: 'gIrxBxsE7o1vZwPDV1ZCfZd4mDQQ32HaUOFHGgTG5gKb7EvCmDvabheziUOjukxAVS0tSVvkAHRiW4hbwPLLUg',
    title: 'testsyacine.xls',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/gIrxBxsE7o1vZwPDV1ZCfZd4mDQQ32HaUOFHGgTG5gKb7EvCmDvabheziUOjukxAVS0tSVvkAHRiW4hbwPLLUg/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: 'wcIH_D7_uSN63Ja29I4pyCcyFEA0Ty3hYmYhGCs_s8U7392eqHqHBP7pZm_0Y3KNED4f63rlCiZ_qGLV-qm14w',
    title: 'HLRADIO.pdf',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/wcIH_D7_uSN63Ja29I4pyCcyFEA0Ty3hYmYhGCs_s8U7392eqHqHBP7pZm_0Y3KNED4f63rlCiZ_qGLV-qm14w/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: 'z0wlHsPiCYPdezsTrW-f5KzEU0nisMxcFSddHANzPwvT8j5PWjkHSOCZKAERK21U3XWcPEr5SgfFu138Fm1h_Q',
    title: '20230502 Doorontwikkeling Mijn Amsterdam 2023 en verder v0.5.docx',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/z0wlHsPiCYPdezsTrW-f5KzEU0nisMxcFSddHANzPwvT8j5PWjkHSOCZKAERK21U3XWcPEr5SgfFu138Fm1h_Q/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: 'lDEgj-kV7ApBCFX0lAVQjWrJCm-E6zzyNPK5ACai7LIDY8DPiW8NZ-zr9YfqhFVhyMcXuoG60UbFwNbbotecsA',
    title: 'Samenvatting cursus Querys maken met SQL - Final_juni_2019.pdf',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/lDEgj-kV7ApBCFX0lAVQjWrJCm-E6zzyNPK5ACai7LIDY8DPiW8NZ-zr9YfqhFVhyMcXuoG60UbFwNbbotecsA/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: 'tpyJUtrM1INcyVP_7Gh1aiPUpvISgL_HfwE7idhgkHu4dtJ4oJrWbVJ6ODuuE_TFJ59RAsUK0DcRlU930G47bw',
    title: 'Status_Andreas.docx',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/tpyJUtrM1INcyVP_7Gh1aiPUpvISgL_HfwE7idhgkHu4dtJ4oJrWbVJ6ODuuE_TFJ59RAsUK0DcRlU930G47bw/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: '51HSsqjGILBiafbSqR_d-94m1NNIVsQ3ddKXrK0xogceDkRRR61d_P61vf-JL1mlOJcGJRJzlcWd1Dm0o0wNIA',
    title: 'Happy flow   Zaak creatie.xlsx',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/51HSsqjGILBiafbSqR_d-94m1NNIVsQ3ddKXrK0xogceDkRRR61d_P61vf-JL1mlOJcGJRJzlcWd1Dm0o0wNIA/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: 'o_162G6M9HamC5q1lC8ZW7AWj-yLtk7shQ2oL7thZRsVXe2J6p4Jsb8rWbAsibcGh5dE5xUoKmqIY_lwKvh2cg',
    title: 'Bezwaar_WP20230046.pdf',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/o_162G6M9HamC5q1lC8ZW7AWj-yLtk7shQ2oL7thZRsVXe2J6p4Jsb8rWbAsibcGh5dE5xUoKmqIY_lwKvh2cg/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: 'i7pyaiwbeLRxXh2PwBly9idD_3PpCaZofk30PqytMRZ1m0smgD4KchDBj0X8bzoUUpnPqs8eG7VQxdrfWaAkuw',
    title: 'Chrystal Reports HL_yacine.doc',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/i7pyaiwbeLRxXh2PwBly9idD_3PpCaZofk30PqytMRZ1m0smgD4KchDBj0X8bzoUUpnPqs8eG7VQxdrfWaAkuw/attachments',
    dossiertype: 'Online Aangeleverd',
  },
  {
    id: 'KOnzWTA31mTDa8fkO3vfq7hy_JfVJotwqN4vlTDakt_doXEr-hyD_tgzLKDzqh0yp0ay4GeBYT-wKKIptJL4iQ',
    title: 'tekening 1 - kopie (2).pdf',
    datePublished: '14 februari 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/KOnzWTA31mTDa8fkO3vfq7hy_JfVJotwqN4vlTDakt_doXEr-hyD_tgzLKDzqh0yp0ay4GeBYT-wKKIptJL4iQ/attachments',
    dossiertype: 'Online Besluitvorming',
  },
  {
    id: 'AMIdrB_nPXo9KSwseJ02KPncukTtJhsVHQHYglvwqBms2dpTVvFaWE0nBuzDEyZcrAHV5HipYEBK1nLbj9qAog',
    title: 'Bezwaar_DJ20230016 210923 1547.pdf',
    datePublished: '21 september 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/AMIdrB_nPXo9KSwseJ02KPncukTtJhsVHQHYglvwqBms2dpTVvFaWE0nBuzDEyZcrAHV5HipYEBK1nLbj9qAog/attachments',
    dossiertype: 'Online Procesdossier',
  },
  {
    id: 'VcozQBzW55Cd-FlIKZQPJolUSnjRfl5d55hn_kSMUgWkHNaaswKZy4eWMlHzVf2X2B9yv3ZgZeaCi3kiEuFILw',
    title: 'BZ360001.pdf',
    datePublished: '05 december 2023',
    url: 'https://test.mijn.amsterdam.nl/api/v1/services/bezwaren/VcozQBzW55Cd-FlIKZQPJolUSnjRfl5d55hn_kSMUgWkHNaaswKZy4eWMlHzVf2X2B9yv3ZgZeaCi3kiEuFILw/attachments',
    dossiertype: 'Online Besluitvorming',
  },
];
const BezwarenDetail = () => {
  const { BEZWAREN } = useAppStateGetter();
  const { uuid } = useParams<{ uuid: string }>();

  const bezwaar = {
    ...(BEZWAREN.content?.find((b) => b.uuid === uuid) ?? null),
    documenten: docs,
  };

  const noContent = !isLoading(BEZWAREN) && !bezwaar;

  const documentCategories = uniqueArray(
    !bezwaar ? [] : bezwaar.documenten.map((d) => d.dossiertype).filter(Boolean)
  ).sort();

  const isSmallScreen = usePhoneScreen();

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.BEZWAREN,
          title: ChapterTitles.BEZWAREN,
        }}
        isLoading={isLoading(BEZWAREN)}
      >
        {bezwaar?.identificatie ?? 'Bezwaar'}
      </PageHeading>

      <PageContent>
        {(isError(BEZWAREN) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {!!bezwaar && (
          <>
            {bezwaar.omschrijving && (
              <InfoDetail label="Onderwerp" value={bezwaar.omschrijving} />
            )}
            {bezwaar.toelichting && (
              <InfoDetail
                label="Reden bezwaar"
                value={
                  <TextClamp tagName="span" minHeight="100px" maxHeight="200px">
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
              <InfoDetail label="Resultaat bezwaar" value={bezwaar.resultaat} />
            )}
            {documentCategories.length > 0 && (
              <>
                {documentCategories.map((category) => {
                  const docs = bezwaar.documenten.filter(
                    (d) => d.dossiertype === category
                  );
                  return (
                    <InfoDetailGroup
                      label={
                        <div className={styles.DocumentListHeader}>
                          <InfoDetailHeading
                            label={`Document${
                              bezwaar.documenten.length > 1 ? 'en' : ''
                            } ${category.toLowerCase()}`}
                          />
                          {!isSmallScreen && (
                            <span className={styles.DocumentListHeader_Date}>
                              Datum
                            </span>
                          )}
                        </div>
                      }
                    >
                      <DocumentList documents={docs} showDatePublished />
                    </InfoDetailGroup>
                  );

                  // return (
                  //   <InfoDetailGroup key={category}>
                  //     <InfoDetail
                  //       valueWrapperElement="div"
                  //       label={`Document${
                  //         bezwaar.documenten.length > 1 ? 'en' : ''
                  //       } ${category.toLowerCase()}`}
                  //       value={
                  //         <ul className={styles.documentlist}>
                  //           {docs.map((document) => (
                  //             <li key={`document-link-${document.id}`}>
                  //               <DocumentLink
                  //                 document={document}
                  //                 trackPath={() =>
                  //                   `bezwaar/document/${document.title}`
                  //                 }
                  //               ></DocumentLink>
                  //             </li>
                  //           ))}
                  //         </ul>
                  //       }
                  //     />
                  //     <InfoDetail
                  //       valueWrapperElement="div"
                  //       label="Datum"
                  //       value={
                  //         <ul className={styles.documentlist}>
                  //           {docs.map((document) => (
                  //             <li key={`document-date-${document.id}`}>
                  //               {document.datePublished}
                  //             </li>
                  //           ))}
                  //         </ul>
                  //       }
                  //     />
                  //   </InfoDetailGroup>
                  // );
                })}
              </>
            )}
          </>
        )}
      </PageContent>
      {!!bezwaar?.statussen && !!bezwaar?.uuid && (
        <BezwarenStatusLines id={bezwaar.uuid} statussen={bezwaar.statussen} />
      )}
    </DetailPage>
  );
};

export default BezwarenDetail;
