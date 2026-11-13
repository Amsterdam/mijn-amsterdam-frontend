import { describe, expect, it } from 'vitest';

import {
  getServiceAlertLinkValidationMessage,
  getServiceAlertUpsertFormResult,
} from './ServiceAlertUpsertForm.helpers.ts';
import type { ServiceAlertUpsertFormValues } from './ServiceAlertUpsertForm.types.ts';

function createFormValues(
  links: ServiceAlertUpsertFormValues['links']
): ServiceAlertUpsertFormValues {
  const formData = new FormData();
  formData.set('title', 'Testmelding');
  formData.set('body', 'Testbericht');
  formData.set('displayLocation', 'notification');
  formData.set('type', 'info');
  formData.set('environment', 'test');

  return {
    formData,
    dateRange: {
      start: new Date('2026-11-11T00:00:00.000Z'),
      end: new Date('2026-11-12T00:00:00.000Z'),
    },
    timeStart: '09:00',
    timeEnd: '10:00',
    type: 'info',
    links,
  };
}

describe('getServiceAlertUpsertFormResult links', () => {
  it('includes multiple links in their given order', () => {
    const result = getServiceAlertUpsertFormResult(
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
    const result = getServiceAlertUpsertFormResult(
      createFormValues([
        { label: 'Onveilige link', url: 'http://example.com', sortOrder: 0 },
      ])
    );

    expect(result.payload).toBeNull();
    expect(result.validationMessage).toContain('https://');
  });

  it('ignores a fully empty link row', () => {
    const result = getServiceAlertUpsertFormResult(
      createFormValues([{ label: '', url: '', sortOrder: 0 }])
    );

    expect(result.payload?.links).toEqual([]);
  });

  it('only includes links that have been added to the list', () => {
    const result = getServiceAlertUpsertFormResult(createFormValues([]));

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
