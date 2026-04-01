import React from "react";

/** Populated by App with merged remote + built-in UI strings. */
export const I18nBundleContext = React.createContext<Record<string, Record<string, string>>>(
  {}
);

export function useI18nBundle() {
  return React.useContext(I18nBundleContext);
}
