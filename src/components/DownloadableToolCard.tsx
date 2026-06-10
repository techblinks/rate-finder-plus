import { Link } from "react-router-dom";
import {
  getDownloadableToolCta,
  isDownloadAvailable,
  type DownloadableToolConfig,
} from "@/data/downloadableTools";

const formatLabel: Record<DownloadableToolConfig["format"], string> = {
  spreadsheet: "Spreadsheet",
  pdf: "PDF",
  checklist: "Checklist",
  planner: "Planner",
};

const statusLabel: Record<DownloadableToolConfig["status"], string> = {
  coming_soon: "Coming soon",
  draft: "Draft",
  available: "Available",
};

interface DownloadableToolCardProps {
  tool: DownloadableToolConfig;
}

const badgeClass =
  "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none";

const DownloadableToolCard = ({ tool }: DownloadableToolCardProps) => {
  const downloadReady = isDownloadAvailable(tool);
  const primaryRelatedLink = tool.relatedCalculatorLinks[0];

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${badgeClass} bg-[#EEF4FF] text-[#003680]`}>
          {formatLabel[tool.format]}
        </span>
        <span
          className={`${badgeClass} ${
            downloadReady ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {statusLabel[tool.status]}
        </span>
      </div>

      <h4 className="mt-3 text-[15px] font-semibold text-foreground">{tool.title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.shortDescription}</p>
      <p className="mt-3 text-[12px] leading-5 text-slate-500">{tool.audience}</p>

      <div className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-[12px] leading-5 text-slate-600">
        {tool.useCase}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {downloadReady ? (
          <a
            href={tool.downloadUrl}
            download
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#003680] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#00285F]"
          >
            {getDownloadableToolCta(tool)}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed"
          >
            {getDownloadableToolCta(tool)}
          </button>
        )}

        {primaryRelatedLink && (
          <Link
            to={primaryRelatedLink.to}
            className="text-sm font-semibold text-[#003680] underline-offset-4 hover:underline"
          >
            {primaryRelatedLink.label}
          </Link>
        )}
      </div>
    </article>
  );
};

export default DownloadableToolCard;
