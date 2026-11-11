import { serviceAlertInput } from './service-alerts.types.ts';

const validInput = {
  title: 'Testmelding',
  body: 'Testbericht',
  displayLocation: 'dashboard',
  environment: 'test',
  dateStart: '2026-11-11T09:00:00.000Z',
  dateEnd: '2026-11-11T10:00:00.000Z',
};

describe('serviceAlertInput environment', () => {
  it('accepts one environment', () => {
    expect(serviceAlertInput.safeParse(validInput).success).toBe(true);
  });

  it.each(['unknown', undefined])(
    'rejects invalid environment %s',
    (environment) => {
      expect(
        serviceAlertInput.safeParse({ ...validInput, environment }).success
      ).toBe(false);
    }
  );

  it('rejects the obsolete environments array', () => {
    const { environment: _environment, ...inputWithoutEnvironment } =
      validInput;

    expect(
      serviceAlertInput.safeParse({
        ...inputWithoutEnvironment,
        environments: ['test', 'prod'],
      }).success
    ).toBe(false);
  });
});
