import { VergunningFrontend, RVVSloterweg } from './config-and-types';
import { forTesting } from './vergunningen-status-steps';

describe('getStatusStepsRVVSloterweg', () => {
  it('should return correct steps for a new request', () => {
    const vergunning = {
      caseType: 'RVV Sloterweg',
      title: 'RVV ontheffing',
      requestType: 'Nieuw',
      dateRequest: '2023-01-01',
      dateWorkflowVerleend: '2023-02-01',
      decision: 'Verleend',
      area: 'Sloterweg-West',
      kentekens: 'AB-123-CD',
      processed: true,
      isExpired: false,
    } as VergunningFrontend<RVVSloterweg>;

    const steps = forTesting.getStatusStepsRVVSloterweg(vergunning);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveProperty('status', 'Ontvangen');
    expect(steps[1]).toHaveProperty('status', 'In behandeling');
    expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
  });

  it('should return correct steps for a change request', () => {
    const vergunning = {
      caseType: 'RVV Sloterweg',
      title: 'RVV ontheffing',
      requestType: 'Wijziging',
      dateRequest: '2023-01-01',
      dateWorkflowVerleend: '2023-02-01',
      decision: 'Verleend',
      area: 'Sloterweg-West',
      kentekens: 'AB-123-CD',
      processed: true,
      isExpired: false,
    } as VergunningFrontend<RVVSloterweg>;

    const steps = forTesting.getStatusStepsRVVSloterweg(vergunning);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveProperty('status', 'Ontvangen');
    expect(steps[1]).toHaveProperty('status', 'In behandeling');
    expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
  });

  it('should return correct steps for an expired request', () => {
    const vergunning = {
      caseType: 'RVV Sloterweg',
      title: 'RVV ontheffing',
      requestType: 'Nieuw',
      dateRequest: '2023-01-01',
      dateWorkflowVerleend: '2023-02-01',
      decision: 'Verleend',
      area: 'Sloterweg-West',
      kentekens: 'AB-123-CD',
      processed: true,
      isExpired: true,
      dateEnd: '2023-03-01',
    } as VergunningFrontend<RVVSloterweg>;

    const steps = forTesting.getStatusStepsRVVSloterweg(vergunning);
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveProperty('status', 'Ontvangen');
    expect(steps[1]).toHaveProperty('status', 'In behandeling');
    expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
    expect(steps[3]).toHaveProperty('status', 'Gewijzigd');
    expect(steps[3]).toHaveProperty(
      'description',
      'Uw RVV ontheffing Sloterweg-West voor kenteken AB-123-CD is verlopen.'
    );
  });

  it('should return correct steps for an ingetrokken request', () => {
    const vergunning = {
      caseType: 'RVV Sloterweg',
      title: 'RVV ontheffing',
      requestType: 'Nieuw',
      dateRequest: '2023-01-01',
      dateWorkflowVerleend: '2023-02-01',
      decision: 'Ingetrokken',
      area: 'Sloterweg-West',
      kentekens: 'AB-123-CD',
      processed: true,
      isExpired: false,
    } as VergunningFrontend<RVVSloterweg>;

    const steps = forTesting.getStatusStepsRVVSloterweg(vergunning);
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveProperty('status', 'Ontvangen');
    expect(steps[1]).toHaveProperty('status', 'In behandeling');
    expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
    expect(steps[3]).toHaveProperty('status', 'Gewijzigd');
    expect(steps[3]).toHaveProperty(
      'description',
      'Wij hebben uw RVV ontheffing Sloterweg-West voor kenteken AB-123-CD ingetrokken. Zie het intrekkingsbesluit voor meer informatie.'
    );
  });

  it('should return correct steps for an updated kenteken request', () => {
    const vergunning = {
      caseType: 'RVV Sloterweg',
      title: 'RVV ontheffing',
      requestType: 'Wijziging',
      dateRequest: '2023-01-01',
      dateWorkflowVerleend: '2023-02-01',
      decision: 'Vervallen',
      area: 'Sloterweg-West',
      kentekens: 'AB-123-CD',
      processed: true,
      isExpired: false,
    } as VergunningFrontend<RVVSloterweg>;

    const steps = forTesting.getStatusStepsRVVSloterweg(vergunning);
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveProperty('status', 'Ontvangen');
    expect(steps[1]).toHaveProperty('status', 'In behandeling');
    expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
    expect(steps[3]).toHaveProperty('status', 'Gewijzigd');
    expect(steps[3]).toHaveProperty(
      'description',
      'U heeft een nieuw kenteken doorgegeven. Bekijk de ontheffing voor het nieuwe kenteken in het overzicht.'
    );
  });
});
