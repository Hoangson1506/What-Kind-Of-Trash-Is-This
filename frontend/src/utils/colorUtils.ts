export type TrashType = 'food' | 'glass' | 'metal' | 'other' | 'paper' | 'plastic';
export const TRASH_TYPES = [
    'Food', 'Glass', 'Metal', 'Other', 'Paper', 'Plastic'
];

export const colorMap: Record<string, string> = {
    'food': '#FFA500', // orange
    'glass': '#FFFF00', // yellow
    'metal': '#800080', // purple
    'other': '#0000FF', // blue
    'paper': '#FF0000', // red
    'plastic': '#008000', // green
};

// Helper function to convert hex to RGBA
export const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

