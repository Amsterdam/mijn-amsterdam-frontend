import React from 'react';
import Linkd from '../../Button/Button';
import InfoDetail from '../../InfoDetail/InfoDetail';

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
  const theUrl = url.startsWith('www.') ? `https://${url}` : url;
  return (
    <InfoDetail
      label={label}
      value={
        <Linkd icon={null} external={true} href={theUrl}>
          {urlTitle || url}
        </Linkd>
      }
    />
  );
}
