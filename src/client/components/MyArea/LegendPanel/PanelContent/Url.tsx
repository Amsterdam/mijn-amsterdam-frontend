import { Link } from '@amsterdam/design-system-react';

interface UrlProps {
  url: string;
  label?: string;
  urlTitle?: string;
}

export default function Url({ url, urlTitle }: UrlProps) {
  const theUrl =
    url.startsWith('www.') ||
    (!url.startsWith('http') && !url.startsWith('mailto'))
      ? `https://${url}`
      : url;
  return (
    <Link rel="noopener noreferrer" href={theUrl}>
      {urlTitle || url}
    </Link>
  );
}
