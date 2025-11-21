
import React from 'react';
import type { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
    selected: AspectRatio;
    onSelect: (ratio: AspectRatio) => void;
}

const ratios: AspectRatio[] = ["3:4", "1:1", "4:3", "16:9", "9:16"];
const labels: { [key in AspectRatio]: string } = {
    "3:4": "Portrait",
    "1:1": "Square",
    "4:3": "Landscape",
    "16:9": "Widescreen",
    "9:16": "Story"
};


export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onSelect }) => {
    return (
        <div className="max-w-2xl mx-auto mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2 text-center">Select Aspect Ratio</h3>
            <div className="flex justify-center items-center gap-2 p-2 bg-gray-200 rounded-xl">
                {ratios.map(ratio => (
                    <button 
                        key={ratio}
                        onClick={() => onSelect(ratio)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 w-full ${selected === ratio ? 'bg-pink-500 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        {labels[ratio]} ({ratio})
                    </button>
                ))}
            </div>
        </div>
    );
};
