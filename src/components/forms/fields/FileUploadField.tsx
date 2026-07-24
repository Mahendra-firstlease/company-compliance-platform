"use client";

import { Controller, FieldValues, Path } from "react-hook-form";
import FileUpload, { UploadedFile } from "../FileUpload";
import FormLabel from "../FormLabel";
import FormDescription from "../FormDescription";

interface Props<T extends FieldValues> {
    control: any;
    name: Path<T>;
    label?: string;
    description?: string;
    onView?: (file: UploadedFile) => void;
    allowedTypes?: string[];
    maxSizeMb?: number;
    required?: boolean;
    disabled?: boolean;
}

export default function FileUploadField<T extends FieldValues>({
    control,
    name,
    label,
    description,
    onView,
    allowedTypes,
    maxSizeMb,
    required,
    disabled,
}: Props<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
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

                    <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        onView={onView && field.value ? () => onView(field.value) : undefined}
                        allowedTypes={allowedTypes}
                        maxSizeMb={maxSizeMb}
                        disabled={disabled}
                        error={fieldState.error?.message}
                    />
                </div>
            )}
        />
    );
}
