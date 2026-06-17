import { useEffect } from 'react';
import { create } from 'zustand';

type PageTypeSetting = 'listpage' | 'none';
type PageTypeStore = {
  pageType: PageTypeSetting;
  setPageType: (pageType: PageTypeSetting) => void;
};

export const useMainMenuOpen = create<PageTypeStore>((set) => ({
  pageType: 'none',
  setPageType: (pageType: PageTypeSetting) => set({ pageType }),
}));

export function usePageTypeSetting(pageTypeRequested: PageTypeSetting) {
  const { pageType, setPageType } = useMainMenuOpen();

  useEffect(() => {
    setPageType(pageTypeRequested);
    return () => {
      setPageType('none');
    };
  }, [pageTypeRequested]);

  return pageType;
}

export function usePageTypeSettingValue() {
  return useMainMenuOpen().pageType;
}
