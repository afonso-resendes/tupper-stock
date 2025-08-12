"use client";

import React, { useState, useEffect } from "react";

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate visitor count (in real implementation, you'd fetch from Vercel Analytics API)
    const fetchVisitorCount = async () => {
      try {
        // For now, we'll use a simulated count
        // In production, you can integrate with Vercel Analytics API
        const mockCount = Math.floor(Math.random() * 1000) + 500;
        setVisitorCount(mockCount);
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorCount();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <span>Carregando estatísticas...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <svg
        className="w-4 h-4 text-gray-400 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fillRule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{visitorCount?.toLocaleString("pt-PT")} visitantes online</span>
    </div>
  );
};

export default VisitorCounter;
