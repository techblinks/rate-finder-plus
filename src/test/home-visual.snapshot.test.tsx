/**
 * Visual regression snapshot for the homepage.
 *
 * Snapshots the serialized DOM of Home at mobile (375px) and desktop (1280px)
 * viewports. Tailwind responsive classes live in markup, so any change to
 * spacing utilities (py-*, mb-*, gap-*), typography classes, or hero/section
 * structure will produce a snapshot diff and force a deliberate review.
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Home from "@/pages/Home";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    }),
  },
}));

const setViewport = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  window.matchMedia = (query: string) => {
    const m = /max-width:\s*(\d+)/.exec(query);
    const min = /min-width:\s*(\d+)/.exec(query);
    const matches = m
      ? width <= Number(m[1])
      : min
      ? width >= Number(min[1])
      : false;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
};

const renderHome = () =>
  render(
    <HelmetProvider>
      <BrowserRouter>
        <LocaleProvider>
          <Home />
        </LocaleProvider>
      </BrowserRouter>
    </HelmetProvider>,
  );

describe("Home visual regression", () => {
  beforeAll(() => {
    // Stable timestamps / random not needed; Home is deterministic.
  });

  it("matches mobile (375px) snapshot", () => {
    setViewport(375);
    const { container, unmount } = renderHome();
    expect(container.firstChild).toMatchSnapshot();
    unmount();
  });

  it("matches desktop (1280px) snapshot", () => {
    setViewport(1280);
    const { container, unmount } = renderHome();
    expect(container.firstChild).toMatchSnapshot();
    unmount();
  });
});
