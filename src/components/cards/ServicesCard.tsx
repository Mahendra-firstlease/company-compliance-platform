import Link from "next/link";
import {
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import Badge from "@/components/ui/Badge/index";
import { Service } from "@/types/services";
import { BadgeCheck, Clock, IndianRupee } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({
  service: { title, shortDescription, duration, price, slug },
}: ServiceCardProps) {
  return (
    <Link
      href={`/services/${slug}`}
      className="group block rounded-xl border border-slate-200/90 bg-white p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-primary transition-colors group-hover:bg-primary-light/50">
          <BuildingOffice2Icon className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
            {shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge icon={<IndianRupee size={12} />} variant="blue">
          ₹{price}
        </Badge>
        <Badge icon={<Clock size={12} />} variant="yellow">
          {duration}
        </Badge>
        <Badge icon={<BadgeCheck size={12} />} variant="green">
          Verified Service
        </Badge>
      </div>

      {/* Clean border divider (No AI cyan gradient) */}
      <div className="my-4 h-px w-full bg-slate-100" />

      {/* Footer CTA */}
      <div className="flex items-center justify-between text-xs font-semibold text-primary">
        <span>Apply Now</span>
        <svg
          className="transition-transform duration-200 group-hover:translate-x-1"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.333 8h9.334M8 3.336l4.667 4.667L8 12.669"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
