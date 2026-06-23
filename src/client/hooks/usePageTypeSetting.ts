import { useEffect } from 'react';

import { create } from 'zustand';

type PageTypeSetting = 'listpage' | 'none';
type PageTypeStore = {
  pageType: PageTypeSetting;
  setPageType: (pageType: PageTypeSetting) => void;
};

const usePagetypeSettingStore = create<PageTypeStore>((set) => ({
  pageType: 'none',
  setPageType: (pageType: PageTypeSetting) => set({ pageType }),
}));

export function usePageTypeSetting(pageTypeRequested: PageTypeSetting) {
  const { pageType, setPageType } = usePagetypeSettingStore();

  useEffect(() => {
    setPageType(pageTypeRequested);
    return () => {
      setPageType('none');
    };
  }, [pageTypeRequested, setPageType]);

  return pageType;
}

export function usePageTypeSettingValue() {
  return usePagetypeSettingStore().pageType;
}
