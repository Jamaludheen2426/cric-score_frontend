'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Optional callback once the coin has visibly landed. */
  onLanded?: (result: 'heads' | 'tails') => void;
  /**
   * When this prop transitions to true, the coin is flipped. Goes back
   * to false after the animation finishes (parent doesn't need to reset).
   */
  trigger: number;          // a counter — increment to flip again
  /** Diameter in px (default 96). */
  size?: number;
}

/**
 * Two-face 3D coin. The flip lands on a uniformly random side every time.
 *
 * Implementation: we hold a rotateY value in state. On each new trigger
 * we pick a random side, add 6-10 full extra spins (3600° + n*360°), then
 * animate to that target. The total angle keeps growing so each toss starts
 * smoothly from the previous landing position without snapping.
 */
export function TossCoin({ onLanded, trigger, size = 96 }: Props) {
  const [angle, setAngle] = useState(0);                  // current rotateY in degrees
  const [tossing, setTossing] = useState(false);
  const lastTrigger = useRef(trigger);

  useEffect(() => {
    if (trigger === lastTrigger.current) return;          // initial mount
    lastTrigger.current = trigger;

    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
    const extraSpins = 6 + Math.floor(Math.random() * 5);  // 6..10 full spins
    // Always advance forward to keep direction consistent.
    const targetMod = result === 'heads' ? 0 : 180;
    const currentMod = ((angle % 360) + 360) % 360;
    const delta = ((targetMod - currentMod) + 360) % 360;
    const next = angle + extraSpins * 360 + delta;

    setTossing(true);
    setAngle(next);
    const t = setTimeout(() => {
      setTossing(false);
      onLanded?.(result);
    }, 1600);
    return () => clearTimeout(t);
  }, [trigger, angle, onLanded]);

  return (
    <div className="text-center">
      <div className="coin-stage" style={{ width: size, height: size }}>
        <div
          className={`coin ${tossing ? 'is-tossing' : ''}`}
          style={{ width: size, height: size, transform: `rotateY(${angle}deg)` }}
        >
          <span className="coin-face coin-face-heads">Heads</span>
          <span className="coin-face coin-face-tails">Tails</span>
        </div>
        <div className="coin-shadow" />
      </div>
    </div>
  );
}
