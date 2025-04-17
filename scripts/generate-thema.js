import fs from 'fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import slug from 'slugme';

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// --id <string> --title <string> --zaakType <string> --private --commercial
// user@computer mijn-amsterdam-frontend % node scripts/generate-thema.js --id BELASTINGEN --title Belastingen --zaakType CombinatieAanslag --private --commercial --config thema,render

const args = process.argv;
const options = {
  config: {
    type: 'string',
    default: 'thema,render',
  },
  id: {
    type: 'string',
  },
  title: {
    type: 'string',
  },
  zaakType: {
    type: 'string',
  },
  private: {
    type: 'boolean',
  },
  commercial: {
    type: 'boolean',
  },
  basePath: {
    type: 'string',
    default: 'src/client/pages/Thema',
  },
};

const { values } = parseArgs({
  args,
  options,
  allowPositionals: true,
});

const basePath = values.basePath;

const hasRenderConfig = values.config.includes('render');
const hasCoreConfig = values.config.includes('core');
const hasThemaConfig = values.config.includes('thema');

const ID = values.id.toUpperCase();
const TITLE = capitalizeFirstLetter(values.title);
const titleSlug = slug(values.title.toLowerCase());
const titleName = capitalizeFirstLetter(
  values.title.toLowerCase().replace(/[^a-zA-Z]+/g, '')
);
const PATH = `/${slug(TITLE.toLowerCase())}`;
const ZAAKTYPE = values.zaakType.toUpperCase().replace(/[^a-zA-Z]+/, '');
const typeName = `${capitalizeFirstLetter(ZAAKTYPE.toLowerCase())}Frontend`;
const zaakTypeSlug = slug(
  values.zaakType.toLowerCase().replace(/[^a-zA-Z]+/g, '')
);
const PATH_DETAIL = `/${zaakTypeSlug}`;

const featureToggleName = `${titleName}Active`;

const themaCoreImportsTemplate = `
import { listPageParamKind } from './${titleName}-thema-config';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

`;

const themaCoreTemplate = `
${hasCoreConfig ? themaCoreImportsTemplate : ''}

export const featureToggle = {
  ${featureToggleName}: !IS_PRODUCTION,
};

export const themaId = '${ID}' as const;
export const themaTitle = '${TITLE}';

export const routeConfig = {
  detailPage: {
    path: '${PATH}${PATH_DETAIL}/:id',
    trackingUrl: '${PATH}${PATH_DETAIL}',
    documentTitle: \`${TITLE} | \${themaTitle}\`,
  },
  listPage: {
    path: '${PATH}/lijst/:kind/:page?',
    documentTitle: (_, params) =>
      \`\${params?.kind === listPageParamKind.eerder ? 'Eerdere' : 'Lopende'} aanvragen | \${themaTitle}\`,
  },
  themaPage: {
    path: '${PATH}',
    documentTitle: \`\${themaTitle} | overzicht\`,
  },
} as const satisfies ThemaRoutesConfig;
 `;

const themaConfigTemplate = `
import { generatePath } from 'react-router';

import { IS_PRODUCTION } from '../../../../universal/config/env';
import { LinkProps } from '../../../../universal/types';
import type { ZaakDetail } from '../../../../universal/types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import { ThemaRoutesConfig } from '../../../config/thema-types';

// import type { ${typeName} } from '../../../../server/services/${titleSlug}/config-and-types';
type ${typeName} = ZaakDetail & {
  processed: boolean;
  dateRequest: string;
  dateRequestFormatted: string;
  dateDecision: string | null;
  dateDecisionFormatted: string | null;
};

export const listPageParamKind = {
  lopend: 'lopende-aanvragen',
  eerder: 'eerdere-aanvragen',
} as const;

${themaCoreTemplate}

const lopendeAanvragenDisplayPropsBase: DisplayProps<
  WithDetailLinkComponent<${typeName}>
> = {
  detailLinkComponent: '',
  displayStatus: 'Status',
  dateRequestFormatted: 'Datum aanvraag',
};

const afgehandeldeAanvragenDisplayPropsBase: DisplayProps<
  WithDetailLinkComponent<${typeName}>
  > = {
  detailLinkComponent: '',
  displayStatus: 'Status',
  dateDecisionFormatted: 'Datum besluit',
};

const lopendeAanvragenDisplayProps = withOmitDisplayPropsForSmallScreens(
  lopendeAanvragenDisplayPropsBase,
  ['dateRequestFormatted']
);

const afgehandeldeAanvragenDisplayProps = withOmitDisplayPropsForSmallScreens(
  afgehandeldeAanvragenDisplayPropsBase,
  ['dateDecisionFormatted']
);

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/',
    title: 'Meer informatie op amsterdam.nl',
  },

];

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const tableConfig = {
  [listPageParamKind.lopend]: {
    title: 'Lopende aanvragen',
    filter: (zaak: ${typeName}) => {
      return !zaak.processed;
    },
    displayProps: lopendeAanvragenDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.lopend,
      page: ':page?',
    }),
  },
  [listPageParamKind.eerder]: {
    title: 'Eerdere aanvragen',
    filter: (zaak: ${typeName}) => {
      return zaak.processed;
    },
    displayProps: afgehandeldeAanvragenDisplayProps,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.eerder,
      page: ':page?',
    }),
  },
} as const;
`;

