export interface PlayfieldBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function makeBounds(width: number, height: number, padding = 0): PlayfieldBounds {
  const halfW = width / 2;
  const halfH = height / 2;
  return {
    left: -halfW - padding,
    right: halfW + padding,
    top: halfH + padding,
    bottom: -halfH - padding,
  };
}

export function isOutside(x: number, y: number, b: PlayfieldBounds): boolean {
  return x < b.left || x > b.right || y < b.bottom || y > b.top;
}
