export default function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`w-full px-4 md:px-16 lg:px-24 xl:px-32 py-16 ${className}`}>
      {children}
    </section>
  );
}