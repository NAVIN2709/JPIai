import React from 'react';

const SkeletonVideo = () => {
  return (
    <div className="w-[70vw] md:max-w-md">
      {/* Video Skeleton Container */}
      <div className="relative rounded-lg overflow-hidden bg-black border border-white shadow-md">
        {/* Video area - 16:9 aspect ratio */}
        <div className="relative w-full h-48 md:h-64 bg-black">
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          
          {/* Center loading spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 w-20 h-20 border-2 border-white/20 rounded-full animate-ping"></div>
              
              {/* Main spinning loader */}
              <div className="relative w-20 h-20 border-4 border-gray-700 border-t-white rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing status text */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-black border border-white rounded-full">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
          </div>
          <span className="text-sm font-medium text-gray-300">Processing Video</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SkeletonVideo;