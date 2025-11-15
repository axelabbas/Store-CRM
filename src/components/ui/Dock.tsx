import React, { useRef, useState } from 'react';

interface DockItem {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

interface DockProps {
    items: DockItem[];
    panelHeight?: number;
    baseItemSize?: number;
    magnification?: number;
}

const Dock: React.FC<DockProps> = ({
    items,
    panelHeight = 68,
    baseItemSize = 50,
    magnification = 70,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    const getItemSize = (index: number) => {
        if (hoveredIndex === null) return baseItemSize;

        const distance = Math.abs(index - hoveredIndex);
        if (distance === 0) return magnification;
        if (distance === 1) return baseItemSize + (magnification - baseItemSize) * 0.5;
        if (distance === 2) return baseItemSize + (magnification - baseItemSize) * 0.25;
        return baseItemSize;
    };

    return (
        <div
            ref={dockRef}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <div
                className="flex items-end gap-2 px-3 py-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl"
                style={{ height: `${panelHeight}px` }}
            >
                {items.map((item, index) => {
                    const size = getItemSize(index);
                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-end transition-all duration-300 ease-out"
                            onMouseEnter={() => setHoveredIndex(index)}
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                            }}
                        >
                            <button
                                onClick={item.onClick}
                                className="w-full h-full flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-200 relative group"
                                aria-label={item.label}
                            >
                                <div className="text-foreground">{item.icon}</div>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-border">
                                        {item.label}
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dock;
