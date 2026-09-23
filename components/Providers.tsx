"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Honor the OS "reduce motion" setting for every Motion animation on the site.
export default function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
