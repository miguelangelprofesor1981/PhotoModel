
import React from 'react';

interface HeaderProps {
    onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          PhotoModel<span className="text-pink-500">-IA</span>
        </h1>
        <button
          onClick={onReset}
          className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-300"
        >
          Start Over
        </button>
      </div>
    </header>
  );
};
