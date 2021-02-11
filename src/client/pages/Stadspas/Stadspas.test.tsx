import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Stadspas from './Stadspas';

const testState: any = {
  FOCUS_STADSPAS: {
    content: {
      type: 'hoofdpashouder',
      stadspassen: [
        {
          budgets: [
            {
              title: 'SPORT-EN-SPEL',
              assigned: 220,
              balance: 80,
              urlTransactions:
                '/focus/stadspastransacties/gAAAAABfmojHaIr3lIb5ATsZ98is4S8x3HqxdbVACw8562VCtv3ygKtkD5h7rGCUZhoebm0jFAvLjzibxcgKqpbWELopLBT5Ywf1FzDjzvNVQOij_3hYLks=',
            },
          ],
          datumAfloop: '2021-08-31T21:59:59.000Z',
          id: 200769,
          naam: 'G Braber',
          pasnummer: 6011012604273,
        },
      ],
    },
    status: 'OK',
  },
  FOCUS_AANVRAGEN: {
    status: 'OK',
    content: [
      {
        title: 'Aanvraag stadspas',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Besluit',
        steps: [],
      },
      {
        title: 'Aanvraag stadspas 2',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Meer informatie',
        steps: [],
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Stadpas />', () => {
  const routeEntry = generatePath(AppRoutes.STADSPAS);
  const routePath = AppRoutes.STADSPAS;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Stadspas}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
