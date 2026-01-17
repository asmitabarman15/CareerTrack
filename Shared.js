import React from 'react';

export const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <p className="mt-4 text-slate-500 font-medium">Loading Career Track...</p>
  </div>
);

export const ProgressBar = ({ progress, color = "bg-indigo-600" }) => (
  <div className="w-full bg-slate-200 rounded-full h-2.5">
    <div 
      className={`${color} h-2.5 rounded-full transition-all duration-500`} 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);
