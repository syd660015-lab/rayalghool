import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FigureType } from '../types';

interface FigureAnimationProps {
  type: FigureType;
  width?: number;
  height?: number;
}

export const FigureAnimation: React.FC<FigureAnimationProps> = ({ type, width = 600, height = 400 }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setKey(prev => prev + 1);
    }, 15000); // Replay animation every 15s
    return () => clearInterval(timer);
  }, []);

  // Simplified paths for Figure A and B to demonstrate the complexity
  // These represent the 18/11 elements but in a stylized animation way
  const figureAPaths = [
    // 1. Large Rectangle
    "M 150 100 L 450 100 L 450 300 L 150 300 Z",
    // 2. Cross inside
    "M 300 100 L 300 300",
    "M 150 200 L 450 200",
    // 3. Diagonals
    "M 150 100 L 450 300",
    "M 450 100 L 150 300",
    // 4. Triangle on top
    "M 300 100 L 375 25 L 450 100",
    // 5. Circle with 3 dots (top right)
    "M 400 135 A 15 15 0 1 1 399.9 135",
    // 6. External rectangle (left)
    "M 100 150 L 150 150 L 150 250 L 100 250 Z",
    "M 100 200 L 150 200",
    // 7. Extensions
    "M 450 100 L 525 200 L 450 300",
    "M 525 200 L 450 200",
    // 8. Bottom additions
    "M 300 300 L 300 350",
    "M 250 350 L 350 350",
    "M 150 300 L 100 350 L 150 350",
    // 9. Diagonal small parallel lines
    "M 310 110 L 340 140", "M 320 110 L 350 140", "M 330 110 L 360 140"
  ];

  const figureBPaths = [
    // 1. Large Circle
    "M 300 200 m -100, 0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0",
    // 2. Inner Triangle
    "M 300 130 L 230 250 L 370 250 Z",
    // 3. Horizontal Rectangle
    "M 150 180 L 450 180 L 450 220 L 150 220 Z",
    // 4. Square bottom right
    "M 380 250 L 450 250 L 450 320 L 380 320 Z",
    "M 380 320 L 450 250",
    // 5. Small circle in square
    "M 415 285 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0",
    // 6. Semicircle extension
    "M 200 110 A 30 30 0 1 1 260 110",
    "M 215 85 L 215 110", "M 230 80 L 230 110", "M 245 85 L 245 110"
  ];

  const paths = type === 'A' ? figureAPaths : figureBPaths;

  return (
    <div className="relative w-full aspect-video bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-inner group">
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
        عرض توضيحي متحرك
      </div>
      <svg 
        key={key}
        viewBox="0 0 600 400" 
        className="w-full h-full drop-shadow-xl p-8"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="600" height="400" fill="white" rx="20" fillOpacity="0.3" />
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke={type === 'A' ? '#4f46e5' : '#9333ea'} // Indigo for A, Purple for B
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              transition: { 
                duration: 0.8, 
                delay: i * 0.3,
                ease: "easeInOut"
              } 
            }}
          />
        ))}
        {/* Glow effect */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs font-bold text-slate-400">تحليل المكونات البصرية للشكل ({type})</p>
      </div>
    </div>
  );
};
