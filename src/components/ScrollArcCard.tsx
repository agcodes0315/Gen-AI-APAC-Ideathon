import React from 'react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

interface ScrollArcCardProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right';
  index?: number;
}

export default function ScrollArcCard({
  children,
  className = '',
  direction = 'left',
  index = 0,
}: ScrollArcCardProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <article className={`${className} mirrortrace-arc-card`}>
        {children}
      </article>
    );
  }

  const sign = direction === 'left' ? -1 : 1;
  const delay = Math.min(index * 0.035, 0.14);

  return (
    <motion.article
      initial={{
        opacity: 0,
        x: sign * 30,
        y: 24,
        rotate: sign * 2.4,
        scale: 0.985,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.14,
        margin: '0px 0px -6% 0px',
      }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 105,
        damping: 22,
        mass: 0.72,
      }}
      whileHover={{
        y: -4,
        scale: 1.004,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 26,
          mass: 0.6,
        },
      }}
      style={{
        transformOrigin: direction === 'left' ? '72% 100%' : '28% 100%',
      }}
      className={`${className} mirrortrace-arc-card`}
    >
      {children}
    </motion.article>
  );
}
