
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface EditingPanelProps {
  onSubmit: (prompt: string) => void;
}

export const EditingPanel: React.FC<EditingPanelProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-200 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <SparklesIcon className="w-8 h-8 text-pink-500"/>
        <h2 className="text-3xl font-bold text-gray-800">Refine Your Vision</h2>
      </div>
      <p className="text-gray-600 mb-6">Describe the changes you'd like to see on the selected image. For example, "change the background to a beach at sunset" or "make the dress red".</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Add a retro filter..."
          className="flex-grow w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow"
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-5 h-5"/>
          Generate
        </button>
      </form>
    </div>
  );
};
