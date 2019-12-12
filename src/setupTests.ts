import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Warnings about code wrappend in act( ... ): https://github.com/testing-library/react-testing-library/issues/281
// this is just a little hack to silence a warning that we'll get until react
// fixes this: https://github.com/facebook/react/pull/14853
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

configure({ adapter: new Adapter() });
