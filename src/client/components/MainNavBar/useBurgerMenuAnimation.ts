import { useSpring } from 'react-spring';

export function useBurgerMenuAnimation(
  isBurgerMenuVisible: boolean | undefined
) {
  const config = {
    mass: 0.3,
    tension: 400,
  };

  const linkContainerAnim = {
    immediate: isBurgerMenuVisible === undefined,
    reverse: isBurgerMenuVisible,
    left: -400,
    config,
    from: {
      left: 0,
    },
  };

  const backdropAnim = {
    immediate: isBurgerMenuVisible === undefined,
    reverse: isBurgerMenuVisible,
    opacity: 0,
    from: {
      opacity: 1,
    },
  };

  const left: any = {
    immediate: isBurgerMenuVisible !== false,
    reverse: !isBurgerMenuVisible,
    left: 0,
    config,
    from: {
      left: -1000,
    },
  };

  if (!isBurgerMenuVisible) {
    left.delay = 300;
  }

  const linkContainerAnimationProps = useSpring(linkContainerAnim);
  const backdropAnimationProps = useSpring(backdropAnim);
  const leftProps = useSpring(left);

  return {
    linkContainerAnimationProps,
    backdropAnimationProps,
    leftProps,
  };
}
