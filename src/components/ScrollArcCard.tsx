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
  total?: number;
}

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
    offset: ['start 95%', 'end 5%'],
  });

  const t = total > 1 ? (index / (total - 1)) * 2 - 1 : 0;

  const archLift = (1 - t * t) * 16;
  const edgeDrop = t * t * 8;
  const baseY =
    direction === 'left' ? -archLift + edgeDrop : archLift - edgeDrop;
  const baseRotate = direction === 'left' ? t * -2.5 : t * 2.5;

  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0, 0, 0] : [baseY + 14, baseY, baseY - 4]
  );

  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0, 0, 0] : [baseRotate * 1.1, baseRotate, baseRotate * 0.7]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.4],
    [0.92, 1, 1]
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
              scale: 1.025,
              y: baseY - 6,
              rotate: 0,
              boxShadow:
                '0 20px 44px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.10) inset',
            }
      }
      whileTap={{ scale: 0.99 }}
      transition={{
        type: 'spring',
        stiffness: 160,
        damping: 24,
        mass: 0.9,
      }}
      className={`mirrortrace-arc-card mt-glass relative shrink-0 rounded-[26px] p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}