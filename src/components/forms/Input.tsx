type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
    className,
    ...props
}: InputProps) {
    return (
        <input
            className={`
                w-full
                rounded-lg
                border
                border-gray-300
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary-light
                disabled:bg-gray-100
                ${className}
            `}
            {...props}
        />
    );
}