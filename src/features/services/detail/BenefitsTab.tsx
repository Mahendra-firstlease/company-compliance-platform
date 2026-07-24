import { CheckCircle2 } from "lucide-react";
import { Service } from "@/types/services";

export default function BenefitsTab({ service }: { service: Service }) {
  const benefits = service.benefits || [];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">
        Key Benefits of {service.title}
      </h3>

      {benefits.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 font-medium">{b}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-4">
          No specific benefits listed for this service.
        </p>
      )}
    </div>
  );
}
