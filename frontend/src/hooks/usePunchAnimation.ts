import { useSpring, config } from '@react-spring/three';

export function usePunchAnimation(isPunched: boolean) {
  const { scale, positionZ } = useSpring({
    scale: isPunched ? 0 : 1,
    positionZ: isPunched ? -0.02 : 0,
    config: { ...config.wobbly, tension: 300, friction: 20 },
  });

  return { scale, positionZ };
}
