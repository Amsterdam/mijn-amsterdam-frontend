import { renderHook } from '@testing-library/react-hooks';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { isLoading, isError } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

jest.mock('../../hooks/useAppState');
jest.mock('../../components/Table/TableV2');
jest.mock('../../../universal/helpers/api');

describe('useVarenThemaData', () => {
  it('should return loading state', () => {
    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: { status: 'LOADING' },
    });
    (isLoading as jest.Mock).mockReturnValue(true);
    (isError as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useVarenThemaData());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should return error state', () => {
    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: { status: 'ERROR' },
    });
    (isLoading as jest.Mock).mockReturnValue(false);
    (isError as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useVarenThemaData());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it('should return no registration', () => {
    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: { status: 'OK', content: [] },
    });
    (isLoading as jest.Mock).mockReturnValue(false);
    (isError as jest.Mock).mockReturnValue(false);
    (addLinkElementToProperty as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useVarenThemaData());
    expect(result.current.varenRederRegistratie).toBeUndefined();
    expect(result.current.varenVergunningen).toHaveLength(0);
  });

  it('should return registration and vergunningen', () => {
    const varenRederRegistratie = {
      caseType: 'Varen registratie reder',
      company: 'Test Company',
    };
    const vergunningen = [
      { caseType: 'Varen vergunning', vesselName: 'Test Vessel' },
    ];

    (useAppStateGetter as jest.Mock).mockReturnValue({
      VAREN: {
        status: 'OK',
        content: [varenRederRegistratie, ...vergunningen],
      },
    });
    (isLoading as jest.Mock).mockReturnValue(false);
    (isError as jest.Mock).mockReturnValue(false);
    (addLinkElementToProperty as jest.Mock).mockReturnValue(vergunningen);

    const { result } = renderHook(() => useVarenThemaData());
    expect(result.current.varenRederRegistratie).toEqual(varenRederRegistratie);
    expect(result.current.varenVergunningen).toEqual(vergunningen);
  });
});
