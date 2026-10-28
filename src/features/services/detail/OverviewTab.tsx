import { Service } from "@/types/services";

export default function OverviewTab({ service }: { service: Service }) {
  const description = service.description || service.shortDescription;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">
          About {service.title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-prose">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 block">
            Target Turnaround
          </span>
          <span className="text-sm font-semibold text-slate-900">{service.duration}</span>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 block">
            Fee Structure
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {service.governmentFee
              ? `Govt statutory: ₹${service.governmentFee.toLocaleString("en-IN")} + Professional: ₹${(service.professionalFee || 0).toLocaleString("en-IN")}`
              : `Total Fee: ₹${service.price.toLocaleString("en-IN")}`}
          </span>
        </div>
      </div>

      {service.packageDeliverables && service.packageDeliverables.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Package Deliverables
          </h3>
          <div className="divide-y divide-slate-100">
            {service.packageDeliverables.map((deliverable, idx) => (
              <div
                key={`${deliverable}-${idx}`}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="size-5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-700">
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
