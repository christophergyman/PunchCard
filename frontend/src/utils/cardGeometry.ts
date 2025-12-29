import * as THREE from 'three';

export const CARD_DIMENSIONS = {
  width: 3.5,
  height: 2,
  depth: 0.05,
  cornerRadius: 0.1,
  punchRadius: 0.12,
};

export function generatePunchGrid(totalSlots: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];

  // Calculate grid dimensions
  const cols = Math.min(5, totalSlots);
  const rows = Math.ceil(totalSlots / cols);

  // Calculate spacing
  const horizontalSpacing = (CARD_DIMENSIONS.width - 0.8) / (cols + 1);
  const verticalSpacing = (CARD_DIMENSIONS.height - 0.6) / (rows + 1);

  // Starting positions (centered)
  const startX = -CARD_DIMENSIONS.width / 2 + 0.4 + horizontalSpacing;
  const startY = CARD_DIMENSIONS.height / 2 - 0.5 - verticalSpacing;

  for (let i = 0; i < totalSlots; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = startX + col * horizontalSpacing;
    const y = startY - row * verticalSpacing;
    const z = CARD_DIMENSIONS.depth / 2 + 0.001;

    positions.push(new THREE.Vector3(x, y, z));
  }

  return positions;
}

export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}
