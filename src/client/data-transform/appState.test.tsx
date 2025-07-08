import { AppState } from '../../universal/types/App.types.ts';
import { PRISTINE_APPSTATE, createAllErrorState } from '../AppState.ts';
import { transformSourceData } from './appState.tsx';
import * as Monitoring from '../helpers/monitoring.ts';

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
    const monitoringSpy = vi.spyOn(Monitoring, 'captureMessage');
    const result = transformSourceData(data as Partial<AppState>);
    expect(monitoringSpy).toHaveBeenCalledWith(
      '[transformSourceData] Unknown stateKey encountered, not found in PRISTINE_APPSTATE',
      {
        properties: {
          unexpectedStateKeys: ['STATE_KEY'],
        },
      }
    );
    expect(result).toEqual({});
  });

  test('Unexpected data', () => {
    const data = '<html>dingen</html>';
    const monitoringSpy = vi.spyOn(Monitoring, 'captureMessage');
    const result = transformSourceData(data as unknown as Partial<AppState>);
    expect(result).toEqual(
      createAllErrorState(PRISTINE_APPSTATE, 'Received invalid appState')
    );
    expect(monitoringSpy).toHaveBeenCalledWith(
      '[transformSourceData] Data returned from server is not an object',
      {
        properties: {
          data,
          identity: '',
        },
      }
    );
  });
});
