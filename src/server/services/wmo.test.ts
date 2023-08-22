import {
  hasFutureDate,
  hasHistoricDate,
  isServiceDeliveryStarted,
  WmoApiItem,
  isServiceDeliveryActive,
  isServiceDeliveryStopped,
  transformWmoResponse,
} from './wmo';

const apiTestItems: WmoApiItem[] = [
  {
    title: 'hulp bij het huishouden (nog niet geleverd)',
    isActual: true,
    deliveryType: 'ZIN',
    supplier: 'Emile Thuiszorg',
    itemTypeCode: 'WMH',
    dateDecision: '2022-01-15',
    dateStart: '2022-01-15',
    dateEnd: null,
    serviceOrderDate: null,
    serviceDateStart: null,
    serviceDateEnd: null,
    documents: [],
  },
  {
    title: 'hulp bij het huishouden (geleverd)',
    isActual: true,
    deliveryType: 'ZIN',
    supplier: 'Emile Thuiszorg',
    itemTypeCode: 'WMH',
    dateDecision: '2022-01-15',
    dateStart: '2021-12-15',
    dateEnd: null,
    serviceOrderDate: null,
    serviceDateStart: '2022-01-12',
    serviceDateEnd: null,
    documents: [],
  },
  {
    title: 'hulp bij het huishouden (tijdelijk gestopt)',
    isActual: true,
    deliveryType: 'ZIN',
    supplier: 'Emile Thuiszorg',
    itemTypeCode: 'WMH',
    dateDecision: '2022-01-15',
    dateStart: '2021-12-15',
    dateEnd: null,
    serviceOrderDate: null,
    serviceDateStart: '2022-01-12',
    serviceDateEnd: '2022-02-05',
    documents: [],
  },
  {
    title: 'hulp bij het huishouden (gestopt)',
    isActual: false,
    deliveryType: 'ZIN',
    supplier: 'Emile Thuiszorg',
    itemTypeCode: 'WMH',
    dateDecision: '2022-01-15',
    dateStart: '2021-12-15',
    dateEnd: '2022-01-22',
    serviceOrderDate: null,
    serviceDateStart: '2022-01-12',
    serviceDateEnd: '2022-01-19',
    documents: [],
  },
  {
    dateDecision: '2016-06-10',
    dateEnd: null,
    dateStart: '2016-04-28',
    deliveryType: '',
    isActual: true,
    itemTypeCode: 'MVV',
    serviceDateEnd: null,
    serviceDateStart: null,
    serviceOrderDate: null,
    supplier: null,
    title:
      'financiële tegemoetkoming gebruik gesloten buitenwagen in bruikleen',
    documents: [],
  },
  {
    title: 'PGB item 1',
    isActual: false,
    deliveryType: 'PGB',
    supplier: 'PGB Ring',
    itemTypeCode: 'AO5',
    dateDecision: '2017-11-24',
    dateStart: '2017-11-24',
    dateEnd: '2018-11-23',
    serviceOrderDate: '2017-11-24',
    serviceDateStart: '2017-11-24',
    serviceDateEnd: '2018-11-23',
    documents: [],
  },
  {
    title: 'woonruimte aanpassing (opdracht gegeven)',
    isActual: true,
    deliveryType: 'ZIN',
    supplier: 'Aanpassing Thuiszorg',
    itemTypeCode: 'WRA',
    dateDecision: '2022-01-15',
    dateStart: '2021-12-15',
    dateEnd: null,
    serviceOrderDate: '2022-01-12',
    serviceDateStart: null,
    serviceDateEnd: null,
    documents: [],
  },
  {
    title: 'woonruimteaanpassing',
    isActual: false,
    deliveryType: 'ZIN',
    supplier: 'JTWD - Zorg',
    itemTypeCode: 'WRA',
    dateDecision: '2022-01-03',
    dateStart: '2022-01-03',
    dateEnd: '2022-03-10',
    serviceOrderDate: '2022-01-23T13:31:36',
    serviceDateStart: null,
    serviceDateEnd: null,
    documents: [],
  },
];

