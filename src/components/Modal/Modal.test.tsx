import React from 'react';
import { shallow, mount } from 'enzyme';
import { Dialog } from './Modal';

describe('Modal test', () => {
  window.scrollTo = jest.fn();

  it('Renders without crashing', () => {
    const component = shallow(
      <Dialog isOpen={false} onClose={() => void 0}>
        Testje
      </Dialog>
    );

    component.unmount();
  });

  it('Places the Modal content top/10px left/10px width/100px', () => {
    const component = mount(
      <Dialog
        contentHorizontalPosition={10}
        contentVerticalPosition={10}
        contentWidth={100}
        isOpen={true}
        onClose={() => void 0}
      >
        Testje
      </Dialog>
    );
    expect(component.find('[className*="Dialog"]')).toHaveLength(1);
    expect(component.find('[className*="Dialog"]').prop('style')).toEqual({
      width: '100%',
      maxWidth: 100,
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
      <Dialog isOpen={isOpen} onClose={close}>
        Testje
      </Dialog>
    );

    expect(component.find('.Dialog')).toHaveLength(0);
    open();
    expect(component.find('.Dialog')).toHaveLength(1);
    component.find('.Modal').simulate('click');
    expect(close).toHaveBeenCalled();
    expect(component.find('.Dialog')).toHaveLength(0);
    open();
    expect(component.find('.Dialog')).toHaveLength(1);
    component.find('button.ButtonClose').simulate('click');
    expect(close).toHaveBeenCalled();
    expect(component.find('.Dialog')).toHaveLength(0);

    component.unmount();
  });

  it('Does not open the modal content', () => {
    const component = mount(
      <Dialog isOpen={false} onClose={() => void 0}>
        Testje
      </Dialog>
    );
    expect(component.find('.Dialog')).toHaveLength(0);
    component.unmount();

    expect(document.getElementById('modal-root')!.childNodes.length).toBe(0);
  });
});
