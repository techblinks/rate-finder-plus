export interface FaqItem {
  question: string;
  answer: string;
}

const TODO = "TODO: Add answer.";

export const FAQS: Record<string, FaqItem[]> = {
  mortgage: [
    { question: "What is the average mortgage repayment in Australia in 2026?", answer: TODO },
    { question: "What is the current RBA cash rate?", answer: TODO },
    { question: "What is the difference between monthly and fortnightly repayments?", answer: TODO },
    { question: "What is LMI?", answer: TODO },
    { question: "Can I make extra repayments on my home loan?", answer: TODO },
  ],
  stampDuty: [
    { question: "How much is stamp duty in NSW?", answer: TODO },
    { question: "Do first home buyers pay stamp duty in Australia?", answer: TODO },
    { question: "When do you pay stamp duty in Australia?", answer: TODO },
  ],
  borrowingPower: [
    { question: "How is borrowing power calculated in Australia?", answer: TODO },
    { question: "What is the APRA serviceability buffer?", answer: TODO },
    { question: "Does my partner's income affect how much I can borrow?", answer: TODO },
    { question: "How do credit card limits affect borrowing capacity?", answer: TODO },
  ],
  extraRepayments: [
    { question: "How do extra repayments reduce my home loan?", answer: TODO },
    { question: "Are extra repayments better than an offset account?", answer: TODO },
    { question: "Are there penalties for extra repayments in Australia?", answer: TODO },
  ],
  lmi: [
    { question: "When do you have to pay LMI?", answer: TODO },
    { question: "How is LMI calculated?", answer: TODO },
    { question: "Can LMI be added to the loan?", answer: TODO },
    { question: "How can I avoid paying LMI?", answer: TODO },
  ],
  loanComparison: [
    { question: "How do I compare two home loans?", answer: TODO },
    { question: "What is the comparison rate?", answer: TODO },
    { question: "Should I choose a lower rate or lower fees?", answer: TODO },
  ],
};
