export class CobrowseWidget {
  constructor(licenseKey: string, redactedViews: string[], language?: 'nl');
  startSession: () => void;
  CobrowseIO: {
    redactedViews: string[];
  };
}
