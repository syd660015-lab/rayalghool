import React from 'react';
import { FigureType } from '../types';

export const FigureIcon = ({ id, type = 'A', className = "w-10 h-10" }: { id: number, type?: FigureType, className?: string }) => {
  const strokeColor = "currentColor";
  const strokeWidth = "2";

  const iconsA: Record<number, React.ReactNode> = {
    1: <path d="M5 25 H45 M25 5 V45" />, // Cross left
    2: <rect x="5" y="10" width="40" height="30" fill="none" />, // Main rect
    3: <path d="M5 10 L45 40 M45 10 L5 40" />, // Diagonals
    4: <line x1="5" y1="25" x2="45" y2="25" />, // Median H
    5: <line x1="25" y1="10" x2="25" y2="40" />, // Median V
    6: <rect x="30" y="15" width="10" height="10" fill="none" />, // Small inner rect
    7: <line x1="30" y1="20" x2="40" y2="20" />, // Small H line
    8: <path d="M10 5 H25 M10 8 H25 M10 11 H25" />, // Parallel H
    9: <path d="M20 10 L25 2 L30 10 Z" fill="none" />, // Top triangle
    10: <line x1="15" y1="15" x2="15" y2="25" />, // Small V line
    11: <g><circle cx="20" cy="20" r="8" fill="none" /><circle cx="18" cy="18" r="1" /><circle cx="22" cy="18" r="1" /><circle cx="20" cy="22" r="1" /></g>, // Circle dots
    12: <path d="M10 35 L15 45 M15 35 L20 45 M20 35 L25 45 M25 35 L30 45 M30 35 L35 45" />, // 5 slanted lines
    13: <path d="M45 10 L55 25 L45 40" fill="none" />, // 2 slanted lines right
    14: <path d="M50 20 L53 25 L50 30 L47 25 Z" fill="none" />, // Diamond
    15: <line x1="50" y1="15" x2="50" y2="35" />, // Vertical in triangle
    16: <line x1="45" y1="25" x2="55" y2="25" />, // Extension H
    17: <path d="M25 40 V55 M15 50 H35" />, // bottom cross
    18: <rect x="5" y="32" width="8" height="8" fill="none" />, // bottom left square
  };

  const iconsB: Record<number, React.ReactNode> = {
    1: <circle cx="20" cy="20" r="15" />, // Large Circle
    2: <path d="M10 25 L20 5 L30 25 Z" />, // Triangle
    3: <rect x="15" y="20" width="30" height="15" />, // Rectangle
    4: <path d="M20 35 A10 10 0 0 1 40 35 M30 35 V45" />, // Semi-circle + lines
    5: <rect x="40" y="30" width="15" height="15" />, // Bottom right square
    6: <circle cx="47" cy="37" r="4" />, // Small circle in square
    7: <g><circle cx="25" cy="15" r="1" /><circle cx="30" cy="15" r="1" /></g>, // Dots in circle
    8: <path d="M20 18 H20.1 M20 18 V18.1" strokeWidth="4" />, // cross in triangle
    9: <path d="M50 25 H55 M50 28 H55" />, // Equals sign
    10: <line x1="10" y1="25" x2="15" y2="25" />, // Connecting line
    11: <line x1="40" y1="30" x2="55" y2="45" />, // Slanted line in square
  };

  const currentIcons = type === 'A' ? iconsA : iconsB;

  return (
    <svg viewBox="0 0 60 60" className={className} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {currentIcons[id] || <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="20" stroke="none" fill="#cbd5e1">?</text>}
    </svg>
  );
};
