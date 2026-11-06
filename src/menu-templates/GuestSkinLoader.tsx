import React, { Suspense } from "react";
import type { GuestSkinProps } from "./guestSkinContract";
import { remapLegacyTemplateId } from "./legacyRemap";
import { DEFAULT_SKIN_ID, getSkinMeta } from "./skinCatalog";
import { SKIN_LOADERS } from "./skinRegistry";

export function GuestSkinLoader(props: GuestSkinProps) {
  const id = remapLegacyTemplateId(props.template?.id || DEFAULT_SKIN_ID);
  const Loader = SKIN_LOADERS[id] || SKIN_LOADERS[DEFAULT_SKIN_ID];
  const meta = getSkinMeta(id);
  const tpl = props.template.id === id ? props.template : { ...props.template, id: meta.id, name: meta.name };
  const fallback = (
    <div className="grid min-h-dvh place-items-center bg-[#f7faf8] text-sm text-slate-500">Menyu yüklənir…</div>
  );
  if (!Loader) return fallback;
  return (
    <Suspense fallback={fallback}>
      <Loader {...props} template={tpl} />
    </Suspense>
  );
}
