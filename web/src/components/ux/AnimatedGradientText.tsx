import { ReactNode } from "react";

export default function AnimatedGradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`animated-gradient-text ${className}`}>{children}</span>
  );
}


