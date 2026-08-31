import React, { useRef } from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

interface ScrollArcCardProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  direction: 'left' | 'right';
  total?: number;
}

/**
 * MirrorTrace feature-card motion.
 *
 * Behaviour:
 * - Cards remain square and laid out horizontally by the existing row.
 * - Top row (`direction="left"`) drifts left while the page scrolls.
 * - Bottom row (`direction="right"`) drifts right while the page scrolls.
 * - Each card follows a shallow semicircular arc rather than a flat line.
 * - Spring smoothing removes the harsh / stop-start motion.
 *
 * This component intentionally keeps the same public props as the existing
 * ScrollArcCard so AuthView does not need to be rewritten.
 */
export default function ScrollArcCard({
  children,
  className = '',
  index,
  direction,
  total = 5,
}: ScrollArcCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 0.92', 'end 0.08'],
  });

  /*
   * Smooth the raw scroll value.
   * This is the part that removes the jerky / "hard gesture" feeling.
   */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 24,
    mass: 0.38,
    restDelta: 0.001,
  });

  /*
   * Give cards a very small stagger based on their index.
   * It keeps the row feeling like one moving ribbon rather than a stack
   * of identical blocks moving at exactly the same instant.
   */
  const centeredIndex =
    total > 1
      ? index - (total - 1) / 2
      : 0;

  const rowTravel = direction === 'left' ? -150 : 150;
  const initialOffset = centeredIndex * 7;

  const x = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [
      initialOffset,
      rowTravel * 0.48 + initialOffset,
      rowTravel + initialOffset,
    ],
  );

  /*
   * Shallow semicircle:
   * card starts slightly lower -> rises at the middle -> settles lower.
   * The bottom row mirrors the curve very slightly so both rows feel
   * related without looking mechanically identical.
   */
  const arcPeak =
    direction === 'left'
      ? -22
      : -18;

  const y = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [20, arcPeak, 18],
  );

  const rotate = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    direction === 'left'
      ? [3.4, 0, -3.4]
      : [-3.4, 0, 3.4],
  );

  const opacity = useTransform(
    smoothProgress,
    [0, 0.12, 0.88, 1],
    [0.82, 1, 1, 0.9],
  );

  return (
    <motion.article
      ref={cardRef}
      style={
        reducedMotion
          ? undefined
          : {
              x,
              y,
              rotate,
              opacity,
            }
      }
      whileHover={
        reducedMotion
          ? undefined
          : {
              scale: 1.035,
              y: -8,
              rotate: 0,
              zIndex: 20,
            }
      }
      whileTap={{
        scale: reducedMotion ? 1 : 0.99,
      }}
      transition={{
        type: 'spring',
        stiffness: 190,
        damping: 22,
        mass: 0.45,
      }}
      className={[
        'mirrortrace-arc-card',
        'mt-glass',
        'mt-hover-pop',
        className,
      ].join(' ')}
    >
      {children}
    </motion.article>
  );
}
