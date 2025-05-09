import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImageIcon, Video, Camera } from 'lucide-react';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import { colorMap, TrashType, hexToRgba } from '../utils/colorUtils';

interface ImageUploaderProps {
  onImageUploaded: (imageData: string) => void;
  onVideoUploaded?: (videoBlob: Blob) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, onVideoUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'webcam'>('image');
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamInterval = useRef<number>();

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
    } else if (file.type.startsWith('video/') && onVideoUploaded) {
      onVideoUploaded(file);
    } else {
      toast.error('Please upload a valid image or video file');
    }
  }, [onImageUploaded, onVideoUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  interface Detection {
    bbox: [number, number, number, number];
    trashType: TrashType;
    confidence: number;
  }

  const drawDetections = (detections: Detection[]) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling factors
    const scaleX = video.videoWidth / 640;
    const scaleY = video.videoHeight / 640;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (video.videoWidth - (640 * scale)) / 2;
    const offsetY = (video.videoHeight - (640 * scale)) / 2;

    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;

      // Scale coordinates from 640x640 to video dimensions
      const scaledX = (x * scale) + offsetX;
      const scaledY = (y * scale) + offsetY;
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;

      // Set bounding box color based on trash type
      const boxColor = colorMap[detection.trashType]
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Draw label inside top-right corner of the bounding box
      const label = `${detection.trashType} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.font = '16px Arial';
      const textWidth = ctx.measureText(label).width;
      const backgroundWidth = textWidth + 10; // 5px padding on each side
      const backgroundHeight = 25;
      const padding = 5;
      const desiredX = scaledX + (scaledWidth - backgroundWidth) / 2; // Center the label
      const minX = scaledX + padding;
      const maxX = scaledX + scaledWidth - backgroundWidth - padding;
      const actualX = Math.max(minX, Math.min(maxX, desiredX));
      const backgroundY = scaledY + padding;


      // Draw label background
      ctx.fillStyle = hexToRgba(boxColor, 0.3);
      ctx.fillRect(actualX, backgroundY, backgroundWidth, backgroundHeight);

      // Determine text color based on brightness for readability
      const r = parseInt(boxColor.slice(1, 3), 16);
      const g = parseInt(boxColor.slice(3, 5), 16);
      const b = parseInt(boxColor.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const textColor = brightness > 125 ? '#000000' : '#ffffff';

      ctx.fillStyle = textColor;
      ctx.fillText(label, actualX + 5, backgroundY + 20);
    });
  };

  const startStreaming = useCallback(() => {
    // Initialize WebSocket connection
    wsRef.current = new WebSocket('ws://localhost:8000/ws');

    wsRef.current.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data);
        if (result.detections) {
          setDetections(result.detections);
          drawDetections(result.detections);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    setIsStreaming(true);
    streamInterval.current = window.setInterval(() => {
      if (webcamRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        const frame = webcamRef.current.getScreenshot();
        if (frame) {
          wsRef.current.send(JSON.stringify({ image: frame }));
        }
      }
    }, 200); // ~30 FPS
  }, []);

  const stopStreaming = useCallback(() => {
    if (streamInterval.current) {
      clearInterval(streamInterval.current);
      setIsStreaming(false);
      setDetections([]);

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamInterval.current) {
        clearInterval(streamInterval.current);
      }
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
          Image
        </button>
        <button
          onClick={() => {
            setUploadType('video');
            setIsWebcamActive(false);
            stopStreaming();
          }}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${uploadType === 'video'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Video size={20} className="mr-2" />
          Video
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
          Webcam
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
          className={`border-2 border-dashed rounded-xl p-8 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer h-64 ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-center">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-green-100' : 'bg-gray-100'} mb-4`}>
              {isDragging ? (
                <ImageIcon size={40} className="text-green-500" />
              ) : (
                <Upload size={40} className="text-gray-500" />
              )}
            </div>
            <p className="text-lg font-medium mb-1">
              {isDragging ? 'Drop the file here' : `Drag and drop ${uploadType === 'video' ? 'a video' : 'an image'} here`}
            </p>
            <p className="text-gray-500 mb-4">or click to select a file</p>
            <p className="text-sm text-gray-400">
              {uploadType === 'video'
                ? 'Supported formats: MP4, WebM, MOV (max 100MB)'
                : 'Supported formats: JPG, PNG, GIF (max 10MB)'}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">1</div>
              <span className="font-medium">Upload</span>
            </div>
            <p className="text-sm text-gray-600">Upload an image, video, or use your webcam to capture trash items</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">2</div>
              <span className="font-medium">Process</span>
            </div>
            <p className="text-sm text-gray-600">Our AI model analyzes the content to identify the type of trash</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">3</div>
              <span className="font-medium">Results</span>
            </div>
            <p className="text-sm text-gray-600">Get results showing trash type and proper disposal instructions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;