import { describe, expect, it } from 'vitest';

import { NOTIFICATION_SERVICE_ALERT_TYPE } from './ServiceAlertForm.constants.ts';
import {
  getServiceAlertFormResult,
  getServiceAlertLinkValidationMessage,
  SERVICE_ALERT_FORM_ERROR_MESSAGES,
} from './ServiceAlertForm.helpers.ts';
import type { ServiceAlertFormValues } from './ServiceAlertForm.types.ts';

function createFormValues(
  links: ServiceAlertFormValues['links']
): ServiceAlertFormValues {
  return {
    title: 'Testmelding',
    body: 'Testbericht',
    displayLocation: 'notification',
    type: 'info',
    themaId: '',
    dateRange: {
      start: new Date('2026-11-11T00:00:00.000Z'),
      end: new Date('2026-11-12T00:00:00.000Z'),
    },
    timeStart: '09:00',
    timeEnd: '10:00',
    links,
  };
}

describe('getServiceAlertFormResult errors', () => {
  it('returns no errors for a valid form', () => {
    const result = getServiceAlertFormResult(createFormValues([]));

    expect(result.errors).toBeNull();
    expect(result.payload).not.toBeNull();
  });

  it('returns an error per missing field', () => {
    const formValues = createFormValues([]);
    formValues.title = ' ';
    formValues.body = '';
    formValues.dateRange = { start: null, end: null };
    formValues.timeStart = '';
    formValues.timeEnd = '';

    const result = getServiceAlertFormResult(formValues);

    expect(result).toEqual({
      payload: null,
      errors: {
        title: SERVICE_ALERT_FORM_ERROR_MESSAGES.title,
        body: SERVICE_ALERT_FORM_ERROR_MESSAGES.body,
        period: SERVICE_ALERT_FORM_ERROR_MESSAGES.period,
        timeStart: SERVICE_ALERT_FORM_ERROR_MESSAGES.timeStart,
        timeEnd: SERVICE_ALERT_FORM_ERROR_MESSAGES.timeEnd,
      },
    });
  });

  it('rejects an unknown thema for theme alerts', () => {
    const formValues = createFormValues([]);
    formValues.displayLocation = 'theme';
    formValues.themaId = 'ONBEKEND';

    const result = getServiceAlertFormResult(formValues);

    expect(result.errors).toEqual({
      themaId: SERVICE_ALERT_FORM_ERROR_MESSAGES.themaId,
    });
  });

  it('requires a thema for theme alerts', () => {
    const formValues = createFormValues([]);
    formValues.displayLocation = 'theme';

    const result = getServiceAlertFormResult(formValues);

    expect(result.errors).toEqual({
      themaId: SERVICE_ALERT_FORM_ERROR_MESSAGES.themaId,
    });
  });

  it('marks the end time when the end lies before the start', () => {
    const formValues = createFormValues([]);
    formValues.dateRange = {
      start: new Date('2026-11-11T00:00:00.000Z'),
      end: new Date('2026-11-11T00:00:00.000Z'),
    };
    formValues.timeStart = '10:00';
    formValues.timeEnd = '09:00';

    const result = getServiceAlertFormResult(formValues);

    expect(result.errors).toEqual({
      timeEnd: SERVICE_ALERT_FORM_ERROR_MESSAGES.timeEndBeforeStart,
    });
  });
});

describe('getServiceAlertFormResult displayLocation', () => {
  it('requires a display location to be chosen', () => {
    const formValues = createFormValues([]);
    formValues.displayLocation = undefined;

    const result = getServiceAlertFormResult(formValues);

    expect(result).toEqual({
      payload: null,
      errors: {
        displayLocation: SERVICE_ALERT_FORM_ERROR_MESSAGES.displayLocation,
      },
    });
  });
});

describe('getServiceAlertFormResult type', () => {
  it('requires a type to be chosen for login and theme alerts', () => {
    const formValues = createFormValues([]);
    formValues.displayLocation = 'login';
    formValues.type = undefined;

    const result = getServiceAlertFormResult(formValues);

    expect(result).toEqual({
      payload: null,
      errors: { type: SERVICE_ALERT_FORM_ERROR_MESSAGES.type },
    });
  });

  it('uses the chosen type for login and theme alerts', () => {
    const formValues = createFormValues([]);
    formValues.displayLocation = 'login';
    formValues.type = 'error';

    const result = getServiceAlertFormResult(formValues);

    expect(result.payload).toMatchObject({
      displayLocation: 'login',
      type: 'error',
    });
  });

  it('does not require a type for notifications and saves the default type', () => {
    const formValues = createFormValues([]);
    formValues.type = undefined;

    const result = getServiceAlertFormResult(formValues);

    expect(result.errors).toBeNull();
    expect(result.payload).toMatchObject({
      displayLocation: 'notification',
      type: NOTIFICATION_SERVICE_ALERT_TYPE,
    });
  });

  it('ignores a previously chosen type for notifications', () => {
    const formValues = createFormValues([]);
    formValues.type = 'error';

    const result = getServiceAlertFormResult(formValues);

    expect(result.payload?.type).toBe(NOTIFICATION_SERVICE_ALERT_TYPE);
  });
});

describe('getServiceAlertFormResult links', () => {
  it('includes multiple links in their given order', () => {
    const result = getServiceAlertFormResult(
      createFormValues([
        {
          label: 'Meer informatie',
          url: 'https://example.com/info',
          sortOrder: 0,
        },
        { label: 'Contact', url: 'https://example.com/contact', sortOrder: 1 },
      ])
    );

    expect(result.payload?.links).toEqual([
      {
        label: 'Meer informatie',
        url: 'https://example.com/info',
        sortOrder: 0,
      },
      { label: 'Contact', url: 'https://example.com/contact', sortOrder: 1 },
    ]);
  });

  it('rejects links without an https URL or a label', () => {
    const result = getServiceAlertFormResult(
      createFormValues([
        { label: 'Onveilige link', url: 'http://example.com', sortOrder: 0 },
      ])
    );

    expect(result.payload).toBeNull();
    expect(result.errors).toEqual({
      links: SERVICE_ALERT_FORM_ERROR_MESSAGES.links,
    });
  });

  it('ignores a fully empty link row', () => {
    const result = getServiceAlertFormResult(
      createFormValues([{ label: '', url: '', sortOrder: 0 }])
    );

    expect(result.payload?.links).toEqual([]);
  });

  it('only includes links that have been added to the list', () => {
    const result = getServiceAlertFormResult(createFormValues([]));

    expect(result.payload?.links).toEqual([]);
  });
});

describe('getServiceAlertLinkValidationMessage', () => {
  it('requires a label and an https URL before adding a link', () => {
    expect(
      getServiceAlertLinkValidationMessage({
        label: 'Handleiding',
        url: 'https://example.com/handleiding',
      })
    ).toBeNull();
    expect(
      getServiceAlertLinkValidationMessage({ label: '', url: '' })
    ).not.toBeNull();
  });
});
