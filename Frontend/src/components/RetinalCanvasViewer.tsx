import React, { useState, useRef, useEffect } from 'react';
import { 
  RetinalScan, 
  RetinalLesion, 
  ICDRStage 
} from '../types/retinopathy';
import { 
  ImageFilterSettings, 
  DEFAULT_FILTER_SETTINGS 
} from '../utils/imageProcessing';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Grid, 
  Sliders, 
  Maximize2, 
  Layers, 
  Crosshair, 
  Ruler, 
  Info,
  CheckCircle2,
  AlertTriangle,
  SplitSquareVertical
} from 'lucide-react';

interface RetinalCanvasViewerProps {
  scan: RetinalScan;
  onSelectLesion?: (lesion: RetinalLesion | null) => void;
  selectedLesion?: RetinalLesion | null;
}

export const RetinalCanvasViewer: React.FC<RetinalCanvasViewerProps> = ({
  scan,
  onSelectLesion,
  selectedLesion,
}) => {
  const [settings, setSettings] = useState<ImageFilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredLesion, setHoveredLesion] = useState<RetinalLesion | null>(null);
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0-100
  const [isCaliperActive, setIsCaliperActive] = useState<boolean>(false);
  const [caliperPoints, setCaliperPoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [caliperStep, setCaliperStep] = useState<0 | 1 | 2>(0);
  const [showControls, setShowControls] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset viewport when scan changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCaliperPoints(null);
    setCaliperStep(0);
  }, [scan.id]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.35, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only
    if (isCaliperActive) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const xPct = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
      const yPct = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;

      if (caliperStep === 0 || caliperStep === 2) {
        setCaliperPoints({ x1: xPct, y1: yPct, x2: xPct, y2: yPct });
        setCaliperStep(1);
      } else if (caliperStep === 1) {
        if (caliperPoints) {
          setCaliperPoints({ ...caliperPoints, x2: xPct, y2: yPct });
        }
        setCaliperStep(2);
      }
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCaliperActive && caliperStep === 1 && caliperPoints) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const xPct = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
      const yPct = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;
      setCaliperPoints({ ...caliperPoints, x2: xPct, y2: yPct });
      return;
    }

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to calculate caliper distance in Disc Diameters (DD) & microns
  const getCaliperMeasurement = () => {
    if (!caliperPoints) return null;
    const dx = caliperPoints.x2 - caliperPoints.x1;
    const dy = caliperPoints.y2 - caliperPoints.y1;
    const distPct = Math.sqrt(dx * dx + dy * dy);
    // Standard 45-degree fundus image ~ 12,000 µm across field
    // Standard Optic Disc diameter ~ 1.5 mm = 1500 µm ~ 12.5% of field
    const discDiameters = (distPct / 12.5).toFixed(2);
    const microns = Math.round(distPct * 120);
    return { discDiameters, microns, distPct };
  };

  // Filter styles applied via CSS filters
  const getFilterStyle = (mode: ImageFilterSettings['filterMode']) => {
    switch (mode) {
      case 'red_free':
        // Standard Red-Free: isolations in green spectrum (blood vessels and lesions appear high contrast black/dark green)
        return 'hue-rotate(90deg) saturate(2.5) contrast(1.6) brightness(0.9)';
      case 'clahe_enhanced':
        return 'contrast(1.85) brightness(1.1) saturate(1.4)';
      case 'inverted':
        return 'invert(0.95) hue-rotate(180deg) contrast(1.5)';
      case 'high_contrast':
        return 'contrast(2.2) brightness(0.95) saturate(1.2)';
      case 'vessel_enhanced':
        return 'grayscale(1) contrast(2.4) brightness(0.85)';
      default:
        return `contrast(${settings.contrast}%) brightness(${settings.brightness}%)`;
    }
  };

  // Anatomical positions based on OD vs OS
  const isOD = scan.eye === 'OD';
  const discPos = isOD ? { x: 32, y: 50 } : { x: 68, y: 50 };
  const foveaPos = isOD ? { x: 58, y: 50.5 } : { x: 42, y: 50.5 };

  const activeLesions = scan.lesions.filter((l) => {
    if (settings.activeLesionFilter === 'all') return true;
    return l.type === settings.activeLesionFilter;
  });

  const getLesionColor = (type: RetinalLesion['type']) => {
    switch (type) {
      case 'microaneurysm':
        return 'bg-red-500 border-red-300 text-red-300 ring-red-500/50';
      case 'hemorrhage':
        return 'bg-rose-600 border-rose-300 text-rose-300 ring-rose-600/50';
      case 'hard_exudate':
        return 'bg-amber-400 border-yellow-200 text-amber-200 ring-amber-400/50';
      case 'cotton_wool_spot':
        return 'bg-slate-200 border-white text-slate-100 ring-white/50';
      case 'neovascularization':
        return 'bg-purple-500 border-purple-300 text-purple-300 ring-purple-500/50';
      case 'venous_beading':
        return 'bg-indigo-500 border-indigo-300 text-indigo-300 ring-indigo-500/50';
      case 'irma':
        return 'bg-orange-500 border-orange-300 text-orange-300 ring-orange-500/50';
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Scan Title & Eye Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-400 font-mono">
            <span>{scan.eye}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{scan.eye === 'OD' ? 'Right Eye' : 'Left Eye'}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{scan.title}</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {scan.captureDate}
              </span>
            </h3>
          </div>
        </div>

        {/* Center/Right: Optical Filters & View Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Optical Filter Mode Selection */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSettings((s) => ({ ...s, filterMode: 'standard' }))}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                settings.filterMode === 'standard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Standard true-color fundus photography"
            >
              Full Color
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, filterMode: 'red_free' }))}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                settings.filterMode === 'red_free'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Red-Free (Green filter 540nm) - standard for microaneurysms and nerve fiber layer"
            >
              <Eye className="w-3 h-3 text-emerald-300" />
              <span>Red-Free</span>
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, filterMode: 'clahe_enhanced' }))}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                settings.filterMode === 'clahe_enhanced'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="CLAHE Contrast Enhanced"
            >
              CLAHE
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, filterMode: 'inverted' }))}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                settings.filterMode === 'inverted'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Inverted / Negative"
            >
              Invert
            </button>
          </div>

          {/* Toggle Layers */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSettings((s) => ({ ...s, showHeatmap: !s.showHeatmap }))}
              className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                settings.showHeatmap
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle AI Attention Heatmap (Grad-CAM)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Heatmap</span>
            </button>

            <button
              onClick={() => setSettings((s) => ({ ...s, showLesions: !s.showLesions }))}
              className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                settings.showLesions
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Lesion Annotations"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lesions ({scan.lesions.length})</span>
            </button>

            <button
              onClick={() => setSettings((s) => ({ ...s, showQuadrants: !s.showQuadrants }))}
              className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                settings.showQuadrants
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle 4-Quadrant Grid (ST/IT/SN/IN)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">4-Grid</span>
            </button>

            <button
              onClick={() => {
                setIsCaliperActive(!isCaliperActive);
                if (isCaliperActive) setCaliperPoints(null);
              }}
              className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                isCaliperActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Measure lesion distance from fovea (in Disc Diameters / Microns)"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Caliper</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 px-1 py-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-1 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-0.5"
              title="Reset Viewport"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full aspect-square max-h-[640px] bg-black overflow-hidden select-none flex items-center justify-center ${
          isCaliperActive ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Transform wrapper for Zoom & Pan */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative w-full h-full flex items-center justify-center pointer-events-auto"
        >
          {/* Base Fundus Image */}
          <img
            src={scan.imageUrl}
            alt={scan.title}
            style={{
              filter: getFilterStyle(settings.filterMode),
            }}
            className="w-full h-full object-contain pointer-events-none transition-all duration-300"
          />

          {/* AI Attention Heatmap (Grad-CAM) Overlay */}
          {settings.showHeatmap && (
            <div
              style={{
                opacity: settings.heatmapOpacity / 100,
              }}
              className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200"
            >
              <svg viewBox="0 0 1000 1000" className="w-full h-full">
                <defs>
                  {/* Heatmap activation radial gradients centered on lesions */}
                  <radialGradient id="heatHot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#f97316" stopOpacity="0.65" />
                    <stop offset="70%" stopColor="#eab308" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="heatWarm" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.75" />
                    <stop offset="50%" stopColor="#eab308" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                  <radialGradient id="heatMacula" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#eab308" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Render heat zones based on scan lesions or stage */}
                {scan.lesions.map((lesion) => (
                  <circle
                    key={`heat-${lesion.id}`}
                    cx={`${lesion.x * 10}`}
                    cy={`${lesion.y * 10}`}
                    r={lesion.size === 'large' ? 120 : lesion.size === 'medium' ? 80 : 50}
                    fill={lesion.type === 'neovascularization' || lesion.type === 'hemorrhage' ? 'url(#heatHot)' : 'url(#heatWarm)'}
                    className="animate-pulse-subtle"
                  />
                ))}

                {scan.dmeStatus !== 'none' && (
                  <circle
                    cx={`${foveaPos.x * 10}`}
                    cy={`${foveaPos.y * 10}`}
                    r="140"
                    fill="url(#heatMacula)"
                  />
                )}
              </svg>
            </div>
          )}

          {/* 4-Quadrant ETDRS Grid Overlay */}
          {settings.showQuadrants && (
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              <svg viewBox="0 0 1000 1000" className="w-full h-full">
                {/* Horizontal and Vertical meridian dividing lines through Fovea */}
                <line
                  x1="60"
                  y1={foveaPos.y * 10}
                  x2="940"
                  y2={foveaPos.y * 10}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  opacity="0.75"
                />
                <line
                  x1={foveaPos.x * 10}
                  y1="60"
                  x2={foveaPos.x * 10}
                  y2="940"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  opacity="0.75"
                />

                {/* Macular Concentric rings (1mm, 3mm, 6mm ETDRS grid) */}
                <circle
                  cx={foveaPos.x * 10}
                  cy={foveaPos.y * 10}
                  r="50"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                <circle
                  cx={foveaPos.x * 10}
                  cy={foveaPos.y * 10}
                  r="130"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <circle
                  cx={foveaPos.x * 10}
                  cy={foveaPos.y * 10}
                  r="240"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  opacity="0.5"
                />

                {/* Quadrant Labels */}
                <text
                  x={isOD ? "750" : "250"}
                  y="200"
                  fill="#7dd3fc"
                  fontSize="22"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  ST (Superior Temporal)
                </text>
                <text
                  x={isOD ? "250" : "750"}
                  y="200"
                  fill="#7dd3fc"
                  fontSize="22"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  SN (Superior Nasal)
                </text>
                <text
                  x={isOD ? "750" : "250"}
                  y="820"
                  fill="#7dd3fc"
                  fontSize="22"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  IT (Inferior Temporal)
                </text>
                <text
                  x={isOD ? "250" : "750"}
                  y="820"
                  fill="#7dd3fc"
                  fontSize="22"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  IN (Inferior Nasal)
                </text>
              </svg>
            </div>
          )}

          {/* Anatomical Landmarks Overlay */}
          {settings.showLandmarks && (
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Optic Disc Marker */}
              <div
                style={{
                  left: `${discPos.x}%`,
                  top: `${discPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-400/10 flex items-center justify-center">
                  <span className="text-[9px] font-mono font-bold text-amber-300 bg-slate-950/80 px-1 py-0.5 rounded border border-amber-500/40">
                    Optic Disc
                  </span>
                </div>
              </div>

              {/* Fovea / Macular Zone Marker */}
              <div
                style={{
                  left: `${foveaPos.x}%`,
                  top: `${foveaPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute flex items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full border border-sky-400/70 bg-sky-400/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  <span className="absolute -top-5 text-[9px] font-mono font-bold text-sky-300 bg-slate-950/80 px-1 py-0.5 rounded border border-sky-500/40">
                    Fovea (FAZ)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lesion Annotations Overlay (Interactive Markers) */}
          {settings.showLesions && (
            <div className="absolute inset-0 w-full h-full pointer-events-auto">
              {activeLesions.map((lesion) => {
                const isSelected = selectedLesion?.id === lesion.id;
                const isHovered = hoveredLesion?.id === lesion.id;

                return (
                  <div
                    key={lesion.id}
                    style={{
                      left: `${lesion.x}%`,
                      top: `${lesion.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLesion?.(lesion);
                    }}
                    onMouseEnter={() => setHoveredLesion(lesion)}
                    onMouseLeave={() => setHoveredLesion(null)}
                    className="absolute cursor-pointer group"
                  >
                    {/* Lesion Marker Pin */}
                    <div
                      className={`relative flex items-center justify-center rounded-full border transition-all duration-200 ${
                        lesion.size === 'large' ? 'w-5 h-5' : lesion.size === 'medium' ? 'w-4 h-4' : 'w-3 h-3'
                      } ${getLesionColor(lesion.type)} ${
                        isSelected || isHovered
                          ? 'scale-150 ring-4 ring-white shadow-lg'
                          : 'opacity-90 hover:opacity-100 hover:scale-125'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    {/* Hover Card / Tooltip */}
                    {(isHovered || isSelected) && (
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-48 p-2.5 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-md text-left text-xs pointer-events-none"
                      >
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                          <span className="font-bold text-slate-100 capitalize">
                            {lesion.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            {Math.round(lesion.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          {lesion.notes || `Detected in quadrant ${lesion.quadrant}`}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Quadrant: {lesion.quadrant}</span>
                          <span className="capitalize">{lesion.size}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Caliper Measurement Overlay Line */}
          {isCaliperActive && caliperPoints && (
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <line
                  x1={caliperPoints.x1}
                  y1={caliperPoints.y1}
                  x2={caliperPoints.x2}
                  y2={caliperPoints.y2}
                  stroke="#10b981"
                  strokeWidth="0.5"
                  strokeDasharray="1,1"
                />
                <circle cx={caliperPoints.x1} cy={caliperPoints.y1} r="1.2" fill="#10b981" />
                <circle cx={caliperPoints.x2} cy={caliperPoints.y2} r="1.2" fill="#10b981" />
              </svg>
            </div>
          )}
        </div>

        {/* Caliper Instruction / Readout HUD */}
        {isCaliperActive && (
          <div className="absolute top-4 left-4 z-20 px-3 py-2 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-xs shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <Ruler className="w-4 h-4" />
              <span>Ophthalmic Retinal Caliper</span>
            </div>
            {caliperStep === 0 && (
              <p className="text-[11px] text-slate-300">Click on starting landmark (e.g. Fovea Center)</p>
            )}
            {caliperStep === 1 && (
              <p className="text-[11px] text-slate-300">Click on target lesion to measure distance</p>
            )}
            {caliperStep === 2 && caliperPoints && (
              <div className="space-y-0.5 text-[11px]">
                <p className="text-slate-200">
                  Distance: <span className="font-mono text-emerald-300 font-bold">{getCaliperMeasurement()?.discDiameters} DD</span> ({getCaliperMeasurement()?.microns} µm)
                </p>
                <p className="text-[10px] text-slate-400">
                  {Number(getCaliperMeasurement()?.discDiameters) < 1 ? '⚠️ Within 1 DD of Fovea (Macular Risk)' : 'Outside primary foveal zone (> 1 DD)'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Heatmap Opacity Slider Overlay */}
        {settings.showHeatmap && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-xs text-slate-300 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] font-medium text-slate-400">Heatmap Opacity:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.heatmapOpacity}
              onChange={(e) => setSettings((s) => ({ ...s, heatmapOpacity: Number(e.target.value) }))}
              className="w-20 accent-rose-500 h-1.5 rounded-lg bg-slate-700 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-200 w-8">
              {settings.heatmapOpacity}%
            </span>
          </div>
        )}

        {/* Lesion Filter Pills Overlay */}
        {settings.showLesions && scan.lesions.length > 0 && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-xs backdrop-blur-sm overflow-x-auto max-w-[50%]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Filter:</span>
            {['all', 'microaneurysm', 'hemorrhage', 'hard_exudate', 'cotton_wool_spot', 'neovascularization'].map((type) => {
              const count = type === 'all' ? scan.lesions.length : scan.lesions.filter((l) => l.type === type).length;
              if (type !== 'all' && count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setSettings((s) => ({ ...s, activeLesionFilter: type }))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                    settings.activeLesionFilter === type
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'microaneurysm' ? 'MAs' : type === 'hemorrhage' ? 'Heme' : type === 'hard_exudate' ? 'Exudate' : type === 'cotton_wool_spot' ? 'CWS' : 'NVD/NVE'} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Image Quality: <strong className="text-slate-200 font-semibold">{scan.imageQuality}</strong> ({scan.qualityScore}%)</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span>FOV: <strong className="text-slate-200 font-semibold">45° Macular Centered</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>💡 Tip: Click and drag to pan • Scroll or use buttons to zoom</span>
        </div>
      </div>
    </div>
  );
};
