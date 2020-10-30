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
  return (
    <InfoDetail
      label={label}
      value={
        <Linkd external={true} href={url}>
          {urlTitle || url}
        </Linkd>
      }
    />
  );
}
