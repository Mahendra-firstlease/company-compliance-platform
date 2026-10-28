import { Service } from "@/types/services";

export default function DocumentsTab({ service }: { service: Service }) {
  const docs = service.requiredDocuments || [];
  const eligibility = service.eligibility || [];

  return (
    <div className="space-y-6">
      {/* Required Documents Section */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Required Documents for {service.title}
        </h2>
        {docs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {docs.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 text-sm text-slate-700"
              >
                <span className="size-5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-2">
            Standard identity and business registration documents required.
          </p>
        )}
      </div>

      {/* Eligibility Section */}
      {eligibility.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Eligibility Criteria
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
            {eligibility.map((el, idx) => (
              <li key={idx}>{el}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
