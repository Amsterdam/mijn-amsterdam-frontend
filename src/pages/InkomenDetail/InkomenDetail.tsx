import React, { useContext } from 'react';
import { PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { Chapters, AppRoutes, ChapterTitles } from 'App.constants';
import { AppContext } from 'AppState';
import useRouter from 'use-react-router';
import StatusLine from 'components/StatusLine/StatusLine';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { DetailPage } from 'components/Page/Page';
import { altDocumentContent } from 'data-formatting/focus';

export default () => {
  const {
    FOCUS: {
      data: { items },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const FocusItem = items.find(item => item.id === id);
  const noContent = !isLoading && !FocusItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon chapter={Chapters.INKOMEN} />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {FocusItem && FocusItem.title}
      </PageHeading>
      <PageContent>
        {(isError || noContent) && (
          <Alert type="warning">
            We kunnen op dit moment geen gegevens tonen.
          </Alert>
        )}
        {isLoading && <LoadingContent />}
      </PageContent>
      {!!FocusItem && (
        <StatusLine
          trackCategory={`Werk en inkomen / ${FocusItem.productTitle}`}
          items={FocusItem.process}
          altDocumentContent={altDocumentContent}
        />
      )}
    </DetailPage>
  );
};
