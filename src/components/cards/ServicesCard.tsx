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
    <div className="group rounded-lg border border-primary-border/30 bg-background p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-lg border border-primary-border/30 bg-background">
          <BuildingOffice2Icon className="h-7 w-7 text-primary/70" />
        </div>

        <div className="flex-1">
          <h3 className="mt-1 text-sm font-medium text-foreground">{title}</h3>

          <p className="mt-2 grow text-sm leading-5 text-primary-border/80">
            {shortDescription}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge icon={<IndianRupee size={12} />} variant="blue">Fee: {price}</Badge>
        <Badge icon={<BadgeCheck size={12} />} variant="yellow">{duration}</Badge>
        <Badge icon={<BadgeCheck size={12} />} variant="green"> {duration}</Badge>
      </div>
      {/* Divider */}

      <div className="my-4.5 h-px w-full bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />
      {/* Button */}

      <Link
        href={`/services/${slug}`}
        className="group flex items-center gap-1 text-sm text-primary-border/80"
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
            stroke="var(--primary-border)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
