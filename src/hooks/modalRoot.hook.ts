export default function useModalRoot() {
  const modalRootElement = document.getElementById('modal-root');
  if (!modalRootElement) {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.querySelector('body')!.appendChild(modalRoot);
    return modalRoot;
  }
  return modalRootElement;
}
