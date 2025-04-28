import { generatePath } from 'react-router';
import { describe, it, expect } from 'vitest';

import {
  getThemaTitleBurgerzaken,
  getThemaTitleBurgerzakenWithAppState,
  getThemaUrlBurgerzakenWithAppState,
} from './helpers';
import { AppRoutes } from '../../../../universal/config/routes';
import { AppState } from '../../../../universal/types/App.types';
import { ThemaTitles } from '../../../config/thema';

describe('helpers', () => {
  describe('getThemaTitleBurgerzaken', () => {
    it('should return BURGERZAKEN when both hasIDKaart and hasPaspoort are true', () => {
      const result = getThemaTitleBurgerzaken(true, true);
      expect(result).toBe(ThemaTitles.BURGERZAKEN);
    });

    it('should return ID-kaart when only hasIDKaart is true', () => {
      const result = getThemaTitleBurgerzaken(true, false);
      expect(result).toBe('ID-kaart');
    });

    it('should return Paspoort when only hasPaspoort is true', () => {
      const result = getThemaTitleBurgerzaken(false, true);
      expect(result).toBe('Paspoort');
    });

    it('should return Paspoort when both hasIDKaart and hasPaspoort are false', () => {
      const result = getThemaTitleBurgerzaken(false, false);
      expect(result).toBe(ThemaTitles.BURGERZAKEN);
    });
  });

  describe('getThemaTitleBurgerzakenWithAppState', () => {
    it('should return BURGERZAKEN when appState has both ID-kaart and Paspoort', () => {
      const appState = {
        BRP: {
          content: {
            identiteitsbewijzen: [
              { documentType: 'europese identiteitskaart', id: '1' },
              { documentType: 'paspoort', id: '2' },
            ],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleBurgerzakenWithAppState(appState);
      expect(result).toBe(ThemaTitles.BURGERZAKEN);
    });

    it('should return ID-kaart when appState has only ID-kaart', () => {
      const appState = {
        BRP: {
          content: {
            identiteitsbewijzen: [
              { documentType: 'europese identiteitskaart', id: '1' },
            ],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleBurgerzakenWithAppState(appState);
      expect(result).toBe('ID-kaart');
    });

    it('should return Paspoort when appState has only Paspoort', () => {
      const appState = {
        BRP: {
          content: {
            identiteitsbewijzen: [{ documentType: 'paspoort', id: '1' }],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleBurgerzakenWithAppState(appState);
      expect(result).toBe('Paspoort');
    });

    it('should return Paspoort when appState has neither ID-kaart nor Paspoort', () => {
      const appState = {
        BRP: {
          content: {
            identiteitsbewijzen: [],
          },
        },
      } as unknown as AppState;
      const result = getThemaTitleBurgerzakenWithAppState(appState);
      expect(result).toBe(ThemaTitles.BURGERZAKEN);
    });
  });

  describe('getThemaUrlBurgerzakenWithAppState', () => {
    it('should return the URL for a single identiteitsbewijs', () => {
      const appState = {
        BRP: {
          content: {
            identiteitsbewijzen: [
              { documentType: 'europese identiteitskaart', id: '1' },
            ],
          },
        },
      } as unknown as AppState;
      const result = getThemaUrlBurgerzakenWithAppState(appState);
      expect(result).toBe(
        generatePath(AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS'], {
          documentType: 'europese identiteitskaart',
          id: '1',
        })
      );
    });

    it('should return the BURGERZAKEN route when there are multiple identiteitsbewijzen', () => {
      const appState = {
        BRP: {
          content: {
            identiteitsbewijzen: [
              { documentType: 'europese identiteitskaart', id: '1' },
              { documentType: 'paspoort', id: '2' },
            ],
          },
        },
      } as unknown as AppState;
      const result = getThemaUrlBurgerzakenWithAppState(appState);
      expect(result).toBe(AppRoutes.BURGERZAKEN);
    });

    it('should return the BURGERZAKEN route when there are no identiteitsbewijzen', () => {
      const appState = {
        BRP: {
          content: {
            identiteitsbewijzen: [],
          },
        },
      } as unknown as AppState;
      const result = getThemaUrlBurgerzakenWithAppState(appState);
      expect(result).toBe(AppRoutes.BURGERZAKEN);
    });
  });
});
