import { renderHook } from '@testing-library/react-hooks';
import { useParams } from 'react-router-dom';

import { useVarenDetailPage } from './useVarenDetailPage.hook';
import {
  exploitatieVergunningWijzigenLink,
  ligplaatsVergunningLink,
} from './Varen-thema-config';
import { isLoading, isError } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

jest.mock('../../hooks/useAppState');
jest.mock('./Varen-thema-config');
jest.mock('../../../universal/helpers/api');

describe('useVarenDetailPage', () => {
  it('should return loading state', () => {
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: { status: 'LOADING' },
    });
    (isLoading as jest.Mock).mockReturnValue(true);
    (isError as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useVarenDetailPage());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should return error state', () => {
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: { status: 'ERROR' },
    });
    (isLoading as jest.Mock).mockReturnValue(false);
    (isError as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useVarenDetailPage());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it('should return no vergunning', () => {
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: { status: 'OK', content: [] },
    });
    (isLoading as jest.Mock).mockReturnValue(false);
    (isError as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useVarenDetailPage());
    expect(result.current.vergunning).toBeNull();
    expect(result.current.buttonItems).toHaveLength(0);
  });

  it('should return a valid vergunning and buttons', () => {
    const vergunning = {
      id: '1',
      caseType: 'Varen vergunning',
      processed: true,
      decision: 'Verleend',
      key: 'test-key',
    };

    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: { status: 'OK', content: [vergunning] },
    });
    (isLoading as jest.Mock).mockReturnValue(false);
    (isError as jest.Mock).mockReturnValue(false);
    (exploitatieVergunningWijzigenLink as jest.Mock).mockReturnValue({
      to: 'https://example.com/wijzigen',
      title: 'Wijzigen',
    });
    (ligplaatsVergunningLink as jest.Mock).mockReturnValue({
      to: 'https://example.com/ligplaats',
      title: 'Ligplaats',
    });

    const { result } = renderHook(() => useVarenDetailPage());
    expect(result.current.vergunning).toEqual(vergunning);
    expect(result.current.buttonItems).toHaveLength(2);
    expect(result.current.buttonItems[0]).toHaveProperty(
      'to',
      'https://example.com/wijzigen'
    );
    expect(result.current.buttonItems[1]).toHaveProperty(
      'to',
      'https://example.com/ligplaats'
    );
  });
});
