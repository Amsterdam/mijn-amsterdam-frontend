import {
  createErrorDisplayData,
  createFailedDependenciesError,
  getApiErrors,
} from './api';
import { FailedDependencies } from '../../universal/helpers/api';
import { AppState } from '../../universal/types/App.types';

describe('Api utils', () => {
  test('createErrorDisplayData', () => {
    const expectedErrorDisplay = {
      stateKey: 'BRP',
      name: 'Persoonlijke gegevens',
      error: 'Dingen gingen mis.',
    };
    expect(
      createErrorDisplayData('BRP', {
        message: 'Dingen gingen mis.',
        status: 'ERROR',
        content: null,
      })
    ).toEqual(expectedErrorDisplay);
  });

  test('createErrorDisplayData unknown stateKey', () => {
    const expectedErrorDisplay = {
      stateKey: 'TEST',
      name: 'TEST',
      error: 'Dingen gingen alweer mis.',
    };
    expect(
      createErrorDisplayData('TEST', {
        message: 'Dingen gingen alweer mis.',
        status: 'ERROR',
        content: null,
      })
    ).toEqual(expectedErrorDisplay);
  });

  test('createFailedDependenciesError', () => {
    const failedDependencies: FailedDependencies = {
      FAIL_1: {
        status: 'ERROR',
        message: '404 not found',
        content: null,
      },
      FAIL_2: {
        status: 'ERROR',
        message: 'Unexpected data',
        content: null,
      },
      FAIL_3: {
        status: 'ERROR',
        message: '',
        content: null,
      },
    };

    const result = createFailedDependenciesError(
      'STATE_WITH_DEPS',
      failedDependencies
    );

    const expectedResult = [
      {
        stateKey: 'STATE_WITH_DEPS_FAIL_1',
        name: 'STATE_WITH_DEPS_FAIL_1',
        error: '404 not found',
      },
      {
        stateKey: 'STATE_WITH_DEPS_FAIL_2',
        name: 'STATE_WITH_DEPS_FAIL_2',
        error: 'Unexpected data',
      },
      {
        stateKey: 'STATE_WITH_DEPS_FAIL_3',
        name: 'STATE_WITH_DEPS_FAIL_3',
        error: 'Communicatie met api mislukt.',
      },
    ];

    expect(result).toEqual(expectedResult);
  });

  test('getApiErrors', () => {
    const failedDependencies: FailedDependencies = {
      FAIL_1: {
        status: 'ERROR',
        message: '404 not found',
        content: null,
      },
    };
    const appState = {
      TEST_STATE_1: null,
      TEST_STATE_2: 'fail',
      TEST_STATE_3: {
        message: 'Things went south',
        status: 'ERROR',
      },
      TEST_STATE_4: {
        status: 'OK',
        failedDependencies,
      },
      TEST_STATE_5: {
        message: 'Could not resolve dependency',
        status: 'DEPENDENCY_ERROR',
      },
    } as Partial<AppState>;

    const expectedResult = [
      {
        stateKey: 'TEST_STATE_1',
        name: 'TEST_STATE_1',
        error: 'Communicatie met api mislukt.',
      },
      {
        stateKey: 'TEST_STATE_2',
        name: 'TEST_STATE_2',
        error: 'Communicatie met api mislukt.',
      },
      {
        stateKey: 'TEST_STATE_3',
        name: 'TEST_STATE_3',
        error: 'Things went south',
      },
      {
        stateKey: 'TEST_STATE_4_FAIL_1',
        name: 'TEST_STATE_4_FAIL_1',
        error: '404 not found',
      },
      {
        stateKey: 'TEST_STATE_5',
        name: 'TEST_STATE_5',
        error: 'Could not resolve dependency',
      },
    ];

    const result = getApiErrors(appState as AppState);

    expect(result).toEqual(expectedResult);
  });
});
