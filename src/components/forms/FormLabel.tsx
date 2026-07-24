type Props = {

    children: React.ReactNode;

    required?: boolean;
};

export default function FormLabel({
    children,
    required = false
}: Props) {

    return (

        <label className="mb-2 block text-sm font-medium">

            {children}

            {required && (

                <span className="text-red-500 ml-1">

                    *

                </span>

            )}

        </label>

    );

}