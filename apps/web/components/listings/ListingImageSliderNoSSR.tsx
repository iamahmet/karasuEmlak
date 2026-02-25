"use client";

import dynamic from "next/dynamic";
import type { ListingImageSliderProps } from "./ListingImageSlider";

const ListingImageSliderClientOnly = dynamic<ListingImageSliderProps>(
  () =>
    import("./ListingImageSlider").then((mod) => ({
      default: mod.ListingImageSlider,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[50vh] sm:h-[55vh] min-h-[350px] sm:min-h-[450px] md:min-h-[500px] max-h-[600px] md:max-h-[700px] rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
    ),
  }
);

export function ListingImageSliderNoSSR(props: ListingImageSliderProps) {
  return <ListingImageSliderClientOnly {...props} />;
}
