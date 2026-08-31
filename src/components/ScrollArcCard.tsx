import React, {
  useRef,
} from 'react';

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
 * Scroll-linked landing-page card.
 *
 * IMPORTANT:
 * - This component changes MOTION ONLY.
 * - It does not change the sign-in page background, video, colors,
 *   typography, spacing, or card styling.
 *
 * direction="left":
 *   top row travels left while the page scrolls down.
 *
 * direction="right":
 *   bottom row travels right while the page scrolls down.
 *
 * A small vertical curve + rotation creates the semicircular motion.
 */
export default function ScrollArcCard({
  children,
  className = '',
  index,
  direction,
  total = 5,
}: ScrollArcCardProps) {
  const ref =
    useRef<HTMLDivElement>(
      null
    );

  const reducedMotion =
    useReducedMotion();

  const {
    scrollYProgress,
  } =
    useScroll({
      target:
        ref,

      offset: [
        'start 92%',
        'end 12%',
      ],
    });

  const normalized =
    total > 1
      ? index /
        (total - 1)
      : 0.5;

  const centered =
    normalized -
    0.5;

  /*
   * All cards in a row travel in the same horizontal direction.
   * The small per-card offset keeps the row from looking rigid.
   */
  const travel =
    direction ===
    'left'
      ? -150
      : 150;

  const startOffset =
    direction ===
    'left'
      ? 48 +
        centered * 24
      : -48 -
        centered * 24;

  const endOffset =
    travel +
    centered * 28;

  /*
   * Semicircular vertical path:
   * enter low -> rise through middle -> settle low.
   */
  const arcHeight =
    30 +
    Math.abs(
      centered
    ) *
      14;

  const rawX =
    useTransform(
      scrollYProgress,
      [
        0,
        0.5,
        1,
      ],
      reducedMotion
        ? [
            0,
            0,
            0,
          ]
        : [
            startOffset,
            travel * 0.48,
            endOffset,
          ]
    );

  const rawY =
    useTransform(
      scrollYProgress,
      [
        0,
        0.5,
        1,
      ],
      reducedMotion
        ? [
            0,
            0,
            0,
          ]
        : [
            arcHeight,
            -arcHeight,
            arcHeight * 0.32,
          ]
    );

  const rotationAmount =
    direction ===
    'left'
      ? -4
      : 4;

  const rawRotate =
    useTransform(
      scrollYProgress,
      [
        0,
        0.5,
        1,
      ],
      reducedMotion
        ? [
            0,
            0,
            0,
          ]
        : [
            -rotationAmount,
            0,
            rotationAmount,
          ]
    );

  /*
   * Springs remove the hard/laggy feeling caused by directly binding
   * every visible card to raw scroll values.
   */
  const x =
    useSpring(
      rawX,
      {
        stiffness:
          110,

        damping:
          24,

        mass:
          0.42,

        restDelta:
          0.2,
      }
    );

  const y =
    useSpring(
      rawY,
      {
        stiffness:
          110,

        damping:
          24,

        mass:
          0.42,

        restDelta:
          0.2,
      }
    );

  const rotate =
    useSpring(
      rawRotate,
      {
        stiffness:
          115,

        damping:
          25,

        mass:
          0.4,

        restDelta:
          0.1,
      }
    );

  return (
    <motion.div
      ref={
        ref
      }
      style={
        reducedMotion
          ? undefined
          : {
              x,
              y,
              rotate,
              willChange:
                'transform',
            }
      }
      whileHover={
        reducedMotion
          ? undefined
          : {
              scale:
                1.025,

              y:
                -7,

              rotate:
                0,

              zIndex:
                20,
            }
      }
      whileTap={{
        scale:
          0.985,
      }}
      transition={{
        scale: {
          duration:
            0.18,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        },
      }}
      className={`mirrortrace-arc-card relative shrink-0 ${className}`}
    >
      {children}
    </motion.div>
  );
}
