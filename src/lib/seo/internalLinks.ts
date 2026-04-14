import { CalculatorType, calculatorTypes, calculatorMeta, countries } from "@/data/countries";

export interface InternalLink {
  label: string;
  href: string;
}

export const getSameCountryLinks = (countryCode: string, currentCalc?: CalculatorType): InternalLink[] => {
  const country = countries[countryCode];
  if (!country) return [];
  return calculatorTypes
    .filter((c) => c !== currentCalc)
    .map((calc) => ({
      label: `${calculatorMeta[calc].title} ${country.name}`,
      href: `/${countryCode}/${calc}`,
    }));
};

export const getCrossCountryLinks = (currentCountry: string, calcType: CalculatorType): InternalLink[] =>
  Object.values(countries)
    .filter((c) => c.code !== currentCountry)
    .map((c) => ({
      label: `${calculatorMeta[calcType].title} ${c.name}`,
      href: `/${c.code}/${calcType}`,
    }));

export const getAllCalculatorLinks = (): InternalLink[] =>
  Object.values(countries).flatMap((c) =>
    calculatorTypes.map((calc) => ({
      label: `${c.flag} ${calculatorMeta[calc].title} ${c.name}`,
      href: `/${c.code}/${calc}`,
    }))
  );

export const getFooterLinks = () => {
  const sections = Object.values(countries).map((c) => ({
    title: `${c.flag} ${c.name}`,
    links: calculatorTypes.map((calc) => ({
      label: `${calculatorMeta[calc].title}`,
      href: `/${c.code}/${calc}`,
    })),
  }));

  sections.push({
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  });

  return sections;
};
