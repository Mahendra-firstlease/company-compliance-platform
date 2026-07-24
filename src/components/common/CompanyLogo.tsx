import Image from "next/image";
import {cn} from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const logoVariants = cva("", {
  variants: {
    variant: {
      header: "h-8 w-auto",
      footer: "h-12 w-auto",
      sidebar: "h-10 w-auto",
      mobile: "h-8 w-auto",
    },
  },
  defaultVariants: {
    variant: "header",
  },
});

type CompanyLogoProps = VariantProps<typeof logoVariants> & {
  className?: string;
  priority: boolean;
};

export default function CompanyLogo({
  variant,
  className,
  priority=false,
}: CompanyLogoProps) {
  const companyName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Company";
  return (
    <div className="flex items-center">
      <Image
        src="/company-logo/logo-sm.svg"
        alt={companyName}
        width={32}
        height={32}
        priority={priority}
        className={cn("block lg:hidden", logoVariants({ variant }),className)}
      />
      <Image
        // className={`hidden h-8 w-auto lg:block ${className}`}
        src="/company-logo/logo-lg.svg"
        alt={companyName}
        width={180}
        height={40}
        priority={priority}
        className={cn("hidden lg:block",logoVariants({variant}),className)}

      />
    </div>
  );
}
