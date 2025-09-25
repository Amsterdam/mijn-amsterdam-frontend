import { Paragraph } from '@amsterdam/design-system-react';

import { themaConfig } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';
import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function BodemThema() {
  const {
    items,
    tableConfig,
    isLoading,
    isError,
    linkListItems,
    themaId: id,
    title,
  } = useBodemData();
  useHTMLDocumentTitle(themaConfig.route);

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<LoodMetingFrontend>
          key={kind}
          title={title}
          zaken={items.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      id={id}
      title={title}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={
        <PageContentCell spanWide={8}>
          {themaConfig.uitlegPageSections.map((section, i) => (
            <div key={i}>
              {section.title && <h2>{section.title}</h2>}
              {section.listItems.map((item, j) => (
                <Paragraph key={j}>{item}</Paragraph>
              ))}
            </div>
          ))}
        </PageContentCell>
      }
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}
