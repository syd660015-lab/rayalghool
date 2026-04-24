import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface CanvasProps {
  currentColor: string;
  lineWidth: number;
  width?: number;
  height?: number;
  elapsedTime?: number;
}

export interface CanvasHandle {
  clear: () => void;
  undo: () => void;
  getDataUrl: () => string;
  getSVGData: () => string;
}

const DrawingCanvas = forwardRef<CanvasHandle, CanvasProps>(({ currentColor, lineWidth, width = 800, height = 600, elapsedTime }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<{ points: {x: number, y: number}[], color: string, width: number }[]>([]);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  const requestRef = useRef<number | null>(null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    redraw(paths);
  }, [width, height]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPaths([]);
      lastPointRef.current = null;
    },
    undo: () => {
      setPaths(prev => {
        const newPaths = prev.slice(0, -1);
        redraw(newPaths);
        return newPaths;
      });
      lastPointRef.current = null;
    },
    getDataUrl: () => {
      return canvasRef.current?.toDataURL() || '';
    },
    getSVGData: () => {
      const svgPaths = paths.map(path => {
        if (path.points.length < 2) return '';
        const d = `M ${path.points[0].x} ${path.points[0].y} ` + 
                  path.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        return `<path d="${d}" stroke="${path.color}" stroke-width="${path.width}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
      }).join('\n');

      return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white" />
  ${svgPaths}
</svg>`;
    }
  }));

  const drawSegment = (p1: {x: number, y: number}, p2: {x: number, y: number}, color: string, width: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  const redraw = (currentPaths: { points: {x: number, y: number}[], color: string, width: number }[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentPaths.forEach(path => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    lastPointRef.current = pos;
    setPaths(prev => [...prev, { points: [pos], color: currentColor, width: lineWidth }]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPointRef.current) return;
    
    // Prevent default scroll behavior on touch
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
    }

    const pos = getPos(e);
    const p1 = lastPointRef.current;

    // Use requestAnimationFrame for smoother performance
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    requestRef.current = requestAnimationFrame(() => {
      drawSegment(p1, pos, currentColor, lineWidth);
      
      setPaths(prev => {
        const lastPath = prev[prev.length - 1];
        if (!lastPath) return prev;
        const newLastPath = { ...lastPath, points: [...lastPath.points, pos] };
        return [...prev.slice(0, -1), newLastPath];
      });
      
      lastPointRef.current = pos;
      requestRef.current = null;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-lg shadow-sm cursor-crosshair overflow-hidden touch-none relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={(e) => {
          if (e.cancelable) e.preventDefault();
          startDrawing(e);
        }}
        onTouchMove={(e) => {
          if (e.cancelable) e.preventDefault();
          draw(e);
        }}
        onTouchEnd={(e) => {
          if (e.cancelable) e.preventDefault();
          stopDrawing();
        }}
        className="w-full h-auto block touch-none"
        style={{ touchAction: 'none' }}
      />
      {elapsedTime !== undefined && (
        <div className="absolute bottom-3 right-3 bg-slate-900/10 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none">
          <span className="font-mono text-xs font-bold text-slate-500">{formatTime(elapsedTime)}</span>
        </div>
      )}
    </div>
  );
});

export default DrawingCanvas;
