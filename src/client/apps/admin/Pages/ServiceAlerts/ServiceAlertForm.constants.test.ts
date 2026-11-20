import {
  isServiceAlertThemaID,
  SERVICE_ALERT_THEMA_IDS,
} from '../../../bob/config/service-alert-themas.ts';
import { serviceAlertThemas } from './ServiceAlertForm.constants.ts';

describe('serviceAlertThemas', () => {
  it('offers every thema that can show alerts exactly once', () => {
    const values = serviceAlertThemas.map(({ value }) => value);

    expect(new Set(values).size).toBe(values.length);
    expect(values.toSorted()).toEqual([...SERVICE_ALERT_THEMA_IDS].toSorted());
  });

  it.each(['BELASTINGEN', 'SVWI', 'MILIEUZONE', 'OVERTREDINGEN', 'SUBSIDIES'])(
    'does not offer the external-only thema %s',
    (themaId) => {
      expect(isServiceAlertThemaID(themaId)).toBe(false);
      expect(serviceAlertThemas.map(({ value }) => value)).not.toContain(
        themaId
      );
    }
  );
});
