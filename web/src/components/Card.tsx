import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className }: Props) {
  return (
    <div
      className={
        "rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] card-3d " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}


