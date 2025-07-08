import { describe, it, expect } from 'vitest';

import { getThemaTitle, getThemaTitleWithAppState } from './helpers.ts';
import { themaTitle } from './HLI-thema-config.ts';
import { AppState } from '../../../../universal/types/App.types.ts';

describe('helpers', () => {
  describe('getThemaTitle', () => {
    it('should return default (HLI) when both hasRegelingen and hasStadspas are true', () => {
      const result = getThemaTitle(true, true);
      expect(result).toBe(themaTitle);
    });

    it('should return Stadspas when only hasStadspas is true', () => {
      const result = getThemaTitle(true, false);
      expect(result).toBe('Stadspas');
    });

    it('should return Regelingen when only hasRegelingen is true', () => {
      const result = getThemaTitle(false, true);
      expect(result).toBe('Regelingen bij laag inkomen');
    });

    it('should return default (HLI) when both hasStadspas and hasRegelingen are false', () => {
      const result = getThemaTitle(false, false);
      expect(result).toBe(themaTitle);
    });
  });

  describe('getThemaTitleWithAppState', () => {
    it('should return Default (HLI) when appState has both Regelingen and Stadspas', () => {
      const appState = {
        HLI: {
          content: {
            stadspas: { stadspassen: [{ id: '' }] },
            regelingen: [{ displayStatus: '' }],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleWithAppState(appState);
      expect(result).toBe(themaTitle);
    });

    it('should return Stadspas when appState has only Stadspas', () => {
      const appState = {
        HLI: {
          content: {
            stadspas: { stadspassen: [{ id: '' }] },
            regelingen: [],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleWithAppState(appState);
      expect(result).toBe('Stadspas');
    });

    it('should return Regelingen when appState has only Regelingen', () => {
      const appState = {
        HLI: {
          content: {
            stadspas: { stadspassen: [] },
            regelingen: [{ displayStatus: '' }],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleWithAppState(appState);
      expect(result).toBe('Regelingen bij laag inkomen');
    });

    it('should return Default (HLI) when appState has neither Regelingen and Stadspas', () => {
      const appState = {
        HLI: {
          content: {
            stadspas: null,
            regelingen: [],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleWithAppState(appState);
      expect(result).toBe(themaTitle);
    });
  });
});
