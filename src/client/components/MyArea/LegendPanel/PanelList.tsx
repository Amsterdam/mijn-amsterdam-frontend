import { themeColor, themeSpacing } from '@amsterdam/asc-ui';
import styled from 'styled-components';

export const PanelListItem = styled.li`
  position: relative;
  border-top: 1px solid ${themeColor('tint', 'level3')};
  > ol > li > ol > li {
    border-top: 0;
  }
  > ol > li {
    margin-left: ${themeSpacing(9)};
  }
`;

export const PanelList = styled.ol<{ indent?: number }>`
  padding: 0;
  list-style-type: none;
  margin: 0;
  padding-left: ${(props) => (props.indent || 0) + 'rem'};
`;
