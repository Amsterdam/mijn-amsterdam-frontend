import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

// IE11 Element.closest() polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches =
    (Element.prototype as any).msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s: string) {
    let el = this;

    do {
      if (el.matches(s)) return el;
      (el as any) = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}
