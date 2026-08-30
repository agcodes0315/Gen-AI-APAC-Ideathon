import React, { useRef } from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

interface ScrollArcCardProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  direction: 'left' | 'right';
  /** Total cards in this row — used to place this card along the arc. */
  total?: number;
}

/**
 * Arranges a row of cards along a semicircle as the page scrolls.
 *
 * direction="left"  -> the row's arc opens upward-left (top feature row):
 *                       the leftmost cards sit highest, the row bows
 *                       downward toward the right edge.
 * direction="right" -> mirrored (bottom feature row): the arc opens
 *                       upward-right, bowing downward toward the left.
 *
 * Each card also gets a spring "pop" on hover — scale up, flatten its
 * rotation, lift with a heavier shadow — matching the highlight seen
 * in the reference recording.
 */
export default function ScrollArcCard({
  children,
  className = '',
  index,
  direction,
  total = 5,
}: ScrollArcCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Normalize this card's position within its row to -1 (first) .. 1 (last).
  const t = total > 1 ? (index / (total - 1)) * 2 - 1 : 0;

  // Semicircle shape: cards near the row's center sit higher (closer to
  // the top of the arc); cards near the edges drop lower.
  const archLift = (1 - t * t) * 34; // px — peak lift at the row's center
  const edgeDrop = t * t * 18; // px — extra drop at the edges

  const baseY =
    direction === 'left' ? -archLift + edgeDrop : archLift - edgeDrop;

  const baseRotate = direction === 'left' ? t * -6 : t * 6;

  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0, 0, 0] : [baseY + 46, baseY, baseY - 10]
  );

  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion
      ? [0, 0, 0]
      : [baseRotate * 1.6, baseRotate, baseRotate * 0.6]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.28, 0.5],
    [0, 1, 1]
  );

  return (
    <motion.div
      ref={ref}
      style={
        reducedMotion
          ? undefined
          : {
              y,
              rotate,
              opacity,
            }
      }
      whileHover={
        reducedMotion
          ? undefined
          : {
              scale: 1.06,
              y: baseY - 14,
              rotate: 0,
              zIndex: 20,
              boxShadow:
                '0 30px 64px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.12) inset',
            }
      }
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 22,
      }}
      className={`mirrortrace-arc-card mt-glass mt-glass-plain relative shrink-0 rounded-[26px] p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
