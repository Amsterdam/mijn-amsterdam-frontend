export class CobrowseWidget {
  constructor(opts: {
    licenseKey: string;
    redactedViews: string[];
    language?: 'nl';
    setIsScreensharing: (boolean) => void;
  });
  startSession: () => void;
  CobrowseIO: {
    redactedViews: string[];
  };
}
