import React from 'react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

interface ScrollArcCardProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  direction: 'left' | 'right';
  total?: number;
}

/**
 * Smooth card entrance without scroll-linked transforms.
 * This deliberately avoids useScroll/useTransform because dozens of
 * scroll-linked MotionValues plus translucent cards can make vertical
 * page scrolling feel sticky on Windows/Chrome.
 */
export default function ScrollArcCard({
  children,
  className = '',
  index,
  direction,
  total = 5,
}: ScrollArcCardProps) {
  const reducedMotion = useReducedMotion();

  const normalizedPosition =
    total > 1 ? index / (total - 1) : 0.5;

  const distanceFromCenter =
    Math.abs(normalizedPosition - 0.5);

  const restingY = distanceFromCenter * 10;
  const entryX = direction === 'left' ? -18 : 18;

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              x: entryX,
              y: restingY + 12,
            }
      }
      whileInView={
        reducedMotion
          ? undefined
          : {
              opacity: 1,
              x: 0,
              y: restingY,
            }
      }
      viewport={{
        once: true,
        amount: 0.10,
        margin: '80px',
      }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: restingY - 5,
              scale: 1.018,
            }
      }
      whileTap={{ scale: 0.99 }}
      transition={{
        duration: 0.40,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`mirrortrace-arc-card mt-glass mt-hover-pop relative shrink-0 rounded-[26px] p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
