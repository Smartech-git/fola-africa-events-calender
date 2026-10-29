import { ReactNode } from "react";

interface LegalLayoutProps {
  children: ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="-mt-sm-header flex flex-col sm:-mt-header">{children}</div>
  );
}
