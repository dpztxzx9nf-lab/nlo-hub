import type { ReactNode } from "react";
import { PageFrame, Panel } from "@/components/page-frame";
import type { LegalSection } from "@/lib/nlo/legal";

export function LegalDoc({
  eyebrow,
  title,
  lead,
  updated,
  children,
  sections,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  updated: string;
  children?: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <PageFrame eyebrow={eyebrow} title={title} lead={lead}>
      <p className="mb-6 font-mono text-xs text-muted">Effective {updated}</p>
      {children}
      <div className="grid gap-4">
        {sections.map((section) => (
          <Panel key={section.title}>
            <h2 className="text-2xl">{section.title}</h2>
            {section.body?.map((p) => (
              <p key={p} className="mt-3 text-sm text-muted">
                {p}
              </p>
            ))}
            {section.items ? (
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                {section.items.map((item) => (
                  <li key={item} className="border-l-2 border-accent/60 pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>
        ))}
      </div>
    </PageFrame>
  );
}
