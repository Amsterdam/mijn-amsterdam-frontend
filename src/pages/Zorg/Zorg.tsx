import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from '../../AppState';

export default () => {
  const {
    WMO: {
      data: { items },
    },
  } = useContext(AppContext);
  return (
    <PageContentMain>
      <PageContentMainHeading>Zorg</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>Zorg body</p>
        <ul>
          {items.map(item => (
            <li>{item.title}</li>
          ))}
        </ul>
      </PageContentMainBody>
    </PageContentMain>
  );
};
