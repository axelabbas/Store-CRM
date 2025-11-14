import * as React from 'react';
import { cn } from '@/lib/utils';
import { getTextDirection } from '@/lib/textDirection';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const DynamicInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, value, placeholder, ...props }, ref) => {
        const [direction, setDirection] = React.useState<'ltr' | 'rtl' | 'auto'>('auto');

        React.useEffect(() => {
            // Check value first, then placeholder if value is empty
            if (value && typeof value === 'string') {
                setDirection(getTextDirection(value));
            } else if (placeholder && typeof placeholder === 'string') {
                setDirection(getTextDirection(placeholder));
            } else {
                setDirection('rtl'); // Default to RTL for Arabic UI
            }
        }, [value, placeholder]);

        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                ref={ref}
                value={value}
                placeholder={placeholder}
                dir={direction}
                {...props}
            />
        );
    }
);
DynamicInput.displayName = 'DynamicInput';

export { DynamicInput };
