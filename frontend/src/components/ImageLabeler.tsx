import React, { useState, useRef, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { colorMap, TRASH_TYPES, hexToRgba } from '../utils/colorUtils';

interface ImageLabelerProps {
    imageUrl: string;
    onSave: (labels: LabelData[]) => void;
    onCancel: () => void;
}

export interface LabelData {
    trashType: string;
    bbox: [number, number, number, number]; // [x, y, width, height]
}

const ImageLabeler: React.FC<ImageLabelerProps> = ({ imageUrl, onSave, onCancel }) => {
    const [labels, setLabels] = useState<LabelData[]>([]);
    const [currentLabel, setCurrentLabel] = useState<Partial<LabelData> | null>(null);
    const [selectedType, setSelectedType] = useState(TRASH_TYPES[0]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const image = imageRef.current;
        const canvas = canvasRef.current;
        if (!image || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas 2D context');
            return;
        }

        image.onerror = () => {
            console.error('Failed to load image');
        };

        image.onload = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            drawLabels();
        };

        if (image.complete) {
            image.onload(new Event('load'));
        }

        return () => {
            image.onload = null;
            image.onerror = null;
        };
    }, [labels]);

    const drawLabels = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || !imageRef.current) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

        // Draw existing labels
        labels.forEach((label) => {
            const [x, y, width, height] = label.bbox;
            // Map the trashType to a color (convert to lowercase to match colorMap keys)
            const trashTypeKey = label.trashType.toLowerCase();
            const hexColor = colorMap[trashTypeKey] || '#00ff00'; // Fallback to green if not found
            ctx.strokeStyle = hexColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Draw label text background with semi-transparent color
            ctx.fillStyle = hexToRgba(hexColor, 0.3);
            ctx.fillRect(x, y - 20, Math.min(100, width), 20);
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.fillText(label.trashType, x + 5, y - 5);
        });

        // Draw current label if exists
        if (currentLabel && startPos && currentLabel.bbox) {
            const [x, y, width, height] = currentLabel.bbox;
            // Use the selected type for the current label
            const trashTypeKey = selectedType.toLowerCase();
            const hexColor = colorMap[trashTypeKey] || '#ff0000'; // Fallback to red if not found
            ctx.strokeStyle = hexColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(startPos.x, startPos.y, width, height);

            ctx.fillStyle = hexToRgba(hexColor, 0.2);
            ctx.fillRect(startPos.x, startPos.y, width, height);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentLabel({ trashType: selectedType, bbox: [x, y, 0, 0] }); // Initialize with zero width/height
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPos || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const width = x - startPos.x;
        const height = y - startPos.y;

        setCurrentLabel({
            trashType: selectedType,
            bbox: [startPos.x, startPos.y, width, height],
        });

        drawLabels();
    };

    const handleMouseUp = () => {
        if (!currentLabel || !startPos) return;

        const [x, y, width, height] = currentLabel.bbox!;
        const normalizedBbox: [number, number, number, number] = [
            Math.min(startPos.x, startPos.x + width), // Top-left x
            Math.min(startPos.y, startPos.y + height), // Top-left y
            Math.abs(width), // Positive width
            Math.abs(height), // Positive height
        ];

        setLabels([...labels, { trashType: selectedType, bbox: normalizedBbox }]);
        setCurrentLabel(null);
        setIsDrawing(false);
        setStartPos(null);
        drawLabels();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Label Image</h3>
                <div className="space-x-2">
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-600 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                    <button
                        onClick={() => onSave(labels)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Save size={20} className="mr-2" />
                        Save Labels
                    </button>
                </div>
            </div>

            <div className="flex space-x-4">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    {TRASH_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <button
                    onClick={() => setLabels(labels.slice(0, -1))}
                    disabled={labels.length === 0}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                >
                    Undo
                </button>
                <button
                    onClick={() => setLabels([])}
                    className="px-4 py-2 text-red-600 hover:text-red-700"
                >
                    Clear All
                </button>
            </div>

            <div className="relative max-w-full">
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Image to label"
                    className="w-full"
                    style={{ display: 'none' }}
                />
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setIsDrawing(false)}
                    className="border rounded-lg cursor-crosshair w-full"
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            </div>

            <div className="space-y-2">
                <h4 className="font-medium">Current Labels:</h4>
                {labels.length === 0 ? (
                    <p className="text-sm text-gray-500">No labels yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {labels.map((label, index) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                                <span>
                                    {label.trashType} at ({Math.round(label.bbox[0])},{' '}
                                    {Math.round(label.bbox[1])})
                                </span>
                                <button
                                    onClick={() => setLabels(labels.filter((_, i) => i !== index))}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <X size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="space-y-2">
                <h4 className="font-medium">Instructions:</h4>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Select a trash type from the dropdown</li>
                    <li>Click and drag on the image to draw a bounding box</li>
                    <li>Release to confirm the label</li>
                    <li>Use Undo or Clear All to correct mistakes</li>
                    <li>Click "Save Labels" when finished</li>
                </ol>
            </div>
        </div>
    );
};

export default ImageLabeler;