
import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have granted permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            onImageUpload(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {!isCameraOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Upload Your Garment</h2>
            <p className="text-gray-500 mb-6">Let's create a virtual photoshoot. Start by uploading a photo of a clothing item.</p>
            
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-4 border-dashed rounded-xl p-10 transition-colors duration-300 ${isDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-300 bg-gray-50'}`}
            >
                <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                />
                
                <div className="flex flex-col items-center gap-4">
                    <UploadIcon className="w-16 h-16 text-gray-400" />
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer bg-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-600 transition-colors flex-1 text-center min-w-[140px]">
                            Browse Files
                        </label>
                        <button 
                            onClick={startCamera}
                            className="bg-gray-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 flex-1 min-w-[140px]"
                        >
                            <CameraIcon className="w-5 h-5" />
                            Take Photo
                        </button>
                    </div>
                    <span className="text-gray-500 text-sm">or drag & drop here</span>
                </div>
            </div>
        </div>
      ) : (
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative flex flex-col items-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[60vh] object-cover transform scale-x-[-1]" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-6 flex gap-4">
                <button 
                    onClick={capturePhoto}
                    className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-transform hover:scale-110 ring-4 ring-white/50"
                    aria-label="Capture Photo"
                >
                    <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-black"></div>
                </button>
                <button 
                    onClick={stopCamera}
                    className="bg-gray-800/80 text-white py-2 px-6 rounded-full hover:bg-gray-700 backdrop-blur-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
