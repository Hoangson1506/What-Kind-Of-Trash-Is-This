import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onImageUploaded: (imageData: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageUploaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer h-64 ${
          isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
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
            {isDragging ? 'Drop the image here' : 'Drag and drop an image here'}
          </p>
          <p className="text-gray-500 mb-4">or click to select a file</p>
          <p className="text-sm text-gray-400">
            Supported formats: JPG, PNG, GIF (max 10MB)
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">1</div>
              <span className="font-medium">Upload</span>
            </div>
            <p className="text-sm text-gray-600">Upload any image containing trash items you want to identify</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-2">2</div>
              <span className="font-medium">Process</span>
            </div>
            <p className="text-sm text-gray-600">Our AI model analyzes the image to identify the type of trash</p>
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