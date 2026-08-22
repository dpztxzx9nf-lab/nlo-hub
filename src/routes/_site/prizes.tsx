import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";
import { Button } from "@/components/ui/button";
import { LEGAL, PRIZE_SECTIONS } from "@/lib/nlo/legal";

export const Route = createFileRoute("/_site/prizes")({
  component: PrizesPage,
});

function PrizesPage() {
  return (
    <LegalDoc
      eyebrow="Season One"
      title="Official prize rules"
      lead={`Skill contest. No purchase necessary. Close ${LEGAL.close}. These rules control the $50, $20, and clan coin prizes.`}
      updated={LEGAL.effective}
      sections={PRIZE_SECTIONS}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/season">Season page</Link>
        </Button>
        <Button variant="stone" asChild>
          <Link to="/terms">Terms</Link>
        </Button>
      </div>
    </LegalDoc>
  );
}
