import { useRef } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import type { Group } from 'three';
import type { PunchCard } from '../types';
import { PunchHole } from './PunchHole';
import { generatePunchGrid, CARD_DIMENSIONS, hexToThreeColor } from '../utils/cardGeometry';

interface PunchCard3DProps {
  card: PunchCard;
  onPunch?: (position: number) => void;
  disabled?: boolean;
}

export function PunchCard3D({ card, onPunch, disabled }: PunchCard3DProps) {
  const groupRef = useRef<Group>(null);

  // Generate punch hole positions in a grid
  const punchPositions = generatePunchGrid(card.totalSlots);

  // Determine which positions are punched
  const punchedPositions = new Set(card.punches.map((p) => p.position));

  const bgColor = hexToThreeColor(card.cardStyle.backgroundColor);
  const textColor = card.cardStyle.textColor;

  return (
    <group ref={groupRef}>
      {/* Card base */}
      <RoundedBox
        args={[CARD_DIMENSIONS.width, CARD_DIMENSIONS.height, CARD_DIMENSIONS.depth]}
        radius={CARD_DIMENSIONS.cornerRadius}
        smoothness={4}
      >
        <meshStandardMaterial
          color={bgColor}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Title text */}
      <Text
        position={[0, 0.75, CARD_DIMENSIONS.depth / 2 + 0.01]}
        fontSize={0.18}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={CARD_DIMENSIONS.width - 0.4}
      >
        {card.title}
      </Text>

      {/* Reward text */}
      <Text
        position={[0, -0.8, CARD_DIMENSIONS.depth / 2 + 0.01]}
        fontSize={0.1}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={CARD_DIMENSIONS.width - 0.4}
      >
        {card.reward}
      </Text>

      {/* Progress indicator */}
      <Text
        position={[CARD_DIMENSIONS.width / 2 - 0.3, 0.75, CARD_DIMENSIONS.depth / 2 + 0.01]}
        fontSize={0.12}
        color={textColor}
        anchorX="right"
        anchorY="middle"
      >
        {card.currentPunches}/{card.totalSlots}
      </Text>

      {/* Punch holes */}
      {punchPositions.map((pos, i) => {
        const slotNumber = i + 1; // 1-based position
        const isPunched = punchedPositions.has(slotNumber);

        return (
          <PunchHole
            key={i}
            position={[pos.x, pos.y, pos.z]}
            isPunched={isPunched}
            shape={card.cardStyle.punchShape}
            onClick={() => onPunch?.(slotNumber)}
            disabled={disabled || isPunched}
          />
        );
      })}
    </group>
  );
}
