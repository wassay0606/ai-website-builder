import React from 'react';

export const WordIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    {...props}
  >
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10.5 12.5h3" />
    <path d="m9 17 3-3.5 3 3.5" />
  </svg>
);
