
import React from 'react';
import type { GeneratedImage } from '../types';
import { RelaxedIcon } from './icons/RelaxedIcon';
import { WalkingIcon } from './icons/WalkingIcon';
import { PoseIcon } from './icons/PoseIcon';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  isSelected: boolean;
  onSelect: () => void;
}

const poseIcons: Record<GeneratedImage['pose'], React.ReactNode> = {
    Relaxed: <RelaxedIcon className="w-6 h-6" />,
    Walking: <WalkingIcon className="w-6 h-6" />,
    Pose: <PoseIcon className="w-6 h-6" />,
}

export const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({ image, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 cursor-pointer ${isSelected ? 'ring-4 ring-pink-500 scale-105' : 'hover:shadow-2xl hover:-translate-y-1'}`}
    >
      <img src={image.src} alt={`AI model in ${image.pose} pose`} className="w-full h-auto object-cover" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {poseIcons[image.pose]}
          <h3 className="text-2xl font-bold text-gray-800">{image.pose} Look</h3>
        </div>
        
        <h4 className="font-semibold text-lg text-gray-700 mb-2">Style Notes</h4>
        <p className="text-gray-600 mb-4">{image.description}</p>
        
        <h4 className="font-semibold text-lg text-gray-700 mb-2">Wear It When</h4>
        <p className="text-gray-600">{image.recommendations}</p>
      </div>
    </div>
  );
};
