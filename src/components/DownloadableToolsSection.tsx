import DownloadableToolCard from "@/components/DownloadableToolCard";
import { DOWNLOADABLE_TOOLS } from "@/data/downloadableTools";

const DownloadableToolsSection = () => (
  <div className="overflow-hidden rounded-3xl border border-[#C7D7FE] bg-gradient-to-br from-[#F8FBFF] via-white to-[#EEF4FF] shadow-sm">
    <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_320px] md:p-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#003680]">
          Downloadable planning tools
        </p>
        <h3 className="mt-2 text-[22px] font-semibold tracking-tight text-foreground">
          Free mortgage planning tools are being prepared
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
          Free planning tools are being prepared for Australian home buyers. You'll be able to
          save, compare, and review mortgage scenarios without creating new indexed download pages.
          General information only, not financial advice.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {DOWNLOADABLE_TOOLS.map((tool) => (
            <DownloadableToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-[#BFD3FF] bg-[#003680] p-5 text-white">
        <h4 className="text-[18px] font-semibold">Get notified when downloads are ready</h4>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Email capture is prepared as a safe shell only. Notifications are not active yet, so this
          form does not collect, send, or store your email.
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Download notification form shell"
        >
          <label htmlFor="mortgage-download-email" className="block text-xs font-semibold text-white/80">
            Email address
          </label>
          <input
            id="mortgage-download-email"
            type="email"
            autoComplete="email"
            disabled
            placeholder="Downloads waitlist not active yet"
            className="h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/45 disabled:cursor-not-allowed disabled:opacity-80"
          />
          <button
            type="submit"
            disabled
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#003680] opacity-70 disabled:cursor-not-allowed"
          >
            Get notified soon
          </button>
        </form>
        <p className="mt-3 text-[12px] leading-5 text-white/65">
          No login required. No fake downloads. No email is stored until a safe waitlist backend is
          explicitly added.
        </p>
      </aside>
    </div>
  </div>
);

export default DownloadableToolsSection;
