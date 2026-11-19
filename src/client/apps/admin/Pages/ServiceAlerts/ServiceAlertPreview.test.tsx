import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { AppState } from '../../../../../universal/types/App.types.ts';
import { MockApp } from '../../../../apps/bob/pages/MockApp.tsx';
import { ServiceAlertPreview } from './ServiceAlertPreview.tsx';

const BODY =
  '<p><strong>Safe text</strong></p><iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe><img src=x onerror=alert(1)><script>alert(1)</script>';

describe('<ServiceAlertPreview />', () => {
  test.each(['notification', 'alert'] as const)(
    'sanitizes HTML for the %s preview',
    (displayLocation) => {
      render(
        <MockApp
          component={() => (
            <ServiceAlertPreview
              title="Service alert"
              body={BODY}
              displayLocation={displayLocation}
              links={[]}
            />
          )}
          state={{} as AppState}
        />
      );

      expect(screen.getByText('Safe text').tagName).toBe('P');
      expect(document.querySelector('iframe')).not.toBeInTheDocument();
      expect(document.querySelector('img')).not.toBeInTheDocument();
      expect(document.querySelector('script')).not.toBeInTheDocument();
    }
  );
});
