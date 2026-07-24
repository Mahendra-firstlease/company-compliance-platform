"use client";

import {
    Controller,
    Control,
    FieldValues,
    Path,
} from "react-hook-form";

import Input from "../Input";
import FormLabel from "../FormLabel";
import FormDescription from "../FormDescription";
import FormError from "../FormError";

interface Props<T extends FieldValues> {
    control: any;
    name: Path<T>;

    label?: string;

    description?: string;

    placeholder?: string;

    required?: boolean;

    disabled?: boolean;
}

export default function InputField<T extends FieldValues>({
    control,
    name,
    label,
    description,
    placeholder,
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

                    <Input
                        {...field}
                        placeholder={placeholder}
                        disabled={disabled}
                    />

                    <FormError
                        message={fieldState.error?.message}
                    />

                </div>
            )}
        />
    );
}