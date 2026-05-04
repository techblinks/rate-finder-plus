import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  current: string;
}

const Breadcrumb = ({ current }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-muted-foreground">
    <ol className="flex flex-wrap items-center gap-1">
      <li>
        <Link to="/" className="link-accent">Home</Link>
      </li>
      <li className="flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        <span aria-current="page" className="text-foreground">{current}</span>
      </li>
    </ol>
  </nav>
);

export default Breadcrumb;
