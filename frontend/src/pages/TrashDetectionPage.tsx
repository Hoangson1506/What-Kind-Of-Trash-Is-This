import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import ResultsDisplay from '../components/ResultsDisplay';
import RecentHistory from '../components/RecentHistory';
import DisposalMap from '../components/DisposalMap';
import TrashTypeIndicator from '../components/TrashTypeIndicator';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FeedbackData } from '../components/FeedbackForm';
import { LabelData } from '../components/ImageLabeler';

export interface Detection {
  trashType: string;
  confidence: number;
  bbox?: [number, number, number, number]; // [x, y, width, height]
}

export interface ProcessedImage {
  id: string;
  originalImage: string;
  processedImage: string;
  detections: Detection[];
  timestamp: Date;
}

const TrashDetectionPage: React.FC = () => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessedImage | null>(null);
  const [recentImages, setRecentImages] = useState<ProcessedImage[]>([]);

  const processImage = async (imageData: string) => {
    try {
      setIsProcessing(true);
      setCurrentImage(imageData);
      setProcessedResult(null);

      const response = await fetch('http://127.0.0.1:8000/inference-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result = await response.json();

      const processedResult: ProcessedImage = {
        id: Date.now().toString(),
        originalImage: imageData,
        processedImage: result.processedImage || result.image || imageData,
        detections: result.detections || [],
        timestamp: new Date()
      };

      setProcessedResult(processedResult);
      setRecentImages(prev => [processedResult, ...prev].slice(0, 5));
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processVideo = async (videoBlob: Blob) => {
    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('video', videoBlob);

      const response = await fetch('http://127.0.0.1:8000/inference-video', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      const result = await response.json();
      toast.success('Video processed successfully');

      if (result.frames && result.frames.length > 0) {
        const lastFrame = result.frames[result.frames.length - 1];
        const processedResult: ProcessedImage = {
          id: Date.now().toString(),
          originalImage: lastFrame.original,
          processedImage: lastFrame.processed,
          detections: lastFrame.detections || [],
          timestamp: new Date()
        };

        setProcessedResult(processedResult);
        setRecentImages(prev => [processedResult, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: FeedbackData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handleLabelsSubmit = async (labels: LabelData[]) => {
    try {
      if (!currentImage) return;

      const response = await fetch('http://127.0.0.1:8000/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: currentImage,
          labels
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit labels');
      }

      toast.success('Thank you for contributing to our dataset!');
    } catch (error) {
      console.error('Error submitting labels:', error);
      toast.error('Failed to submit labels. Please try again.');
    }
  };

  const resetState = () => {
    setCurrentImage(null);
    setProcessedResult(null);
  };

  // Get distinct trash types with highest confidence
  const uniqueDetections = processedResult
    ? Object.values(
      processedResult.detections.reduce((acc: { [key: string]: Detection }, detection: Detection) => {
        const type = detection.trashType.toLowerCase();
        if (!acc[type] || detection.confidence > acc[type].confidence) {
          acc[type] = detection;
        }
        return acc;
      }, {})
    )
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-medium mb-4">{t('upload.title')}</h2>
            {!currentImage ? (
              <ImageUploader
                onImageUploaded={processImage}
                onVideoUploaded={processVideo}
              />
            ) : (
              <ResultsDisplay
                isProcessing={isProcessing}
                originalImage={currentImage}
                result={processedResult}
                onReset={resetState}
                onFeedbackSubmit={handleFeedbackSubmit}
                onLabelsSubmit={handleLabelsSubmit}
              />
            )}
          </div>

          {currentImage && processedResult && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">{t('results.title')}</h2>
              <div className="space-y-4">
                {uniqueDetections.map((detection: Detection, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <TrashTypeIndicator trashType={detection.trashType} size='lg' />
                      <span className="text-sm text-gray-600">
                        {t('results.summary.confidence', { value: Math.round(detection.confidence * 100) })}
                      </span>
                    </div>
                    <DisposalInstructions trashType={detection.trashType} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-medium mb-4">{t('map.title')}</h2>
            <DisposalMap />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-6">
            <h2 className="text-xl font-medium mb-4">{t('history.title')}</h2>
            <RecentHistory images={recentImages} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DisposalInstructions: React.FC<{ trashType: string }> = ({ trashType }) => {
  const instructions: Record<string, { text: string, color: string }> = {
    'plastic': {
      text: 'Rinse containers and recycle in designated plastic bins. Remove caps and labels if required.',
      color: 'bg-blue-100 text-blue-800'
    },
    'paper': {
      text: 'Recycle clean, dry paper in paper recycling bins. Avoid recycling soiled or food-contaminated paper.',
      color: 'bg-yellow-100 text-yellow-800'
    },
    'glass': {
      text: 'Rinse glass containers and recycle in glass recycling bins. Remove caps and lids.',
      color: 'bg-purple-100 text-purple-800'
    },
    'metal': {
      text: 'Clean metal cans and containers and recycle in metal recycling bins.',
      color: 'bg-gray-100 text-gray-800'
    },
    'other': {
      text: 'Dispose of in regular trash bins. Check local guidelines for specific items.',
      color: 'bg-gray-100 text-gray-800'
    },
    'food': {
      text: 'Compost in designated organic waste bins or home composting systems.',
      color: 'bg-green-100 text-green-800'
    },
    'E-waste': {
      text: 'Take to designated e-waste collection points. Never dispose of in regular trash.',
      color: 'bg-red-100 text-red-800'
    }
  };

  const defaultInstructions = {
    text: 'Please check with local authorities for proper disposal guidelines.',
    color: 'bg-gray-100 text-gray-800'
  };

  const { text, color } = instructions[trashType] || defaultInstructions;

  return (
    <div className={`${color} rounded-lg p-4 mt-3`}>
      <p>{text}</p>
    </div>
  );
};

export default TrashDetectionPage;