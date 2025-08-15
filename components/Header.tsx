
import React from 'react';
import { BugIcon } from './icons/BugIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-surface/50 border-b border-border-color backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <BugIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              Intelligent Bug Bounty Assistant
            </h1>
          </div>
          <a href="https://github.com/google/genai-js" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-primary transition-colors">
            Powered by Gemini
          </a>
        </div>
      </div>
    </header>
  );
};
