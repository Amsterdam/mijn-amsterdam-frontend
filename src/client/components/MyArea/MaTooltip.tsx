import React, { Ref } from 'react';

export const MaTooltip = React.forwardRef(
  ({ children }: any, ref: Ref<HTMLDivElement>) => {
    return <div ref={ref}>{children}</div>;
  }
);
MaTooltip.displayName = 'Tooltip';
