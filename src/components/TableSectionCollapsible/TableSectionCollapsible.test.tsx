import React from 'react';
import { shallow } from 'enzyme';
import TableSectionCollapsible from './TableSectionCollapsible';

it('Renders without crashing', () => {
  shallow(
    <TableSectionCollapsible
      isLoading={false}
      items={[]}
      track={{ category: 'test', name: 'Data tabel' }}
      id="testje"
    />
  );
});
