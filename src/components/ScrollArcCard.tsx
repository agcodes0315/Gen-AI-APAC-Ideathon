import React from 'react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';


interface ScrollArcCardProps {
  children: React.ReactNode;

  className?: string;

  index: number;

  direction:
    | 'left'
    | 'right';

  total?: number;
}


/**
 * MirrorTrace feature card.
 *
 * Used on the signed-out landing page feature rows.
 *
 * Important:
 * - DEFAULT export is intentional.
 * - AuthView imports this component using:
 *
 *   import ScrollArcCard from './ScrollArcCard.tsx';
 *
 * - Keeps vertical page scrolling native.
 * - Horizontal row movement is handled by the parent lane.
 * - Adds only lightweight entrance + hover motion.
 */
export default function ScrollArcCard({
  children,
  className = '',
  index,
  direction,
  total = 5,
}: ScrollArcCardProps) {

  const reducedMotion =
    useReducedMotion();


  /*
   * Position each card on a very shallow arc.
   *
   * First/last cards sit slightly lower.
   * Center cards sit slightly higher.
   *
   * This creates the semicircle effect without
   * making vertical scrolling heavy.
   */

  const normalizedPosition =
    total > 1
      ? index / (total - 1)
      : 0.5;


  const centeredPosition =
    normalizedPosition - 0.5;


  const distanceFromCenter =
    Math.abs(
      centeredPosition
    );


  const restingY =
    distanceFromCenter * 18;


  const restingRotate =
    direction === 'left'
      ? centeredPosition * -5
      : centeredPosition * 5;


  /*
   * Entrance direction:
   *
   * top row / left:
   * gently enters from right and settles leftward.
   *
   * bottom row / right:
   * gently enters from left and settles rightward.
   */

  const entryX =
    direction === 'left'
      ? 28
      : -28;


  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity:
                0,

              x:
                entryX,

              y:
                restingY + 18,

              rotate:
                restingRotate * 1.25,
            }
      }

      whileInView={
        reducedMotion
          ? undefined
          : {
              opacity:
                1,

              x:
                0,

              y:
                restingY,

              rotate:
                restingRotate,
            }
      }

      viewport={{
        once:
          true,

        amount:
          0.10,

        margin:
          '100px',
      }}

      whileHover={
        reducedMotion
          ? undefined
          : {
              y:
                restingY - 7,

              rotate:
                0,

              scale:
                1.025,

              zIndex:
                20,
            }
      }

      whileTap={{
        scale:
          0.99,
      }}

      transition={{
        duration:
          0.48,

        ease:
          [
            0.22,
            1,
            0.36,
            1,
          ],
      }}

      className={`
        mirrortrace-arc-card
        mt-glass
        mt-hover-pop
        relative
        shrink-0
        rounded-[26px]
        p-6
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}