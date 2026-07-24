import { Service } from "@/types/services";

export default function DocumentsTab({ service }: { service: Service }) {
  const docs = service.requiredDocuments || [];
  const eligibility = service.eligibility || [];

  return (
    <div className="space-y-6">
      {/* Required Documents Section */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">
          Required Documents for {service.title}
        </h3>
        {docs.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5">
            {docs.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm font-medium text-gray-700"
              >
                <span className="size-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-2">
            Standard identity and business registration documents required.
          </p>
        )}
      </div>

      {/* Eligibility Section */}
      {eligibility.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Eligibility Criteria
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            {eligibility.map((el, idx) => (
              <li key={idx}>{el}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
