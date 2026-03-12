import type { ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  return (
    <details className="collapse-card" open={defaultOpen}>
      <summary className="collapse-summary">
        <span>{title}</span>
        <span className="collapse-hint">Toggle</span>
      </summary>
      <div className="collapse-body">{children}</div>
    </details>
  );
}
