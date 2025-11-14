import * as React from 'react';
import { cn } from '@/lib/utils';
import { getTextDirection } from '@/lib/textDirection';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const DynamicTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, value, placeholder, ...props }, ref) => {
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
            <textarea
                className={cn(
                    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
DynamicTextarea.displayName = 'DynamicTextarea';

export { DynamicTextarea };
