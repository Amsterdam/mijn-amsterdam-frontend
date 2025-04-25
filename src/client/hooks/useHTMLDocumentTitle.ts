import { useEffect } from 'react';

export function useHTMLDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
