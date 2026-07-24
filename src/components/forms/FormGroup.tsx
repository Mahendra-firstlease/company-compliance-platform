import FormLabel from "./FormLabel";
import FormDescription from "./FormDescription";
import FormError from "./FormError";
interface FormGroupProps {
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}

export default function FormGroup({
  label,
  required,
  description,
  error,
  children,
}: FormGroupProps) {
  return (
    <div className="space-y-2">
      {label && (
        <FormLabel required={required}>
          {label}
        </FormLabel>
      )}

      {description && (
        <FormDescription>
          {description}
        </FormDescription>
      )}

      {children}

      <FormError message={error} />
    </div>
  );
}