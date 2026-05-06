import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LOCALES, localeFromPath, type Locale, type LocaleCode } from "@/lib/locale";

interface LocaleCtxValue {
  locale: Locale;
  code: LocaleCode;
}

const LocaleCtx = createContext<LocaleCtxValue | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const value = useMemo<LocaleCtxValue>(() => {
    const code = localeFromPath(pathname);
    return { code, locale: LOCALES[code] };
  }, [pathname]);
  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
};

export function useLocale(): LocaleCtxValue {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
