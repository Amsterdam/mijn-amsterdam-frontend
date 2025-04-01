import styles from '../Zorg/Zorg.module.scss';
const displayProps = {
  detailLinkComponent: 'Voorziening',
  status: 'Status',
  statusDateFormatted: 'Datum',
};

export const listPageParamKind = {
  actual: 'huidige-regelingen',
  historic: 'eerdere-en-afgewezen-regelingen',
} as const;

export const listPageTitle = {
  [listPageParamKind.actual]: 'Huidige voorzieningen',
  [listPageParamKind.historic]: 'Eerdere en afgewezen voorzieningen',
} as const;

export const tableConfig = {
  [listPageParamKind.actual]: {
    title: listPageTitle[listPageParamKind.actual],
    filter: (regeling) => regeling.isActual,
    displayProps: displayProps,
    maxItems: 5,
    className: styles.HuidigeRegelingen,
    textNoContent: 'U heeft geen huidige voorzieningen.',
  },
  [listPageParamKind.historic]: {
    title: listPageTitle[listPageParamKind.historic],
    filter: (regeling) => !regeling.isActual,
    displayProps: displayProps,
    maxItems: 5,
    className: styles.EerdereRegelingen,
    textNoContent:
      'U heeft geen eerdere en/of afgewezen voorzieningen. U ziet hier niet alle gegevens uit het verleden. De gegevens die u hier niet ziet, heeft u eerder per post ontvangen.',
  },
} as const;
