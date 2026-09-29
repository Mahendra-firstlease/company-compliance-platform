import { Service } from "@/types/services";

export default function OverviewTab({ service }: { service: Service }) {
  const description = service.description || service.shortDescription;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-900">
          About {service.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200/60 space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Target Duration
          </span>
          <span className="text-sm font-bold text-gray-900">{service.duration}</span>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200/60 space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Pricing Breakdown
          </span>
          <span className="text-sm font-bold text-primary">
            {service.governmentFee ? `Govt: ₹${service.governmentFee} + Prof: ₹${service.professionalFee || 0}` : `Total Fee: ₹${service.price}`}
          </span>
        </div>
      </div>

      {service.packageDeliverables && service.packageDeliverables.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            Package Deliverables
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {service.packageDeliverables.map((deliverable, idx) => (
              <div
                key={`${deliverable}-${idx}`}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700 font-medium">
                  {deliverable}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
