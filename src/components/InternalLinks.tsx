import { Link } from "react-router-dom";
import { countries, calculatorTypes, calculatorMeta, CalculatorType } from "@/data/countries";
import { citiesByCountry } from "@/data/cities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";

interface InternalLinksProps {
  currentCountry: string;
  currentCalc?: CalculatorType;
}

const InternalLinks = ({ currentCountry, currentCalc }: InternalLinksProps) => {
  const country = countries[currentCountry];
  if (!country) return null;

  const otherCalcs = calculatorTypes.filter((c) => c !== currentCalc);
  const otherCountries = Object.values(countries).filter((c) => c.code !== currentCountry);
  const cities = citiesByCountry[currentCountry] || [];

  return (
    <section className="mt-12 space-y-8">
      {/* Other calculators same country */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          More {country.name} Calculators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherCalcs.map((calc) => (
            <Link key={calc} to={`/${currentCountry}/${calc}`}>
              <Card className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {calculatorMeta[calc].title}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{calculatorMeta[calc].description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Same calculator, other countries */}
      {currentCalc && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            {calculatorMeta[currentCalc].title} — Other Countries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherCountries.map((c) => (
              <Link key={c.code} to={`/${c.code}/${currentCalc}`}>
                <Card className="hover:shadow-md transition-shadow group">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-lg">{c.flag}</span>
                      {c.name} {calculatorMeta[currentCalc].shortTitle} Calculator
                      <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* City links */}
      {currentCalc && cities.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {calculatorMeta[currentCalc].title} by City in {country.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link
                key={city.slug}
                to={`/${currentCountry}/${currentCalc}-${city.slug}`}
                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default InternalLinks;
