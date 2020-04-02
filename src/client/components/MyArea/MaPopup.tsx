import React, { Ref } from 'react';

export const MaPopup = React.forwardRef(
  ({ children }: any, ref: Ref<HTMLDivElement>) => {
    return <div ref={ref}>{children}</div>;
  }
);
MaPopup.displayName = 'Popup';
