import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { appStateAtom } from '../../hooks';
import { Search } from './Search';
import * as remoteConfig from './search-config.json';
import { setupFetchStub } from './useSearch.test';

describe('<Search />', () => {
  let axiosGetSpy: jest.SpyInstance;

  beforeEach(() => {
    axiosGetSpy = jest.spyOn(axios, 'get');
    jest.useFakeTimers('modern');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Render search placeholder busy', async () => {
    render(
      <BrowserRouter>
        <RecoilRoot>
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    await screen.findByPlaceholderText('Zoeken voorbereiden...');
  });

  test('Render search placeholder ready', async () => {
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

    await screen.findByPlaceholderText('Zoeken naar...');
  });

  test('Enter search text', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(setupFetchStub(remoteConfig) as any);

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
                      to: '/vergunningen/gpk/1726584505',
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

    expect(axiosGetSpy).toBeCalledTimes(2);

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

    expect(axiosGetSpy).toBeCalledTimes(2);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Home -')).toBeInTheDocument();

    await screen.findByText('Zoeken...');
  });
});
