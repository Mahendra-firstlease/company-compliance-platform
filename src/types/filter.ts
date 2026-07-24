export interface FilterOption {
  label: string;
  value: string;
  checked?: boolean;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
}