import ServiceCard from "@/components/cards/ServicesCard";
import { Service } from "@/types/services";

export default function ProductGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
        />
      ))}
    </div>
  );
}