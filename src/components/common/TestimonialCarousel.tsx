import Image from "next/image";
import { testimonialsData } from "@/data/testimonial.data";
import { Testimonial } from "@/types";
import { Star, BadgeCheck, Quote } from "lucide-react";

export default function TestimonialsCarousel() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {testimonialsData.slice(0, 3).map((card: Testimonial, index: number) => (
          <div
            key={index}
            className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 min-w-0"
          >
            <div>
              {/* Star Rating & Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                </div>
                <Quote size={20} className="text-slate-300" />
              </div>

              {/* Client Quote (14px standard body text) */}
              <p className="text-sm leading-relaxed text-slate-700 font-normal">
                &ldquo;{card.description}&rdquo;
              </p>
            </div>

            {/* Client Profile */}
            <div className="flex items-center gap-3.5 pt-5 mt-6 border-t border-slate-100 min-w-0">
              <Image
                className="size-11 rounded-full object-cover shrink-0 ring-1 ring-slate-200/80"
                src={card.image}
                alt={card.name}
                width={44}
                height={44}
              />
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {card.name}
                  </p>
                  <BadgeCheck size={14} className="text-primary shrink-0" />
                </div>
                <span className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {card.handle}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
