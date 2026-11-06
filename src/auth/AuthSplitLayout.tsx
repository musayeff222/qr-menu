import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { LandingCms } from "../lib/landingCms";
import { parseLandingCms } from "../lib/landingCms";
import { BrandMark, BrandWordmark } from "../ui/BrandMark";

const DEFAULT_BG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop";

export function AuthSplitLayout({
  children,
  defaultTitle,
  defaultSubtitle,
}: {
  children: React.ReactNode;
  defaultTitle: string;
  defaultSubtitle: string;
}) {
  const [cms, setCms] = useState<LandingCms | null>(null);

  useEffect(() => {
    fetch("/api/public/landing-cms")
      .then((r) => r.json())
      .then((data: unknown) => setCms(parseLandingCms(JSON.stringify(data))))
      .catch(() => setCms(parseLandingCms(null)));
  }, []);

  const img = cms?.auth?.image_url?.trim() || DEFAULT_BG;
  const title = cms?.auth?.title?.trim() || defaultTitle;
  const subtitle = cms?.auth?.subtitle?.trim() || defaultSubtitle;

  return (
    <div className="flex min-h-[100dvh] flex-col-reverse bg-[var(--mg-paper)] lg:min-h-screen lg:flex-row">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative hidden max-h-[min(32vh,280px)] min-h-[120px] shrink-0 overflow-hidden sm:block lg:max-h-none lg:min-h-screen lg:w-[48%] xl:w-[52%]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${img})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[var(--mg-ink)] via-[#0a1720cc] to-[#0a172055]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0dbe9140] via-transparent to-[#10293366]" />
        <div className="relative z-10 flex h-full flex-col justify-end safe-area-pt px-comfort p-5 pb-6 sm:p-8 lg:justify-center lg:px-14 lg:py-16 xl:mr-12 xl:ml-auto xl:max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-white lg:mb-6">
            <BrandMark className="h-10 w-10 sm:h-11 sm:w-11" />
            <BrandWordmark className="text-base font-bold tracking-tight text-white sm:text-lg" />
          </div>
          <h1 className="text-xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-2xl lg:text-4xl xl:text-[2.4rem]">
            {title}
          </h1>
          <p className="mt-2 max-h-[4.5rem] overflow-hidden text-ellipsis text-sm leading-snug text-white/85 line-clamp-3 drop-shadow-md sm:mt-3 sm:max-h-none sm:text-base sm:leading-relaxed lg:mt-4">
            {subtitle}
          </p>
        </div>
      </motion.div>

      <div className="flex min-h-0 flex-1 flex-col items-stretch justify-center bg-[var(--mg-paper)] px-comfort py-6 sm:items-center sm:p-8 lg:p-12 pb-safe">
        <div className="mb-4 flex items-center justify-center gap-2 sm:hidden">
          <BrandMark className="h-9 w-9" />
          <BrandWordmark className="text-lg font-bold text-[var(--mg-ink)]" ink />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="flex w-full max-w-md flex-col justify-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
