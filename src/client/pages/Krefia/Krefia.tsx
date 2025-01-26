import { Paragraph } from '@amsterdam/design-system-react';

import { useKrefiaThemaData } from './useKrefiaThemaData.hook';
import type { KrefiaDeepLink } from '../../../server/services';
import { entries } from '../../../universal/helpers/utils';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function KrefiaThemaPagina() {
  const {
    title,
    deepLinks,
    hasFIBU,
    hasKrefia,
    hasKredietbank,
    tableConfig,
    linkListItems,
    isError,
    isLoading,
  } = useKrefiaThemaData();

  const pageContentTop = (
    <PageContentCell>
      {((hasFIBU && hasKredietbank) || !hasKrefia) && (
        <Paragraph>
          Een online plek waar u alle informatie over uw geldzaken kunt vinden
          als klant van Budgetbeheer (FIBU) en/of Kredietbank Amsterdam.
        </Paragraph>
      )}
      {hasKredietbank && !hasFIBU && (
        <Paragraph>
          Een online plek waar u alle informatie over uw geldzaken kunt vinden
          als klant van Kredietbank Amsterdam.
        </Paragraph>
      )}
      {!hasKredietbank && hasFIBU && (
        <Paragraph>
          Een online plek waar u alle informatie over uw geldzaken kunt vinden
          als klant van Budgetbeheer (FIBU).
        </Paragraph>
      )}
    </PageContentCell>
  );

  const krefiaTables = entries(tableConfig).map(
    ([kind, { title, displayProps, filter }]) => {
      return (
        <ThemaPaginaTable<KrefiaDeepLink>
          key={kind}
          title={title}
          zaken={deepLinks.filter(filter)}
          displayProps={displayProps}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={title}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={krefiaTables}
      linkListItems={linkListItems}
    />
  );
}

// export default function Krefia() {
//   const { KREFIA } = useAppStateGetter();
//   const deepLinks = useDeepLinks(KREFIA.content?.deepLinks);
//   const isKredietbank = !!deepLinks?.schuldhulp || !!deepLinks?.lening;
//   const isFIBU = !!deepLinks?.budgetbeheer;
//   let showText = false;

//   if (!isKredietbank && !isFIBU) {
//     showText = true;
//   }
//   return (
//     <OverviewPageV2>
//       <PageContentV2>
//         <PageHeadingV2 backLink={AppRoutes.HOME}>
//           {ThemaTitles.KREFIA}
//         </PageHeadingV2>
//         {isLoading(KREFIA) && (
//           <PageContentCell>
//             <LoadingContent />
//           </PageContentCell>
//         )}

//         {isError(KREFIA) && (
//           <PageContentCell>
//             <ErrorAlert>

//             </ErrorAlert>
//           </PageContentCell>
//         )}
//       </PageContentV2>
//       {deepLinks?.schuldhulp && (
//         <SectionCollapsible
//           id="SectionCollapsible-krefia-schuldregeling"
//           title="Schuldregeling"
//           startCollapsed={false}
//           className={styles.SectionBorderTop}
//           isLoading={isLoading(KREFIA)}
//         >
//           <Table
//             className={styles.HulpTable}
//             displayProps={DISPLAY_PROPS}
//             items={deepLinks.schuldhulp}
//           />
//         </SectionCollapsible>
//       )}
//       {deepLinks?.lening && (
//         <SectionCollapsible
//           id="SectionCollapsible-krefia-leningen"
//           title="Leningen"
//           startCollapsed={!!deepLinks?.schuldhulp?.length}
//           isLoading={isLoading(KREFIA)}
//         >
//           <Table
//             className={styles.HulpTable}
//             displayProps={DISPLAY_PROPS}
//             items={deepLinks.lening}
//           />
//         </SectionCollapsible>
//       )}
//       {deepLinks?.budgetbeheer && (
//         <SectionCollapsible
//           id="SectionCollapsible-krefia-budgetbeheer"
//           title="Budgetbeheer"
//           startCollapsed={
//             !!deepLinks?.schuldhulp?.length || !!deepLinks?.lening?.length
//           }
//           isLoading={isLoading(KREFIA)}
//         >
//           <Table
//             className={styles.HulpTable}
//             displayProps={DISPLAY_PROPS}
//             items={deepLinks.budgetbeheer}
//           />
//         </SectionCollapsible>
//       )}
//     </OverviewPageV2>
//   );
// }
