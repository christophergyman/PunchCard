import { useRef, useState } from 'react';
import { animated } from '@react-spring/three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { PunchShape } from '../types';
import { usePunchAnimation } from '../hooks/usePunchAnimation';

interface PunchHoleProps {
  position: [number, number, number];
  isPunched: boolean;
  shape: PunchShape;
  onClick?: () => void;
  disabled?: boolean;
}

export function PunchHole({ position, isPunched, shape, onClick, disabled }: PunchHoleProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { scale, positionZ } = usePunchAnimation(isPunched);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isPunched && !disabled && onClick) {
      onClick();
    }
  };

  const getGeometry = () => {
    switch (shape) {
      case 'STAR':
        // Use a simple circle for star - could be enhanced with custom geometry
        return <circleGeometry args={[0.12, 5]} />;
      case 'HEART':
        // Use a simple circle for heart - could be enhanced with custom geometry
        return <circleGeometry args={[0.12, 32]} />;
      case 'CUSTOM':
      case 'CIRCLE':
      default:
        return <circleGeometry args={[0.12, 32]} />;
    }
  };

  const baseColor = isPunched ? '#1a1a1a' : hovered && !disabled ? '#4ade80' : '#d1d5db';
  const emissive = hovered && !isPunched && !disabled ? '#22c55e' : '#000000';

  return (
    <animated.mesh
      ref={meshRef}
      position-x={position[0]}
      position-y={position[1]}
      position-z={positionZ.to((z) => position[2] + z)}
      scale={scale}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}
      <meshStandardMaterial
        color={baseColor}
        emissive={emissive}
        emissiveIntensity={0.3}
        roughness={0.5}
        metalness={0.1}
      />
    </animated.mesh>
  );
}
