import React from 'react';
import { shallow, mount } from 'enzyme';
import Modal from './Modal';
import renderer from 'react-test-renderer';
import styles from 'pages/Profile/Profile.module.scss';

describe('Modal test', () => {
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  const body = document.querySelector('body')!;
  body.appendChild(modalRoot);

  it('Renders without crashing', () => {
    const component = shallow(
      <Modal appendTo={modalRoot} isOpen={false} onClose={() => void 0}>
        Testje
      </Modal>
    );

    component.unmount();
  });

  it('Places the Modal content top/10px left/10px width/100px', () => {
    const component = mount(
      <Modal
        contentHorizontalPosition={10}
        contentVerticalPosition={10}
        contentWidth={100}
        isOpen={true}
        onClose={() => void 0}
        appendTo={modalRoot}
      >
        Testje
      </Modal>
    );
    expect(component.find('[className*="Wrapper"]')).toHaveLength(1);
    expect(component.find('[className*="Wrapper"]').prop('style')).toEqual({
      width: 100,
      left: 10,
      top: 10,
    });

    component.unmount();
  });

  it('Opens and Closes the modal via close callback', () => {
    let isOpen = false;
    let component: any = null;
    const close = jest.fn(() => {
      isOpen = false;
      component.setProps({ isOpen });
    });
    const open = jest.fn(() => {
      isOpen = true;
      component.setProps({ isOpen });
    });
    component = mount(
      <Modal isOpen={isOpen} onClose={close} appendTo={modalRoot}>
        Testje
      </Modal>
    );
    expect(component.find('[className*="Wrapper"]')).toHaveLength(0);
    open();
    expect(component.find('[className*="Wrapper"]')).toHaveLength(1);
    component.childAt(0).simulate('click');
    expect(close).toHaveBeenCalled();
    expect(component.find('[className*="Wrapper"]')).toHaveLength(0);
    open();
    expect(component.find('[className*="Wrapper"]')).toHaveLength(1);
    component.find('[className*="ButtonClose"]').simulate('click');
    expect(close).toHaveBeenCalled();
    expect(component.find('[className*="Wrapper"]')).toHaveLength(0);

    component.unmount();
  });

  it('Does not open the modal content', () => {
    const component = mount(
      <Modal isOpen={false} onClose={() => void 0} appendTo={modalRoot}>
        Testje
      </Modal>
    );
    expect(component.find('[className*="Wrapper"]')).toHaveLength(0);
    component.unmount();

    expect(modalRoot.childNodes.length).toBe(0);
  });

  afterAll(() => {
    modalRoot.remove();
  });
});
