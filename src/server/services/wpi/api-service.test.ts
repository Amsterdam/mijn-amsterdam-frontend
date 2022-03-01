import {
  fetchBbz,
  fetchBijstandsuitkering,
  FetchConfig,
  fetchEAanvragen,
  fetchRequestProcess,
  fetchStadspas,
  fetchTonk,
  fetchTozo,
  fetchWpiNotifications,
} from './api-service';

describe('wpi/app-service', () => {
  let sessionID = '';
  let requestHeaders = {};

  test('fetchRequestProcess', () => {
    const getLabelsMock = jest.fn();
    const fetchConfig: FetchConfig = {
      apiConfigName: '',
    };

    const result = fetchRequestProcess(
      sessionID,
      requestHeaders,
      getLabelsMock,
      fetchConfig
    );
  });

  test('fetchBijstandsuitkering', () => {
    const result = fetchBijstandsuitkering(sessionID, requestHeaders);
  });

  test('fetchStadspas', () => {
    const result = fetchStadspas(sessionID, requestHeaders);
  });

  test('fetchEAanvragen', () => {
    const result = fetchEAanvragen(sessionID, requestHeaders);
  });

  test('fetchTozo', () => {
    const result = fetchTozo(sessionID, requestHeaders);
  });

  test('fetchBbz', () => {
    const result = fetchBbz(sessionID, requestHeaders);
  });

  test('fetchTonk', () => {
    const result = fetchTonk(sessionID, requestHeaders);
  });

  test('fetchWpiNotifications', () => {
    const result = fetchWpiNotifications(sessionID, requestHeaders);
  });
});
