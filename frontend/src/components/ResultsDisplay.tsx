import React from 'react';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { ProcessedImage } from '../pages/TrashDetectionPage';
import TrashTypeIndicator from './TrashTypeIndicator';

interface ResultsDisplayProps {
  isProcessing: boolean;
  originalImage: string;
  result: ProcessedImage | null;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  isProcessing,
  originalImage,
  result,
  onReset
}) => {
  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result.processedImage;
    link.download = `trash-detection-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button 
        onClick={onReset}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="flex flex-col">
          <h3 className="text-md font-medium mb-2">Original Image</h3>
          <div className="border rounded-lg overflow-hidden aspect-square relative bg-gray-100">
            <img 
              src={originalImage} 
              alt="Original upload" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Processed Image */}
        <div className="flex flex-col">
          <h3 className="text-md font-medium mb-2">Detection Result</h3>
          <div className="border rounded-lg overflow-hidden aspect-square relative bg-gray-100">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <RefreshCw size={40} className="text-green-500 animate-spin mb-3" />
                <p className="text-gray-600">Detecting trash types...</p>
              </div>
            ) : result ? (
              <>
                <img 
                  src={result.processedImage} 
                  alt="Processed result" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 right-3">
                  <button 
                    onClick={handleDownload} 
                    className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Download result"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">Processing your image...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Detection Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {result.detections.map((detection, index) => (
                <div key={index} className="flex items-center justify-between">
                  <TrashTypeIndicator trashType={detection.trashType} />
                  <span className="text-sm text-gray-600">
                    Confidence: {(detection.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="text-right text-sm text-gray-500 mt-4">
              {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;