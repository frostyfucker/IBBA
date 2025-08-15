
import React from 'react';

export const PocIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <path d="M12 18v-6"></path>
    <path d="m9 15 3 3 3-3"></path>
    <path d="M10 9h.01"></path>
    <path d="M14 9h.01"></path>
    <path d="M10 12h.01"></path>
    <path d="M14 12h.01"></path>
  </svg>
);
