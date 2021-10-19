import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RecoilRoot } from 'recoil';
import { appStateAtom } from '../../hooks';
import { Search } from './Search';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

describe('<Search />', () => {
  let axiosGetSpy: jest.SpyInstance;

  beforeEach(() => {
    axiosGetSpy = jest.spyOn(axios, 'get');
    jest.useFakeTimers('modern');
  });

  afterEach(() => {
    axiosGetSpy.mockRestore();
  });

  test('Render without crashing', () => {
    render(
      <RecoilRoot>
        <Search />
      </RecoilRoot>
    );
  });

  test('Render without crashing', () => {
    render(
      <BrowserRouter>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, {
              VERGUNNINGEN: { status: 'OK', content: [] },
            } as any);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Zoeken naar...')).toBeInTheDocument();
  });

  test('Enter search text', async () => {
    render(
      <BrowserRouter>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, {
              VERGUNNINGEN: {
                status: 'OK',
                content: [
                  {
                    caseType: 'GPK',
                    title: 'Europse gehandicaptenparkeerkaart (GPK)',
                    identifier: 'Z/000/000008',
                    status: 'Ontvangen',
                    description: 'Amstel 1 GPK aanvraag',
                    link: {
                      to: '/vergunningen/detail/1726584505',
                      title: 'Bekijk hoe het met uw aanvraag staat',
                    },
                  },
                ],
              },
            } as any);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );
    userEvent.type(
      screen.getByPlaceholderText('Zoeken naar...'),
      'gehandicaptenparkeerkaart'
    );

    expect(screen.getByPlaceholderText('Zoeken naar...')).toHaveValue(
      'gehandicaptenparkeerkaart'
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(axiosGetSpy).toBeCalledTimes(1);

    axiosGetSpy.mockReset();

    expect(screen.getByText('Z/000/000008')).toBeInTheDocument();

    userEvent.type(
      screen.getByPlaceholderText('Zoeken naar...'),
      '{selectall}{del}Dashboard'
    );

    expect(screen.getByPlaceholderText('Zoeken naar...')).toHaveValue(
      'Dashboard'
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(axiosGetSpy).toBeCalledTimes(1);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('/ Home')).toBeInTheDocument();
  });
});