describe('Transform api items', () => {
  const compareDate = new Date(2022, 2, 11);
  test('hulp bij het huishouden (nog niet geleverd)', () => {
    const [transformed] = transformWmoResponse([apiTestItems[0]], compareDate);
    expect(transformed.steps.length).toBe(4);
    expect(transformed.isActual).toBe(true);
    expect(transformed.steps[0].isActive).toBe(true);
    expect(transformed.steps[0].isChecked).toBe(true);
    // All other steps are not checked / not active
    expect(
      transformed.steps
        .slice(1)
        .every((step) => step.isActive === false && step.isChecked === false)
    ).toBe(true);
  });

  test('hulp bij het huishouden (geleverd)', () => {
    const [transformed] = transformWmoResponse([apiTestItems[1]], compareDate);
    expect(transformed.steps.length).toBe(4);
    expect(transformed.isActual).toBe(true);
    expect(transformed.steps[0].isActive).toBe(false);
    expect(transformed.steps[0].isChecked).toBe(true);

    expect(transformed.steps[1].isActive).toBe(true);
    expect(transformed.steps[1].isChecked).toBe(true);

    expect(transformed.steps[2].isActive).toBe(false);
    expect(transformed.steps[2].isChecked).toBe(false);

    expect(transformed.steps[3].isActive).toBe(false);
    expect(transformed.steps[3].isChecked).toBe(false);
  });

  test('hulp bij het huishouden (tijdelijk gestopt)', () => {
    const [transformed] = transformWmoResponse([apiTestItems[2]], compareDate);
    expect(transformed.steps.length).toBe(4);
    expect(transformed.isActual).toBe(true);
    expect(transformed.steps[0].isActive).toBe(false);
    expect(transformed.steps[0].isChecked).toBe(true);

    expect(transformed.steps[1].isActive).toBe(false);
    expect(transformed.steps[1].isChecked).toBe(true);

    expect(transformed.steps[2].isActive).toBe(true);
    expect(transformed.steps[2].isChecked).toBe(true);

    expect(transformed.steps[3].isActive).toBe(false);
    expect(transformed.steps[3].isChecked).toBe(false);
  });

  test('hulp bij het huishouden (gestopt)', () => {
    const [transformed] = transformWmoResponse([apiTestItems[3]], compareDate);
    expect(transformed.steps.length).toBe(4);
    expect(transformed.isActual).toBe(false);
    expect(transformed.steps[0].isActive).toBe(false);
    expect(transformed.steps[0].isChecked).toBe(true);

    expect(transformed.steps[1].isActive).toBe(false);
    expect(transformed.steps[1].isChecked).toBe(true);

    expect(transformed.steps[2].isActive).toBe(false);
    expect(transformed.steps[2].isChecked).toBe(true);

    expect(transformed.steps[3].isActive).toBe(true);
    expect(transformed.steps[3].isChecked).toBe(true);
  });

  test('financiële tegemoetkoming gebruik gesloten buitenwagen in bruikleen', () => {
    const [transformed] = transformWmoResponse([apiTestItems[4]], compareDate);
    expect(transformed.steps.length).toBe(2);
    expect(transformed.isActual).toBe(true);
    expect(transformed.steps[0].isActive).toBe(true);
    expect(transformed.steps[0].isChecked).toBe(true);

    expect(transformed.steps[1].isActive).toBe(false);
    expect(transformed.steps[1].isChecked).toBe(false);
  });

  test('PGB item 1', () => {
    const testItem = apiTestItems[5];
    let [transformed] = transformWmoResponse([testItem], compareDate);
    expect(transformed.steps.length).toBe(2);
    expect(transformed.isActual).toBe(false);

    expect(transformed.steps[0].isActive).toBe(false);
    expect(transformed.steps[0].isChecked).toBe(true);

    expect(transformed.steps[1].isActive).toBe(true);
    expect(transformed.steps[1].isChecked).toBe(true);
  });

  test('woonruimte aanpassing (opdracht gegeven)', () => {
    const [transformed] = transformWmoResponse([apiTestItems[6]], compareDate);
    expect(transformed.steps.length).toBe(4);
    expect(transformed.isActual).toBe(true);

    expect(transformed.steps[0].isActive).toBe(false);
    expect(transformed.steps[0].isChecked).toBe(true);

    expect(transformed.steps[1].isActive).toBe(true);
    expect(transformed.steps[1].isChecked).toBe(true);

    expect(transformed.steps[2].isActive).toBe(false);
    expect(transformed.steps[2].isChecked).toBe(false);

    expect(transformed.steps[3].isActive).toBe(false);
    expect(transformed.steps[3].isChecked).toBe(false);
  });

  test('woonruimte aanpassing (geen levering voor einde recht)', () => {
    const [transformed] = transformWmoResponse([apiTestItems[7]], compareDate);
    expect(transformed.steps.length).toBe(3);
    expect(transformed.isActual).toBe(false);

    expect(transformed.steps[0].isActive).toBe(false);
    expect(transformed.steps[0].isChecked).toBe(true);

    expect(transformed.steps[1].isActive).toBe(false);
    expect(transformed.steps[1].isChecked).toBe(true);

    expect(transformed.steps[2].isActive).toBe(true);
    expect(transformed.steps[2].isChecked).toBe(true);
  });

  test('All transformations', () => {
    let transformed = transformWmoResponse(apiTestItems, compareDate);
    expect(transformed).toMatchSnapshot();
  });

  test('hasFutureDate', () => {
    expect(hasFutureDate('2020-01-01', compareDate)).toBe(false);
    expect(hasFutureDate('2023-01-01', compareDate)).toBe(true);
    expect(hasFutureDate(compareDate, compareDate)).toBe(false);
    expect(hasFutureDate(null, compareDate)).toBe(false);
  });

  test('hasHistoricDate', () => {
    expect(hasHistoricDate('2020-01-01', compareDate)).toBe(true);
    expect(hasHistoricDate('2023-01-01', compareDate)).toBe(false);
    expect(hasHistoricDate(compareDate, compareDate)).toBe(true);
    expect(hasHistoricDate(null, compareDate)).toBe(false);
  });

  test('isServiceDeliveryStarted', () => {
    expect(
      isServiceDeliveryStarted(
        { serviceDateStart: null } as WmoApiItem,
        compareDate
      )
    ).toBe(false);
    expect(
      isServiceDeliveryStarted(
        { serviceDateStart: '2020-01-01' } as WmoApiItem,
        compareDate
      )
    ).toBe(true);
    expect(
      isServiceDeliveryStarted(
        { serviceDateStart: '2023-01-01' } as WmoApiItem,
        compareDate
      )
    ).toBe(false);
  });

  test('isServiceDeliveryStopped', () => {
    expect(
      isServiceDeliveryStopped(
        { serviceDateEnd: null } as WmoApiItem,
        compareDate
      )
    ).toBe(false);
    expect(
      isServiceDeliveryStopped(
        { serviceDateEnd: '2020-01-01' } as WmoApiItem,
        compareDate
      )
    ).toBe(true);
    expect(
      isServiceDeliveryStopped(
        { serviceDateEnd: '2023-01-01' } as WmoApiItem,
        compareDate
      )
    ).toBe(false);
  });

  test('isServiceDeliveryActive', () => {
    expect(
      isServiceDeliveryActive(
        {
          serviceDateEnd: null,
          serviceDateStart: null,
          isActual: true,
        } as WmoApiItem,
        compareDate
      )
    ).toBe(false);

    expect(
      isServiceDeliveryActive(
        {
          serviceDateEnd: '2020-01-01',
          serviceDateStart: '2019-01-01',
          isActual: true,
        } as WmoApiItem,
        compareDate
      )
    ).toBe(false);

    expect(
      isServiceDeliveryActive(
        {
          serviceDateEnd: '2023-01-01',
          serviceDateStart: '2022-12-01',
          isActual: true,
        } as WmoApiItem,
        compareDate
      )
    ).toBe(false);

    expect(
      isServiceDeliveryActive(
        {
          serviceDateEnd: '2023-01-01',
          serviceDateStart: '2020-01-01',
          isActual: false,
        } as WmoApiItem,
        compareDate
      )
    ).toBe(false);

    expect(
      isServiceDeliveryActive(
        {
          serviceDateEnd: '2023-01-01',
          serviceDateStart: '2020-01-01',
          isActual: true,
        } as WmoApiItem,
        compareDate
      )
    ).toBe(true);
  });
});
