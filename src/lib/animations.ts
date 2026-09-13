import type { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0, ease: "easeIn" } }
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -5, transition: { duration: 0, ease: "easeIn" } }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0, ease: "easeIn" } }
};

export const hoverElevation: Variants = {
  whileHover: { y: -2, transition: { duration: 0.15, ease: "easeOut" } }
};
