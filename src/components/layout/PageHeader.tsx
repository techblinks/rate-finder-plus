import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  liveChip?: string;
}

/**
 * Dark navy hero band used on every desktop inner page (calculators + guides).
 * Hidden on mobile (< md) so existing mobile headers (MobileCalcHeader, page H1)
 * remain untouched. Pair with `md:hidden` versions of the legacy breadcrumb+H1
 * in the consuming page so mobile keeps its original look.
 */
const PageHeader = ({ breadcrumbs, title, subtitle, liveChip }: PageHeaderProps) => (
  <div className="page-header-band hidden md:block">
    <div className="page-header-inner">
      <nav className="page-breadcrumb" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 && <span className="breadcrumb-sep" aria-hidden="true">›</span>}
              {!isLast && crumb.href ? (
                <Link to={crumb.href}>{crumb.label}</Link>
              ) : (
                <span className="breadcrumb-current" aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {liveChip && (
        <div className="page-live-chip">
          <span className="live-dot" aria-hidden="true" />
          <span>{liveChip}</span>
        </div>
      )}

      <h1 className="page-header-title">{title}</h1>
      {subtitle && <p className="page-header-sub">{subtitle}</p>}
    </div>
  </div>
);

export default PageHeader;
