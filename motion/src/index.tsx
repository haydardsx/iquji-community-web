import { domAnimation, LazyMotion, MotionConfig, m } from "framer-motion";
import type { ReactNode } from "react";

export const iqujiMotionDuration = {
  control: 0.14,
  overlay: 0.19,
  route: 0.24,
} as const;

export const iqujiMotionEasing = {
  standard: [0.2, 0, 0, 1],
  enter: [0, 0, 0, 1],
  exit: [0.3, 0, 1, 1],
} as const;

export const iqujiMotionPresets = {
  control: {
    duration: iqujiMotionDuration.control,
    ease: iqujiMotionEasing.standard,
  },
  overlay: {
    duration: iqujiMotionDuration.overlay,
    ease: iqujiMotionEasing.enter,
  },
  route: {
    duration: iqujiMotionDuration.route,
    ease: iqujiMotionEasing.enter,
  },
} as const;

export const iqujiMotionVariants = {
  route: {
    initial: { opacity: 1, y: 4 },
    enter: { opacity: 1, y: 0 },
  },
  overlay: {
    initial: { opacity: 0, scale: 0.99 },
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.99 },
  },
  item: {
    initial: { opacity: 0, y: 3 },
    enter: { opacity: 1, y: 0 },
  },
} as const;

export const IqujiMotion: typeof m = m;

export type IqujiMotionProviderProps = {
  children: ReactNode;
};

export function IqujiMotionProvider({ children }: IqujiMotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={iqujiMotionPresets.control}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
