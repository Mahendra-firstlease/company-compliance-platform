import { CheckCircle2 } from "lucide-react";
import { Service } from "@/types/services";

export default function BenefitsTab({ service }: { service: Service }) {
  const benefits = service.benefits || [];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-900">
        Key Benefits of {service.title}
      </h2>

      {benefits.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 leading-relaxed">{b}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 py-4">
          No specific benefits listed for this service.
        </p>
      )}
    </div>
  );
}
