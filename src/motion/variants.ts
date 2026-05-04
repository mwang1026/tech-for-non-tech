import type { Variants } from 'framer-motion'

export const easeOut: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 4 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeOut } },
  exit:  { opacity: 0, y: -4, transition: { duration: 0.2, ease: easeOut } },
}

export const crossFade: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.24, ease: easeOut } },
  exit:  { opacity: 0, transition: { duration: 0.16, ease: easeOut } },
}

export const diagramReveal: Variants = {
  hidden: { opacity: 0, scale: 0.985 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.32, ease: easeOut } },
  exit:  { opacity: 0, transition: { duration: 0.2, ease: easeOut } },
}

export const staggerChildren: Variants = {
  shown: { transition: { staggerChildren: 0.03 } },
}

/** Repeated pulse for an arrow that's "asking, asking, asking" (polling). */
export const pulseRepeat: Variants = {
  pulse: {
    opacity: [0.25, 1, 0.25],
    transition: { duration: 1.1, ease: easeOut, repeat: Infinity },
  },
}

/** Single sharp ping for a one-time event arrival (webhook). */
export const pulseOnce: Variants = {
  pulse: {
    opacity: [0.2, 1, 0.85],
    transition: { duration: 0.7, ease: easeOut },
  },
}
