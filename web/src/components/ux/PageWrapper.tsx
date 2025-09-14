"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function PageWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}


