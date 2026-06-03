import type { ReactNode } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';

import { entries } from '../../../universal/helpers/utils.ts';
import type { ZaakAanvraagDetail } from '../../../universal/types/App.types.ts';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { Datalist } from '../Datalist/Datalist.tsx';
import { LinkToListPage } from '../LinkToListPage/LinkToListPage.tsx';
import { PageContentCell } from '../Page/Page.tsx';
import { getDisplayProps, getDisplayPropsColWidths } from '../Table/helpers.ts';
import type { DisplayProps } from '../Table/TableV2.tsx';
import { TableV2 } from '../Table/TableV2.tsx';

const DISPLAY_PROPS_DEFAULT: DisplayProps<{ title: string }> = {
  title: 'Titel',
};
const TEXT_NO_CONTENT_DEFAULT = 'Er zijn (nog) geen zaken gevonden.';

interface ThemaPaginaTableProps<T> {
  className?: string;
  displayProps?: DisplayProps<T>;
  listPageRoute?: string;
  maxItems?: number | -1;
  totalItems?: number;
  textNoContent?: string;
  contentAfterTheTitle?: ReactNode;
  title?: string;
  listPageLinkLabel?: string;
  listPageLinkTitle?: string;
  zaken: T[];
}

export default function ThemaPaginaTable<
  T extends object = ZaakAanvraagDetail,
>({
  title = '',
  contentAfterTheTitle = '',
  zaken,
  className,
  textNoContent,
  displayProps = DISPLAY_PROPS_DEFAULT,
  listPageRoute,
  maxItems = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  totalItems,
  listPageLinkLabel = 'Toon meer',
  listPageLinkTitle,
}: ThemaPaginaTableProps<T>) {
  const textNoContentDefault = title
    ? `U heeft (nog) geen ${title.toLowerCase()}`
    : TEXT_NO_CONTENT_DEFAULT;

  const hasListPage = !!listPageRoute && maxItems !== -1;
  const isSmallScreen = useSmallScreen();
  const colWidths = getDisplayPropsColWidths(displayProps);
  const colWidthsForScreenSize = colWidths?.[isSmallScreen ? 'small' : 'large'];
  let displayPropEntries = entries(getDisplayProps(displayProps));
  // Filter out display properties that are not defined for the current screen size
  displayPropEntries = Array.isArray(colWidthsForScreenSize)
    ? displayPropEntries.filter(
        (_entry, index) => parseInt(colWidthsForScreenSize[index], 10) !== 0
      )
    : displayPropEntries;
  return (
    <PageContentCell>
      {!isSmallScreen ? (
        <TableV2
          showTHead={!!zaken.length}
          caption={title}
          contentAfterTheCaption={contentAfterTheTitle}
          items={hasListPage ? zaken.slice(0, maxItems) : zaken}
          displayProps={displayProps}
          className={className}
        />
      ) : (
        <div>
          {(hasListPage ? zaken.slice(0, maxItems) : zaken).map(
            (zaak, index) => {
              const key = String(
                ('id' in zaak ? zaak.id : `item-${index}`) ?? `article-${index}`
              );
              return (
                <article
                  key={key}
                  className="ams-mb-m"
                  style={{
                    // padding: '10px',
                    // marginBottom: '10px',
                    // boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                >
                  <Datalist
                    rows={displayPropEntries.map(([key], index) => ({
                      label: displayProps[key],
                      content:
                        index === 0 ? (
                          <Heading level={3} size="level-2">
                            {zaak[key as keyof T] as ReactNode}
                          </Heading>
                        ) : (
                          (zaak[key as keyof T] as ReactNode)
                        ),
                    }))}
                  />
                </article>
              );
            }
          )}
        </div>
      )}

      {!zaken.length && (
        <Paragraph>{textNoContent ?? textNoContentDefault}</Paragraph>
      )}

      {hasListPage && (
        <LinkToListPage
          threshold={maxItems}
          linkTitle={listPageLinkTitle ?? `Bekijk meer ${title.toLowerCase()}`}
          label={listPageLinkLabel}
          count={totalItems ?? zaken.length}
          route={listPageRoute}
        />
      )}
    </PageContentCell>
  );
}
