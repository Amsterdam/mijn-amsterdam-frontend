import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';

export default () => {
  return (
    <PageContentMain>
      <PageContentMainHeading variant="medium">Helaas</PageContentMainHeading>
      <PageContentMainBody>
        <p>De pagina waar u naar op zoek was bestaat niet (meer).</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
