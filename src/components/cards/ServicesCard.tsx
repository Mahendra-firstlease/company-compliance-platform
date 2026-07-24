import Link from "next/link";
import {
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import Badge from "@/components/ui/Badge/index";

import { Service } from "@/types/services";
import { BadgeCheck, IndianRupee } from "lucide-react";


interface ServiceCardProps {
  service: Service;
}
export default function ServiceCard({
  service: { title, shortDescription, duration, price, slug },
}: ServiceCardProps) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-lg border border-slate-200">
          <BuildingOffice2Icon className="h-7 w-7 text-zinc-300" />
        </div>

        <div className="flex-1">
          <h3 className="mt-1 text-sm font-medium text-slate-800">{title}</h3>

          <p className="mt-2 grow text-sm leading-5 text-slate-600">
            {shortDescription}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap  gap-2 mt-3">
        <Badge icon={<IndianRupee size={12} />} variant="blue">Fee: {price}</Badge>
        <Badge icon={<BadgeCheck size={12} />}  variant="yellow">{duration}</Badge>
        <Badge icon={<BadgeCheck size={12} />} variant="green"> {duration}</Badge>

      </div>
      {/* Divider */}

      <div className="my-4.5 h-px w-full bg-linear-to-r from-slate-100 via-slate-200 to-slate-100" />
      {/* Button */}

      <Link
        href={`/services/${slug}`}
        className="flex items-center gap-1 text-sm text-slate-600 group"
      >
        Apply Now
        <svg
          className="transition-transform duration-300 group-hover:translate-x-1"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.333 8h9.334M8 3.336l4.667 4.667L8 12.669"
            stroke="#45556c"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
