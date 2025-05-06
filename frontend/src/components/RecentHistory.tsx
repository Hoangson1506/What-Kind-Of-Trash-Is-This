import React from 'react';
import { ProcessedImage } from '../pages/TrashDetectionPage';
import TrashTypeIndicator from './TrashTypeIndicator';

interface RecentHistoryProps {
  images: ProcessedImage[];
}

const RecentHistory: React.FC<RecentHistoryProps> = ({ images }) => {
  if (images.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No recent detections</p>
        <p className="text-sm mt-1">Upload an image to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {images.map((image) => (
        <div 
          key={image.id}
          className="border rounded-lg overflow-hidden bg-white transition-all hover:shadow-md"
        >
          <div className="aspect-video bg-gray-100 relative">
            <img 
              src={image.processedImage} 
              alt="Detection result"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {image.detections.map((detection, index) => (
                <div key={index} className="flex justify-between items-center">
                  <TrashTypeIndicator trashType={detection.trashType} size="sm" />
                  <span className="text-xs text-gray-500">
                    {(detection.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(image.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentHistory;