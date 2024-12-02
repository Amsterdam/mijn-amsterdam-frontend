import { generatePath } from 'react-router-dom';

import { useBodemDetailData } from './useBodemDetailData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import ThemaIcon from '../../components/ThemaIcon/ThemaIcon';
import { ThemaTitles } from '../../config/thema';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export default function LoodMetingComponent() {
  const { meting, isLoading, isError } = useBodemDetailData();

  const BodemDetailContent = ({ meting }) => {
    // return <DataList rows={[]} />;
    return <>asdfasfsa</>;
  };

  return (
    <>
      {/* <DetailPage>
        <PageHeading
          icon={<ThemaIcon />}
          backLink={{
            to: generatePath(AppRoutes.BODEM),
            title: ThemaTitles.BODEM,
          }}
          isLoading={isLoading(BODEM)}
        >
          Lood in bodem-check
        </PageHeading>

        <PageContent>
          {(isError(BODEM) || noContent) && (
            <ErrorAlert>
              We kunnen op dit moment geen gegevens tonen.
            </ErrorAlert>
          )}
          {isLoading(BODEM) && <LoadingContent />}
          {!!meting && (
            <>
              <InfoDetail
                label="Kenmerk"
                value={meting.aanvraagNummer || '-'}
              />
              <Location location={meting.adres} />

              {!!meting.document && (
                <InfoDetail
                  valueWrapperElement="div"
                  label="Document"
                  value={
                    <DocumentLink
                      document={meting.document}
                      label={meting.document.title}
                      trackPath={() =>
                        `loodmeting/document/${meting.document?.title}`
                      }
                    ></DocumentLink>
                  }
                />
              )}

              {meting.redenAfwijzing && (
                <InfoDetail
                  label="Reden afwijzing"
                  value={meting.redenAfwijzing}
                />
              )}
            </>
          )}
        </PageContent>
        {meting && <LoodStatusLines request={meting} />}
      </DetailPage> */}

      <ThemaDetailPagina
        title={'Lood in bodem-check'}
        icon={<ThemaIcon />}
        zaak={meting}
        backLink={{
          to: generatePath(AppRoutes.BODEM),
          title: ThemaTitles.BODEM,
        }}
        isError={isError}
        isLoading={isLoading}
        pageContentTop={'sdf'}
      />
    </>
  );
}
