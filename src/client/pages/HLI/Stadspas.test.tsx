import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Stadspas from './Stadspas';

const testState: any = {
  STADSPAS: {
    content: {
      adminNumber: '123123123',
      stadspassen: [
        {
          budgets: [
            {
              title: 'SPORT-EN-SPEL',
              assigned: 220,
              balance: 80,
              urlTransactions:
                '/wpi/stadspastransacties/gAAAAABfmojHaIr3lIb5ATsZ98is4S8x3HqxdbVACw8562VCtv3ygKtkD5h7rGCUZhoebm0jFAvLjzibxcgKqpbWELopLBT5Ywf1FzDjzvNVQOij_3hYLks=',
            },
          ],
          dateEnd: '2021-08-31T21:59:59.000Z',
          id: '200769',
          owner: 'G Braber',
          passType: 'kind',
          passNumber: '6011012604273',
        },
      ],
      aanvragen: [
        {
          title: 'Aanvraag stadspas',
          datePublished: '2020-07-24',
          dateStart: '2020-07-14',
          statusId: 'besluit',
          steps: [
            {
              id: 'besluit',
              status: 'Besluit',
              documents: [],
              datePublished: '2020-09-28T00:00:00+02:00',
              decision: 'afwijzing',
            },
          ],
        },
        {
          title: 'Aanvraag stadspas 2',
          datePublished: '2020-07-24',
          dateStart: '2020-07-14',
          statusId: 'herstelTermijn',
          steps: [
            {
              id: 'herstelTermijn',
              status: 'Meer informatie',
              documents: [],
              datePublished: '2020-08-28T00:00:00+02:00',
              decision: 'afwijzing',
            },
          ],
        },
      ],
    },
    status: 'OK',
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
