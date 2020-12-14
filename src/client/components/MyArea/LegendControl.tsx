import { MapLayers } from '@amsterdam/asc-assets';
import { Button, themeColor } from '@amsterdam/asc-ui';
import styled from 'styled-components';
import React from 'react';

const Control = styled.div`
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.1);
  pointer-events: all;
`;

const StyledButton = styled(Button)<{ isActive: boolean }>`
  min-width: inherit;
  background-color: ${(props) =>
    props.isActive
      ? themeColor('tint', 'level3')
      : themeColor('tint', 'level1')};
  color: ${themeColor('tint', 'level7')};
`;

export interface LegendControlProps {
  showDesktopVariant: boolean;
  onClick: () => void;
  isActive: boolean;
}

const LegendControl: React.FC<LegendControlProps> = ({
  showDesktopVariant,
  onClick,
  isActive,
}) => {
  const iconProps = showDesktopVariant
    ? { iconLeft: <MapLayers /> }
    : { icon: <MapLayers />, size: 46 };

  return (
    <Control>
      <StyledButton
        type="button"
        variant="blank"
        title="Legenda"
        iconSize={20}
        isActive={isActive}
        onClick={onClick}
        {...iconProps}
      >
        Legenda
      </StyledButton>
    </Control>
  );
};

export default LegendControl;
