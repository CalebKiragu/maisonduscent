"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: string | null }) {
  const gallery = images.length ? images : ["/images/products/p01.jpg"];
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];

  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row">
      {gallery.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:w-20 sm:flex-col">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-cream-deep transition sm:w-full ${active === index ? "ring-1 ring-ink" : "opacity-65 hover:opacity-100"}`}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="group relative aspect-[4/5] w-full self-start overflow-hidden bg-cream-deep sm:flex-1">
        <Image
          src={current}
          alt={`${name} — image ${active + 1}`}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 55vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        {badge && (
          <span className="absolute left-4 top-4 bg-parchment/95 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-wine backdrop-blur">
            {badge}
          </span>
        )}
        {gallery.length > 1 && (
          <>
            <button
              onClick={() => setActive((active - 1 + gallery.length) % gallery.length)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-parchment/80 text-ink opacity-0 backdrop-blur transition group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((active + 1) % gallery.length)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-parchment/80 text-ink opacity-0 backdrop-blur transition group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
