import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImageIcon, Camera } from 'lucide-react';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { colorMap, TrashType, hexToRgba } from '../utils/colorUtils';

interface ImageUploaderProps {
  onImageUploaded: (imageData: string) => void
}


const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'webcam'>('image');
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onImageUploaded(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image or video file');
    }
  }, [onImageUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  interface Detection {
    bbox: [number, number, number, number]; // [top_x, top_y, bottom_x, bottom_y]
    trashType: TrashType;
    confidence: number;
    shape: [number, number, number];
  }

  const drawDetections = (detections: Detection[]) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // resize canvas bằng đúng kích thước video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nếu video bị mirror, bật transform trước khi vẽ
    const isMirrored = false; // set false nếu không mirror
    if (isMirrored) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    detections.forEach(detection => {
      const [x1, y1, x2, y2] = detection.bbox;
      const x = x1, y = y1, w = x2 - x1, h = y2 - y1;

      // Mirror logic
      const px = isMirrored
        ? canvas.width - (x + w)
        : x;
      const py = y;
      const pw = w;
      const ph = h;

      // Draw box
      const boxColor = colorMap[detection.trashType];
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, pw, ph);

      // Draw label on top left corner
      const label = `${detection.trashType} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.font = '16px Arial';
      ctx.textBaseline = 'top';

      const textWidth = ctx.measureText(label).width;
      const padding = 5;
      const backgroundWidth = textWidth + padding * 2;
      const backgroundHeight = 16 + padding * 2;

      const bgX = px + padding;
      const bgY = py + padding;

      // Draw background
      ctx.fillStyle = hexToRgba(boxColor, 0.3);
      ctx.fillRect(bgX, bgY, backgroundWidth, backgroundHeight);

      // Determine text color based on brightness for readability
      const r = parseInt(boxColor.slice(1, 3), 16),
        g = parseInt(boxColor.slice(3, 5), 16),
        b = parseInt(boxColor.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      ctx.fillStyle = brightness > 125 ? '#000' : '#fff';

      // Draw text
      ctx.fillText(label, bgX + padding, bgY + padding);
    });

    if (isMirrored) {
      ctx.restore();
    }
  };

  const startStreaming = useCallback(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/inference/ws');
    let isWaiting = false;

    const sendNextFrame = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isWaiting) return;
      isWaiting = true;
      const frame = webcamRef.current?.getScreenshot();
      if (frame) {
        wsRef.current.send(JSON.stringify({ image: frame }));
      }
    };

    wsRef.current.onopen = () => {
      setIsStreaming(true);
      sendNextFrame(); // Start sending frames after connection is open
    };

    wsRef.current.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data);
        if (result.detections) {
          setDetections(result.detections);
          drawDetections(result.detections);
        }
        isWaiting = false;
        sendNextFrame(); // Send next frame after receiving response
      } catch (error) {
        console.error('WebSocket message error:', error);
        isWaiting = false; // Allow next frame even on error
        sendNextFrame();
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsStreaming(false);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
      setIsStreaming(false);
    };
  }, []);

  const stopStreaming = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsStreaming(false);
    setDetections([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => {
            setUploadType('image');
            setIsWebcamActive(false);
            stopStreaming();
          }}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${uploadType === 'image'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <ImageIcon size={20} className="mr-2" />
          {t('upload.types.image')}
        </button>
        <button
          onClick={() => {
            setUploadType('webcam');
            setIsWebcamActive(true);
          }}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${uploadType === 'webcam'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Camera size={20} className="mr-2" />
          {t('upload.types.webcam')}
        </button>
      </div>

      {isWebcamActive ? (
        <div className="relative">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full rounded-xl"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            {!isStreaming ? (
              <button
                onClick={startStreaming}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Stream
              </button>
            ) : (
              <button
                onClick={stopStreaming}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Stream
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer h-64 ${isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-center">
            <div
              className={`p-3 rounded-full ${isDragging ? 'bg-green-100' : 'bg-gray-100'
                } mb-4`}
            >
              {isDragging ? (
                <ImageIcon size={40} className="text-green-500" />
              ) : (
                <Upload size={40} className="text-gray-500" />
              )}
            </div>
            <p className="text-lg font-medium mb-1">
              {isDragging
                ? t('upload.dropzone.dragActive')
                : t('upload.dropzone.dragInactive', {
                  type: t('upload.types.image').toLowerCase(),
                })}
            </p>
            <p className="text-gray-500 mb-4">
              {t('upload.dropzone.clickToSelect')}
            </p>
            <p className="text-sm text-gray-400">
              {t('upload.dropzone.supportedFormats.image')}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">
          {t('upload.howItWorks.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">
                1
              </div>
              <span className="font-medium">
                {t('upload.howItWorks.steps.upload.title')}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t('upload.howItWorks.steps.upload.description')}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">
                2
              </div>
              <span className="font-medium">
                {t('upload.howItWorks.steps.process.title')}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t('upload.howItWorks.steps.process.description')}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">
                3
              </div>
              <span className="font-medium">
                {t('upload.howItWorks.steps.results.title')}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t('upload.howItWorks.steps.results.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;