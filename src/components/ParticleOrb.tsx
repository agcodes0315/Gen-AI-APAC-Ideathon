import {
  useMemo,
} from 'react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

interface ParticleOrbProps {
  className?: string;
  size?: number;
  opacity?: number;
  ariaLabel?: string;
}

interface GlobePoint {
  id: string;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  tone: 'frost' | 'cactus' | 'amber' | 'sky';
}

const TONES = {
  frost: '#E8EEF3',
  cactus: '#758467',
  amber: '#D39445',
  sky: '#7EA1C4',
} as const;

function buildGlobePoints(): GlobePoint[] {
  const points: GlobePoint[] = [];

  const latitudeBands = [
    -60,
    -42,
    -24,
    -8,
    8,
    24,
    42,
    60,
  ];

  latitudeBands.forEach((latitude, bandIndex) => {
    const lat =
      (latitude * Math.PI) /
      180;

    const ringRadius =
      Math.cos(lat);

    const vertical =
      Math.sin(lat);

    const pointsInBand =
      bandIndex === 0 ||
      bandIndex ===
        latitudeBands.length -
          1
        ? 10
        : 15;

    for (
      let index = 0;
      index <
      pointsInBand;
      index += 1
    ) {
      const longitude =
        (
          index /
          pointsInBand
        ) *
          Math.PI *
          2 +
        bandIndex *
          0.18;

      const depth =
        Math.cos(
          longitude
        ) *
        ringRadius;

      const x =
        50 +
        Math.sin(
          longitude
        ) *
          ringRadius *
          35;

      const y =
        50 +
        vertical *
          35 +
        depth *
          3.2;

      const depthFactor =
        (
          depth +
          1
        ) /
        2;

      const selector =
        (
          index *
            7 +
          bandIndex *
            3
        ) %
        23;

      const tone:
        GlobePoint['tone'] =
        selector === 0
          ? 'amber'
          : selector === 5
            ? 'cactus'
            : selector === 9
              ? 'sky'
              : 'frost';

      points.push({
        id:
          `lat-${bandIndex}-point-${index}`,
        x,
        y,
        radius:
          0.72 +
          depthFactor *
            1.18,
        opacity:
          0.22 +
          depthFactor *
            0.66,
        tone,
      });
    }
  });

  return points;
}

export default function ParticleOrb({
  className = '',
  size = 440,
  opacity = 0.82,
  ariaLabel = 'Decorative rotating dotted globe',
}: ParticleOrbProps) {
  const reducedMotion =
    useReducedMotion();

  const points =
    useMemo(
      () =>
        buildGlobePoints(),
      []
    );

  return (
    <motion.div
      aria-label={
        ariaLabel
      }
      role="img"
      className={`pointer-events-none select-none ${className}`}
      style={{
        width:
          size,
        height:
          size,
        opacity,
      }}
      animate={
        reducedMotion
          ? undefined
          : {
              y: [
                0,
                -5,
                0,
              ],
              scale: [
                1,
                1.012,
                1,
              ],
            }
      }
      transition={{
        duration:
          9,
        repeat:
          Infinity,
        ease:
          'easeInOut',
      }}
    >
      <div
        className="relative h-full w-full rounded-full"
        style={{
          background:
            'radial-gradient(circle at 38% 32%, rgba(126,161,196,0.10), rgba(117,132,103,0.055) 34%, rgba(9,15,20,0.02) 63%, rgba(9,15,20,0) 74%)',
          border:
            '1px solid rgba(232,238,243,0.16)',
          boxShadow:
            'inset 0 0 70px rgba(126,161,196,0.035), 0 24px 70px rgba(0,0,0,0.10)',
        }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate:
                    360,
                }
          }
          transition={{
            duration:
              38,
            repeat:
              Infinity,
            ease:
              'linear',
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="35.5"
            fill="none"
            stroke="rgba(232,238,243,0.17)"
            strokeWidth="0.48"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="35"
            ry="12.5"
            fill="none"
            stroke="rgba(232,238,243,0.13)"
            strokeWidth="0.42"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="35"
            ry="22"
            fill="none"
            stroke="rgba(117,132,103,0.12)"
            strokeWidth="0.38"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="13.5"
            ry="35"
            fill="none"
            stroke="rgba(126,161,196,0.13)"
            strokeWidth="0.42"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="23"
            ry="35"
            fill="none"
            stroke="rgba(232,238,243,0.09)"
            strokeWidth="0.36"
          />

          {points.map(
            (
              point
            ) => (
              <circle
                key={
                  point.id
                }
                cx={
                  point.x
                }
                cy={
                  point.y
                }
                r={
                  point.radius
                }
                fill={
                  TONES[
                    point.tone
                  ]
                }
                opacity={
                  point.opacity
                }
              />
            )
          )}
        </motion.svg>

        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-[8%] h-[84%] w-[84%]"
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate:
                    -360,
                }
          }
          transition={{
            duration:
              56,
            repeat:
              Infinity,
            ease:
              'linear',
          }}
        >
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="17"
            fill="none"
            stroke="rgba(211,148,69,0.15)"
            strokeWidth="0.34"
            transform="rotate(28 50 50)"
          />

          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="17"
            fill="none"
            stroke="rgba(117,132,103,0.14)"
            strokeWidth="0.34"
            transform="rotate(-34 50 50)"
          />
        </motion.svg>

        <div
          className="absolute inset-[18%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 36% 34%, rgba(232,238,243,0.035), rgba(9,15,20,0.01) 54%, rgba(9,15,20,0) 72%)',
          }}
        />
      </div>
    </motion.div>
  );
}
