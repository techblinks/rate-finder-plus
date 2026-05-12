import type { DirectAnswerItem } from "@/components/seo/DirectAnswers";

/**
 * Conversational Q&A blocks for AI extraction. Keyed by guide slug.
 * Add new entries when a guide topic warrants direct-answer surfacing.
 */
export const GUIDE_DIRECT_ANSWERS: Record<string, DirectAnswerItem[]> = {
  "stamp-duty-australia-2026": [
    {
      q: "How much is stamp duty in Australia?",
      a: "Stamp duty in Australia ranges from roughly 3% to 5.5% of the property purchase price depending on the state. On a $700,000 property, stamp duty is approximately $26,235 in NSW, $37,070 in VIC and $17,325 in QLD. Eligible first home buyers may pay $0 in many states.",
    },
    {
      q: "Do first home buyers pay stamp duty?",
      a: "Most first home buyers pay reduced or zero stamp duty under each state's threshold. NSW: $0 up to $800,000. VIC: $0 up to $600,000. QLD: $0 up to $500,000. WA: $0 up to $430,000. SA: $0 up to $650,000. ACT: $0 for eligible buyers (income-tested). TAS: 50% concession.",
    },
    {
      q: "When do you pay stamp duty?",
      a: "Stamp duty is typically paid within 30 days of signing the Contract of Sale in most Australian states; in NSW it must be paid within 3 months. Your conveyancer arranges payment.",
    },
    {
      q: "Is stamp duty tax deductible?",
      a: "Stamp duty is not tax deductible for owner-occupied properties. For investment properties, stamp duty is added to the cost base and may reduce capital gains tax when you sell, but is not immediately deductible.",
    },
  ],
  "what-is-lmi": [
    {
      q: "How much does Lender's Mortgage Insurance cost?",
      a: "On a $700,000 property with a 10% deposit ($70,000), LMI typically costs $14,000–$19,000 depending on the lender and insurer. LMI is avoided entirely with a 20% deposit ($140,000).",
    },
    {
      q: "Who pays LMI — the borrower or the lender?",
      a: "The borrower pays LMI but it protects the lender, not you. Most Australian lenders allow LMI to be capitalised into the loan rather than paid upfront.",
    },
    {
      q: "How can I avoid paying LMI?",
      a: "The main way to avoid LMI is a 20% deposit (LVR ≤ 80%). Alternatives include the First Home Guarantee, family guarantor loans, and lender-specific LMI waivers for medical, legal and accounting professionals.",
    },
  ],
  "borrowing-power-australia": [
    {
      q: "How much can I borrow on $100,000 salary?",
      a: "On a $100,000 salary with $3,500/month in expenses, most Australian lenders will lend approximately $480,000–$560,000 using APRA's 3% serviceability buffer at current rates (~6.39%).",
    },
    {
      q: "What is the APRA serviceability buffer?",
      a: "Since October 2021 APRA requires lenders to assess loan repayments at the loan rate plus a 3% buffer (APG 223). At a 6.39% loan rate, lenders test serviceability at 9.39%.",
    },
    {
      q: "Does HECS/HELP debt affect my borrowing power?",
      a: "Yes. Lenders treat HECS/HELP repayments as ongoing liabilities. A $40,000 HECS balance on a $90,000 salary typically reduces borrowing capacity by $35,000–$55,000.",
    },
  ],
  "first-home-buyer-grants-2026": [
    {
      q: "What is the First Home Owner Grant in Australia?",
      a: "The First Home Owner Grant (FHOG) is a one-off state-funded payment for eligible first home buyers, typically $10,000–$30,000 depending on the state and whether the home is new or established. It is separate from stamp duty concessions.",
    },
    {
      q: "Which states pay the highest First Home Owner Grant?",
      a: "QLD pays $30,000 for new homes (no price cap), TAS pays $30,000 for new homes, SA pays $15,000, NT and WA pay $10,000. NSW and VIC do not pay an FHOG but offer stamp duty concessions instead.",
    },
    {
      q: "Can I get both the First Home Owner Grant and stamp duty exemption?",
      a: "Yes — in most states they are separate schemes. For example a QLD first home buyer purchasing a new $500,000 home can receive the $30,000 grant and pay $0 stamp duty.",
    },
  ],
};
