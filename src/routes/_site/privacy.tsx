import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";
import { LEGAL, PRIVACY_SECTIONS } from "@/lib/nlo/legal";

export const Route = createFileRoute("/_site/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Privacy"
      lead="What the hub stores, who sees it, and how to ask us to delete a desk. Card numbers stay with Stripe."
      updated={LEGAL.effective}
      sections={PRIVACY_SECTIONS}
    />
  );
}
