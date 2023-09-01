import { PRISTINE_APPSTATE, AppState, createAllErrorState } from '../AppState';
import { transformSourceData } from './appState';
import * as Sentry from '@sentry/react';

describe('transformSourceData', () => {
  test('transformSourceData', () => {
    const testPristineState = PRISTINE_APPSTATE as any;

    testPristineState.TEST_STATE_1 = {
      content: [],
      status: 'PRISTINE',
    };

    testPristineState.TEST_STATE_2 = {
      content: null,
      status: 'PRISTINE',
    };

    testPristineState.TEST_STATE_3 = {
      content: {
        foo: 'bar',
      },
      status: 'PRISTINE',
    };

    const expectedResult = {
      TEST_STATE_1: {
        content: ['foo', 'bar'],
        status: 'OK',
      },
      TEST_STATE_2: {
        content: {
          isKnown: true,
          notifications: [],
        },
        status: 'OK',
      },
      TEST_STATE_3: {
        content: {
          foo: 'bar',
        },
        status: 'ERROR',
        message: 'Things went south',
      },
    };

    const data = {
      TEST_STATE_1: {
        content: ['foo', 'bar'],
        status: 'OK',
      },
      TEST_STATE_2: {
        content: {
          isKnown: true,
          notifications: [],
        },
        status: 'OK',
      },
      TEST_STATE_3: {
        message: 'Things went south',
        status: 'ERROR',
      },
    };

    const result = transformSourceData(data as Partial<AppState>);
    expect(result).toEqual(expectedResult);
  });

  test('Unexpected state key', () => {
    const data = { STATE_KEY: '<html>dingen</html>' };
    const sentrySpy = vi.spyOn(Sentry, 'captureMessage');
    const result = transformSourceData(data as Partial<AppState>);
    expect(sentrySpy).toHaveBeenCalledWith(
      '[transformSourceData] Unknown stateKey encountered',
      {
        extra: {
          unexpectedStateKeys: ['STATE_KEY'],
        },
      }
    );
    expect(result).toEqual({});
  });

  test('Unexpected data', () => {
    const data = '<html>dingen</html>';
    const sentrySpy = vi.spyOn(Sentry, 'captureMessage');
    const result = transformSourceData(data as Partial<AppState>);
    expect(result).toEqual(
      createAllErrorState(PRISTINE_APPSTATE, 'Received invalid appState')
    );
    expect(sentrySpy).toHaveBeenCalledWith(
      '[transformSourceData] Data returned from server is not an object',
      {
        extra: {
          data,
          identity: '',
        },
      }
    );
  });
});
