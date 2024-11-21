/**
 * Taken from https://github.com/inturn/react-recoil-hooks-testing-library
 * Not imported because of a fixed dependency on a particular react version which isn't updated by maintainers.
 */
import React, { useEffect } from 'react';

import { renderHook } from '@testing-library/react';
import { RecoilRoot, RecoilState, useSetRecoilState } from 'recoil';

interface MockRecoilState {
  recoilState: RecoilState<any>;
  initialValue: any;
}

interface RenderHookOptions {
  states?: MockRecoilState[];
  wrapper?: React.FunctionComponent<any>;
}

function recoilStateWrapper(options?: RenderHookOptions) {
  const StateComponent: React.FC<MockRecoilState> = (
    props: MockRecoilState
  ) => {
    const setState = useSetRecoilState(props.recoilState);
    useEffect(() => {
      setState(props.initialValue);
    }, []);

    return null;
  };

  const renderStateComponents = () => {
    return options?.states?.map((state) => (
      <StateComponent key={state.recoilState.key} {...state} />
    ));
  };

  return (props: { children?: React.ReactNode }) => {
    const renderChildren = options?.wrapper ? (
      <options.wrapper {...props} />
    ) : (
      props.children
    );

    return (
      <RecoilRoot>
        {renderStateComponents()}
        {renderChildren}
      </RecoilRoot>
    );
  };
}

export function renderRecoilHook<P, R>(
  callback: (props: P) => R,
  options?: RenderHookOptions & {
    initialProps?: P;
    wrapper?: React.ComponentType<P> | React.ComponentType;
  }
) {
  const wrapper = recoilStateWrapper({
    states: options?.states,
    wrapper: options?.wrapper,
  });

  const result = renderHook(callback, {
    ...options,
    wrapper,
  });

  return result;
}
