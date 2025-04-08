import { LeerlingenvervoerVoorzieningFrontend } from '../../../server/services/jeugd/jeugd';
import { AppRoutes } from '../../../universal/config/routes';
import { listPageParamKind, listPageTitle } from '../Zorg/Zorg-thema-config';
import styles from '../Zorg/Zorg.module.scss';

const displayProps = {
  detailLinkComponent: 'Voorziening',
  status: 'Status',
  statusDateFormatted: 'Datum',
};

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      regeling.isActual,
    displayProps,
    maxItems: 5,
    className: styles.HuidigeRegelingen,
    textNoContent: 'U heeft geen huidige voorzieningen.',
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling: LeerlingenvervoerVoorzieningFrontend) =>
      !regeling.isActual,
    displayProps,
    maxItems: 5,
    className: styles.EerdereRegelingen,
    textNoContent: 'U heeft geen eerdere en/of afgewezen voorzieningen.',
  },
} as const;

export const routes = {
  themaPage: AppRoutes.JEUGD,
  detailPage: AppRoutes['JEUGD/VOORZIENING'],
} as const;
