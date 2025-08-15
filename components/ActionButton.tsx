
import React from 'react';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  isLoading: boolean;
  Icon: React.ElementType;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, isLoading, Icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-background border border-border-color rounded-md text-sm font-medium text-text-secondary hover:text-primary hover:border-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-color disabled:hover:text-text-secondary"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};
