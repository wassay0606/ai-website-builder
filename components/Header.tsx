import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-white leading-tight">
        Rajaonline Website Builder
      </h1>
      <p className="text-indigo-300 mt-2 text-sm">
        Describe your ideal website, and let AI bring it to life with Tailwind CSS.
      </p>
      <p className="text-gray-400 mt-4 text-xs">
        Created by <a href="https://rajaonline.net" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">rajaonline.net</a>
      </p>
    </div>
  );
};