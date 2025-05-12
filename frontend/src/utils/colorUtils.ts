export type TrashType = 'food' | 'glass' | 'metal' | 'other' | 'paper' | 'plastic';
export const TRASH_TYPES = [
    'Food', 'Glass', 'Metal', 'Other', 'Paper', 'Plastic'
];

export const colorMap: Record<string, string> = {
    'food': '#27AEB9', // xanh dương đậm
    'paper': '#90EE90', // xanh lá nhạt
    'battery': '#FFC0CB', // hồng
    'glass': '#00BFFF', // xanh trời
    'metal': '#FFFFFF', // trắng
    'other': '#FF69B4', // hồng đậm
};

// Helper function to convert hex to RGBA
export const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

