import { describe, expect, it } from 'vitest';

import { createFetchDocumentsListUrl } from './horeca-service-config.ts';
import { getDocumentsProvider } from '../shared/document-provider-registry.ts';

describe('horeca service config shared documents', () => {
  it('self-registers the horeca/decos provider', () => {
    const provider = getDocumentsProvider('horeca', 'decos');

    expect(provider).toBeDefined();
    expect(provider?.opsToggleKey).toBe('HORECA.DECOS.documents');
  });

  it('creates a shared documents list url with encrypted id payload', () => {
    const url = createFetchDocumentsListUrl('sid-test', 'zaak-key-test');
    const parsed = new URL(url);

    expect(parsed.pathname).toBe('/api/v1/services/documents/list');
    expect(parsed.searchParams.get('id')).toBeTruthy();
  });
});
