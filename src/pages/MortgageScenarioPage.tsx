import MortgageScenarioTemplate from "@/components/mortgage/MortgageScenarioTemplate";
import { getApprovedMortgageScenarioBySlug } from "@/data/mortgageScenarioPages";
import NotFound from "./NotFound";

interface MortgageScenarioPageProps {
  slug: string;
}

const MortgageScenarioPage = ({ slug }: MortgageScenarioPageProps) => {
  const scenario = getApprovedMortgageScenarioBySlug(slug);

  if (!scenario) return <NotFound />;

  return <MortgageScenarioTemplate scenario={scenario} />;
};

export default MortgageScenarioPage;
