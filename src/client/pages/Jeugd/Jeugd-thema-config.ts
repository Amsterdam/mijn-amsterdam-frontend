import { LeerlingenvervoerVoorzieningFrontend } from '../../../server/services/jeugd/jeugd';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import { WithDetailLinkComponent } from '../../components/Table/TableV2.types';
import { DisplayProps } from '../../components/Table/TableV2.types';
import { ThemaRoutesConfig } from '../../config/thema-types';
import { toDocumentTitles, toRoutes } from '../../helpers/themas';

export const themaTitle = 'Onderwijs en Jeugd';
export const themaId = { JEUGD: 'JEUGD' };

const detailRouteBase = '/jeugd/voorziening';

export const routeConfig: ThemaRoutesConfig = {
  themaPage: {
    path: '/jeugd',
    documentTitle: themaTitle,
    trackingUrl: '/jeugd',
  },
  detailPage: {
    path: `${detailRouteBase}/:id`,
    documentTitle: `Voorziening | ${themaTitle}`,
    trackingUrl: detailRouteBase,
  },
} as const;

export const routes = toRoutes(routeConfig);
export const documentTitles = toDocumentTitles(routeConfig);

export const errorMessage = {
  [themaId.JEUGD]: themaTitle,
};

export const LEERLINGENVERVOER_LEES_MEER =
  'https://www.amsterdam.nl/onderwijs-jeugd/leerlingenvervoer/?vkurl=leerlingenvervoer';

type DisplayPropsLeerlingenVervoer = DisplayProps<
  WithDetailLinkComponent<LeerlingenvervoerVoorzieningFrontend>
>;

const displayProps: DisplayPropsLeerlingenVervoer = {
  detailLinkComponent: 'Voorziening',
  status: 'Status',
  statusDateFormatted: 'Datum',
};

const responsiveDisplayProps = withOmitDisplayPropsForSmallScreens(
  displayProps,
  ['statusDateFormatted']
);

export const listPageParamKind = {
  actual: 'huidige-voorzieningen',
  historic: 'eerdere-en-afgewezen-voorzieningen',
} as const;

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige voorzieningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen voorzieningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      regeling.isActual,
    displayProps: responsiveDisplayProps,
    maxItems: 5,
    textNoContent: 'U heeft geen huidige voorzieningen.',
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      !regeling.isActual,
    displayProps: responsiveDisplayProps,
    maxItems: 5,
    textNoContent: 'U heeft geen eerdere en/of afgewezen voorzieningen.',
  },
} as const;
