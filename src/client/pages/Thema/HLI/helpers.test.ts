import { describe, it, expect } from 'vitest';

import { getThemaTitle, getThemaTitleWithAppState } from './helpers';
import { AppState } from '../../../../universal/types/App.types';
import { ThemaTitles } from '../../../config/thema';

describe('helpers', () => {
  describe('getThemaTitle', () => {
    it('should return default (HLI) when both hasRegelingen and hasStadspas are true', () => {
      const result = getThemaTitle(true, true);
      expect(result).toBe(ThemaTitles.HLI);
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
      expect(result).toBe(ThemaTitles.HLI);
    });
  });

  describe('getThemaTitleWithAppState', () => {
    it('should return Default (HLI) when appState has both Regelingen and Stadspas', () => {
      const appState = {
        HLI: {
          content: {
            stadspas: [{ id: '' }],
            regelingen: [{ displayStatus: '' }],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleWithAppState(appState);
      expect(result).toBe(ThemaTitles.HLI);
    });

    it('should return Stadspas when appState has only Stadspas', () => {
      const appState = {
        HLI: {
          content: {
            stadspas: [{ id: '' }],
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
            stadspas: [],
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
      expect(result).toBe(ThemaTitles.HLI);
    });
  });
});
