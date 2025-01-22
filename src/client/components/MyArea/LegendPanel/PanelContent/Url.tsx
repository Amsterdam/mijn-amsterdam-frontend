import { Link } from '@amsterdam/design-system-react';

import InfoDetail from '../../../InfoDetail/InfoDetail';

interface UrlProps {
  url: string;
  label?: string;
  urlTitle?: string;
}

export default function Url({
  url,
  urlTitle,
  label = 'Meer informatie',
}: UrlProps) {
  const theUrl =
    url.startsWith('www.') ||
    (!url.startsWith('http') && !url.startsWith('mailto'))
      ? `https://${url}`
      : url;
  return (
    <InfoDetail
      label={label}
      value={
        <Link rel="noopener noreferrer" href={theUrl}>
          {urlTitle || url}
        </Link>
      }
    />
  );
}
