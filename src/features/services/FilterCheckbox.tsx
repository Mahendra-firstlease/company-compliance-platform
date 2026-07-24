import { FilterOption } from "@/types/filter";

interface Props {
  option: FilterOption;

  checked: boolean;

  onChange: () => void;
}

export default function FilterCheckbox({
  option,
  checked,
  onChange,
}: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
      />

      <span className="text-sm text-gray-700">
        {option.label}
      </span>
    </label>
  );
}