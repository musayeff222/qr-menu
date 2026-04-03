import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { QrCode } from "lucide-react";
import type { LandingCms } from "../lib/landingCms";
import { parseLandingCms } from "../lib/landingCms";

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative lg:w-[48%] xl:w-[52%] min-h-[220px] lg:min-h-screen overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${img})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/35 backdrop-blur-[2px] lg:backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/35 via-transparent to-fuchsia-600/25" />
        <div className="relative z-10 flex flex-col justify-end lg:justify-center h-full p-8 sm:p-12 lg:px-14 lg:py-16 max-w-xl mx-auto lg:mx-0 lg:ml-auto lg:mr-12">
          <div className="flex items-center gap-2 text-white/90 mb-4 lg:mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
              <QrCode size={24} />
            </span>
            <span className="font-bold text-lg tracking-tight">QRMenu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.4rem] font-extrabold text-white leading-tight drop-shadow-lg">
            {title}
          </h1>
          <p className="mt-3 lg:mt-4 text-sm sm:text-base text-white/85 leading-relaxed max-w-md drop-shadow-md">
            {subtitle}
          </p>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-gradient-to-b from-slate-900 to-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
