export type TrashType = 'food' | 'glass' | 'metal' | 'other' | 'paper' | 'plastic';
export const TRASH_TYPES = [
    'Food', 'Glass', 'Metal', 'Other', 'Paper', 'Plastic'
];

export const colorMap: Record<string, string> = {
    'food': '#27AEB9', // xanh dương đậm
    'paper': '#90EE90', // xanh lá nhạt
    'plastic': '#FFC0CB', // hồng
    'glass': '#00BFFF', // xanh trời
    'metal': '#FFFFFF', // trắng
    'other': '#FF69B4', // hồng đậm
};

export const colorMapTailwind: Record<string, string> = {
    'food': 'bg-cyan-600',
    'paper': 'bg-green-300',
    'plastic': 'bg-pink-200',
    'glass': 'bg-sky-500',
    'metal': 'bg-gray-100',
    'other': 'bg-pink-500',
}

// Helper function to convert hex to RGBA
export const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

