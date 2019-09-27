import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import pageContentStyles from 'components/PageContentMain/PageContentMain.module.scss';

export default () => {
  return (
    <PageContentMain className={pageContentStyles.TextPage}>
      <PageContentMainHeading>Helaas</PageContentMainHeading>
      <p className={pageContentStyles.PageContent}>
        De pagina waar u naar op zoek was bestaat niet (meer).
      </p>
    </PageContentMain>
  );
};
