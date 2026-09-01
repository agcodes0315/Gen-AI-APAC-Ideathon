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
 * MirrorTrace landing-page feature card motion.
 *
 * Performance goals:
 * - no useScroll()
 * - no useTransform()
 * - no spring tied to every scroll frame
 * - no semicircular path
 * - no rotation while the page is scrolling
 *
 * The card now performs a small one-time linear entrance when it first
 * enters the viewport. After that it is static, so normal page scrolling
 * remains native and inexpensive.
 *
 * The public props are intentionally unchanged so AuthView.tsx does not
 * need to be rewritten.
 */
export default function ScrollArcCard({
  children,
  className = '',
  index,
  direction,
}: ScrollArcCardProps) {
  const reducedMotion =
    useReducedMotion();

  const initialX =
    direction === 'left'
      ? 22
      : -22;

  const delay =
    Math.min(
      Math.max(
        index,
        0
      ) * 0.035,
      0.14
    );

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              x: initialX,
            }
      }
      whileInView={
        reducedMotion
          ? undefined
          : {
              opacity: 1,
              x: 0,
            }
      }
      viewport={{
        once: true,
        amount: 0.15,
        margin: '0px 0px -8% 0px',
      }}
      transition={{
        duration: 0.34,
        delay,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -3,
            }
      }
      whileTap={{
        scale: 0.99,
      }}
      className={`mirrortrace-arc-card relative shrink-0 ${className}`}
    >
      {children}
    </motion.div>
  );
}
