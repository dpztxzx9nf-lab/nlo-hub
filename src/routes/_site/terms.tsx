import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";
import { LEGAL, TERMS_SECTIONS } from "@/lib/nlo/legal";

export const Route = createFileRoute("/_site/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Terms of use"
      lead="The rules for the desk, the shop, and the world. Short version: be 13 to play, 18 to buy coins or take a cash prize, coins are game money, and conflict outside spawn is the game."
      updated={LEGAL.effective}
      sections={TERMS_SECTIONS}
    />
  );
}
