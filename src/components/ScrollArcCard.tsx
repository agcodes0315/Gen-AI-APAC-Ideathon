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

  const restingY = distanceFromCenter * 12;
  const entryX = direction === 'left' ? -20 : 20;

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              x: entryX,
              y: restingY + 14,
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
        amount: 0.12,
        margin: '90px',
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
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`mirrortrace-arc-card mt-glass relative shrink-0 rounded-[26px] p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
