import React from 'react';
import { shallow } from 'enzyme';
import Modal from './Modal';

it('Renders without crashing', () => {
  shallow(
    <Modal isOpen={false} onClose={() => void 0}>
      Testje
    </Modal>
  );
});
