import { LeerlingenvervoerVoorzieningFrontend } from '../../../server/services/jeugd/jeugd';
import { AppRoutes } from '../../../universal/config/routes';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import { WithDetailLinkComponent } from '../../components/Table/TableV2';
import { DisplayProps } from '../../components/Table/TableV2.types';
import { listPageParamKind, listPageTitle } from '../Zorg/Zorg-thema-config';
import styles from '../Zorg/Zorg.module.scss';

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

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      regeling.isActual,
    displayProps: responsiveDisplayProps,
    maxItems: 5,
    className: styles.HuidigeRegelingen,
    textNoContent: 'U heeft geen huidige voorzieningen.',
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      !regeling.isActual,
    displayProps: responsiveDisplayProps,
    maxItems: 5,
    className: styles.EerdereRegelingen,
    textNoContent: 'U heeft geen eerdere en/of afgewezen voorzieningen.',
  },
} as const;

export const routes = {
  themaPage: AppRoutes.JEUGD,
  detailPage: AppRoutes['JEUGD/VOORZIENING'],
} as const;
