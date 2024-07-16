import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import StadspasDetail from './StadspasDetail';

const testState: any = {
  STADSPAS: {
    content: {
      adminNumber: '123123123',
      stadspassen: [
        {
          budgets: [],
          dateEnd: '2021-08-31T21:59:59.000Z',
          id: '200769',
          owner: 'G Braber',
          passNumber: 6011012604273,
          pasType: 'ouder',
        },
        {
          budgets: [
            {
              assigned: 25,
              balance: 5,
              code: 'AMSTEST_0-9',
              description: 'Kindbudget test MijnAmsterdam',
              urlTransactions:
                '/wpi/stadspastransacties/gAAAAABfs6wSk83lMv3MAtPe391EqxgHHao5z7PXh1ZSihPf2BHaAJbpfxuRA-8UeEPg72nUbTMrPfhQ2I2OtTDmeBKOPABi5OB-NdL2Q14eUjV6bO3e5-r_G2OPuqMw2Luw35AenP9E',
            },
          ],
          dateEnd: '2021-08-31T21:59:59.000Z',
          id: '200770',
          owner: 'P Blokzijl',
          passNumber: 6011012604737,
          pasType: 'kind',
        },
        {
          budgets: [],
          dateEnd: '2021-08-31T21:59:59.000Z',
          id: '200772',
          owner: 'J Haarlem',
          passNumber: 6011012606062,
          pasType: 'ouder',
        },
        {
          budgets: [
            {
              assigned: 150,
              balance: 150,
              code: 'AMSTEST_10-14',
              description: 'Kindbudget ',
              urlTransactions:
                '/wpi/stadspastransacties/gAAAAABfs6wT4Dljs4eKjKN9JbCP_tTkePB1sD30c1m0SKqYlFUNyZ3WYEovImWgXQuTkKqb0mf2Nb7iHqR21wU8vn-t2Jdnq-F23lr78cFz8WWybnh6DgLrnNhoASxK_9_Ltrj9j35R',
            },
          ],
          dateEnd: '2021-08-31T21:59:59.000Z',
          id: '200781',
          owner: 'R Moes',
          passNumber: 6011012610643,
          pasType: 'kind',
        },
      ],
      aanvragen: [],
    },
    status: 'OK',
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<StadspasDetail />', () => {
  const routeEntry = generatePath(AppRoutes['STADSPAS/SALDO'], {
    id: testState.STADSPAS.content.stadspassen[0].id,
  });
  const routePath = AppRoutes['STADSPAS/SALDO'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={StadspasDetail}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
