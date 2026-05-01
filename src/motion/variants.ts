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