const themaPageComponentName = `${titleName}Thema`;
const detailPageComponentName = `${titleName}Detail`;
const listPageComponentName = `${titleName}Lijst`;
const iconComponentName = `${titleName}Icon`;

const renderConfigTemplate = `
import {
  routeConfig,
  themaId,
  themaTitle,
  featureToggle,
} from './${titleName}-thema-config';
import { ${detailPageComponentName} } from './${detailPageComponentName}';
import { ${iconComponentName} } from './${iconComponentName}';
import { ${listPageComponentName} } from './${listPageComponentName}';
import { ${themaPageComponentName} } from './${themaPageComponentName}';
import { isLoading } from '../../../universal/helpers/api';
import { type AppState } from '../../../universal/types/App.types';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../config/thema-types';

export const ${titleName}Routes = [
  {
    route: routeConfig.detailPage.path,
    Component: ${titleName}Detail,
    isActive: featureToggle.${featureToggleName},
  },
  {
    route: routeConfig.listPage.path,
    Component: ${titleName}Lijst,
    isActive: featureToggle.${featureToggleName},
  },
  {
    route: routeConfig.themaPage.path,
    Component: ${titleName}Thema,
    isActive: featureToggle.${featureToggleName},
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: routeConfig.themaPage.path,
  profileTypes: [${values.private ? `'private'` : ''}${values.private && values.commercial ? ',' : ''}${values.commercial ? `'commercial'` : ''}],
  isActive(appState: AppState) {
    return (
      featureToggle.${featureToggleName} &&
      !isLoading(appState.${ID}) &&
      !!appState.${ID}.content?.length
    );
  },
  IconSVG: ${iconComponentName},
};

`;

const fileNameCoreConfig = `${basePath}/${capitalizeFirstLetter(titleSlug)}/${capitalizeFirstLetter(titleSlug)}-thema-core-config.ts`;
const fileNameThemaConfig = `${basePath}/${capitalizeFirstLetter(titleSlug)}/${capitalizeFirstLetter(titleSlug)}-thema-config.ts`;
const fileNameRenderConfig = `${basePath}/${capitalizeFirstLetter(titleSlug)}/${capitalizeFirstLetter(titleSlug)}-render-config.ts`;

if (hasRenderConfig || hasThemaConfig || hasCoreConfig) {
  fs.mkdirSync(path.dirname(fileNameThemaConfig), { recursive: true });
}

if (hasCoreConfig) {
  fs.writeFileSync(fileNameCoreConfig, themaCoreTemplate, {
    encoding: 'utf-8',
  });
}

if (hasThemaConfig) {
  fs.writeFileSync(fileNameThemaConfig, themaConfigTemplate, {
    encoding: 'utf-8',
  });
}

if (hasRenderConfig) {
  fs.writeFileSync(fileNameRenderConfig, renderConfigTemplate, {
    encoding: 'utf-8',
  });
}

hasCoreConfig && console.log(`Core config generated at ${fileNameCoreConfig}`);
hasThemaConfig &&
  console.log(`Thema config generated at ${fileNameThemaConfig}`);
hasRenderConfig &&
  console.log(`Render config generated at ${fileNameRenderConfig}`);
console.log('Done!');
console.log('Please check the generated files and adjust them as needed.');
