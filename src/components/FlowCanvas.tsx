import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Pause, 
  FileText, 
  ShieldCheck, 
  Terminal, 
  UserCheck, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Grid,
  AlignVerticalSpaceAround,
  Move,
  FileSpreadsheet,
  Code,
  Table,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FlowNode, FlowEdge, DrawioDiagramSpec } from '../types/workflow';
import { ALL_DRAWIO_DIAGRAMS } from '../data/diagramData';
import { Phase0SpecsDrawer } from './Phase0SpecsDrawer';

interface FlowCanvasProps {
  activeDiagramId: string;
  onChangeDiagram: (diagramId: string) => void;
  onSelectNode: (node: FlowNode) => void;
  activeNodeId?: string | null;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  activeDiagramId,
  onChangeDiagram,
  onSelectNode,
  activeNodeId,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Maintain local state of diagrams to allow user dragging nodes
  const [diagramsState, setDiagramsState] = useState<Record<string, DrawioDiagramSpec>>(ALL_DRAWIO_DIAGRAMS);

  // Sync state when canonical definitions change
  useEffect(() => {
    setDiagramsState(prev => ({
      ...ALL_DRAWIO_DIAGRAMS,
      ...prev,
    }));
  }, []);

  const currentDiagram = diagramsState[activeDiagramId] || ALL_DRAWIO_DIAGRAMS['root_workflow'];
  const nodes = currentDiagram.nodes;
  const edges = currentDiagram.edges;

  // Viewport & Pan/Zoom State
  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState({ x: 80, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [gridMode, setGridMode] = useState<'dot' | 'square' | 'none'>('dot');

  // Dragging state for single node
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Inspection Drawer
  const [inspectedNode, setInspectedNode] = useState<FlowNode | null>(null);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);

  // Phase 0 Specs Drawer Modal & Collapsible banner state
  const [isPhase0SpecsOpen, setIsPhase0SpecsOpen] = useState(false);
  const [phase0SpecsTab, setPhase0SpecsTab] = useState<'checklist' | 'statemachine' | 'intent_object'>('checklist');
  const [isSpecsBannerExpanded, setIsSpecsBannerExpanded] = useState(false);

  // Reset viewport when diagram changes
  useEffect(() => {
    if (activeDiagramId === 'root_workflow') {
      setZoom(0.65);
      setPan({ x: 80, y: 30 });
    } else if (activeDiagramId === 'phase0_detail') {
      setZoom(0.70);
      setPan({ x: 90, y: 30 });
    } else {
      setZoom(0.70);
      setPan({ x: 90, y: 30 });
    }
  }, [activeDiagramId]);

  // Zoom Handlers
  const handleZoomIn = () => setZoom(z => Math.min(1.8, Math.round((z + 0.15) * 100) / 100));
  const handleZoomOut = () => setZoom(z => Math.max(0.30, Math.round((z - 0.15) * 100) / 100));
  const handleResetZoom = () => {
    setZoom(activeDiagramId === 'root_workflow' ? 0.65 : 0.70);
    setPan(activeDiagramId === 'root_workflow' ? { x: 80, y: 30 } : { x: 90, y: 30 });
  };

  const handleFitView = () => {
    if (!nodes.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + (n.width || 480));
      maxY = Math.max(maxY, n.y + (n.height || 160));
    });
    const padding = 80;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;
    const clientW = canvasRef.current?.clientWidth || 1200;
    const clientH = canvasRef.current?.clientHeight || 800;
    const scale = Math.min(1.05, Math.max(0.35, Math.min(clientW / contentW, clientH / contentH)));
    setZoom(scale);
    setPan({
      x: (clientW - contentW * scale) / 2 - minX * scale + padding * scale,
      y: 30,
    });
  };

  // Auto Vertical Layout Organizer (Restores canonical spacious non-overlapping layout)
  const handleAutoVerticalLayout = () => {
    const canonicalDiagram = ALL_DRAWIO_DIAGRAMS[activeDiagramId];
    if (canonicalDiagram) {
      setDiagramsState(prev => ({
        ...prev,
        [activeDiagramId]: {
          ...canonicalDiagram,
          nodes: canonicalDiagram.nodes.map(n => ({ ...n })),
        },
      }));
    }
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowNode) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click
    setDraggingNodeId(node.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Canvas Pan Handlers - clicking anywhere on blank area, SVG background, or stage initiates panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Check if the click target is NOT a card or interactive element
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest('[data-node-card="true"]') || targetEl.closest('button') || targetEl.closest('input')) {
      return;
    }
    e.preventDefault();
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Global mousemove and mouseup listeners
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNodeId) {
      const newX = (e.clientX - pan.x - dragOffset.x) / zoom;
      const newY = (e.clientY - pan.y - dragOffset.y) / zoom;
      
      setDiagramsState(prev => {
        const diag = prev[activeDiagramId];
        if (!diag) return prev;
        return {
          ...prev,
          [activeDiagramId]: {
            ...diag,
            nodes: diag.nodes.map(n => 
              n.id === draggingNodeId 
                ? { ...n, x: Math.max(10, Math.round(newX)), y: Math.max(10, Math.round(newY)) }
                : n
            ),
          },
        };
      });
    }
  }, [isPanning, draggingNodeId, pan, startPan, dragOffset, zoom, activeDiagramId]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Native non-passive Wheel listener to reliably prevent browser zoom and provide buttery-smooth Ctrl+Wheel canvas zoom centered on mouse
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const onNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        // Calculate zoom around mouse position
        const rect = canvasEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
        
        setZoom(prevZoom => {
          const nextZoom = Math.min(2.0, Math.max(0.25, Math.round((prevZoom + zoomDelta) * 100) / 100));
          if (nextZoom === prevZoom) return prevZoom;

          // Adjust pan so the point under the cursor stays under the cursor
          setPan(prevPan => {
            const worldX = (mouseX - prevPan.x) / prevZoom;
            const worldY = (mouseY - prevPan.y) / prevZoom;
            return {
              x: Math.round(mouseX - worldX * nextZoom),
              y: Math.round(mouseY - worldY * nextZoom),
            };
          });

          return nextZoom;
        });
      } else {
        // Normal trackpad or mouse wheel pan
        setPan(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY,
        }));
      }
    };

    canvasEl.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', onNativeWheel);
    };
  }, []);

  // Helper to compute node bounding boxes and connector anchors
  const getNodeBounds = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0, w: 400, h: 100, cx: 200, cy: 50, top: 0, bottom: 100, left: 0, right: 400 };
    const w = node.width || (node.shapeType === 'rhombus' ? 280 : node.shapeType === 'reference_box' ? 380 : 480);
    const h = node.height || (node.shapeType === 'rhombus' ? 110 : node.shapeType === 'header' ? 65 : 85);
    return {
      x: node.x,
      y: node.y,
      w,
      h,
      cx: node.x + w / 2,
      cy: node.y + h / 2,
      top: node.y,
      bottom: node.y + h,
      left: node.x,
      right: node.x + w,
    };
  };

  // Generate clean Draw.io style orthogonal or direct connection path
  const generateConnectorPath = (edge: FlowEdge) => {
    const src = getNodeBounds(edge.from);
    const tgt = getNodeBounds(edge.to);
    if (!src || !tgt) return { path: '', midX: 0, midY: 0 };

    // Case 1: Reference link (side connection dashed)
    if (edge.type === 'reference' || edge.isDashed) {
      const startX = src.left;
      const startY = src.cy;
      const endX = tgt.right;
      const endY = tgt.cy;
      const midX = (startX + endX) / 2;
      return {
        path: `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`,
        midX: (startX + endX) / 2,
        midY: (startY + endY) / 2,
      };
    }

    // Case 2: Feedback loop / Re-confirm going upward
    if (edge.type === 'feedback_loop' || tgt.cy < src.cy - 40) {
      if (src.cx <= tgt.cx) {
        // Left side loop
        const startX = src.left;
        const startY = src.cy;
        const endX = tgt.left;
        const endY = tgt.cy;
        const detourX = Math.min(src.left, tgt.left) - 80;
        return {
          path: `M ${startX} ${startY} H ${detourX} V ${endY} H ${endX}`,
          midX: detourX - 15,
          midY: (startY + endY) / 2,
        };
      } else {
        // Right side loop
        const startX = src.right;
        const startY = src.cy;
        const endX = tgt.right;
        const endY = tgt.cy;
        const detourX = Math.max(src.right, tgt.right) + 80;
        return {
          path: `M ${startX} ${startY} H ${detourX} V ${endY} H ${endX}`,
          midX: detourX + 15,
          midY: (startY + endY) / 2,
        };
      }
    }

    // Case 3: Horizontal side branch (e.g. Decision No -> Clarify)
    if (Math.abs(src.cy - tgt.cy) < 60 && Math.abs(src.cx - tgt.cx) > 100) {
      if (src.cx > tgt.cx) {
        // Go Left
        return {
          path: `M ${src.left} ${src.cy} H ${tgt.right}`,
          midX: (src.left + tgt.right) / 2,
          midY: src.cy - 14,
        };
      } else {
        // Go Right
        return {
          path: `M ${src.right} ${src.cy} H ${tgt.left}`,
          midX: (src.right + tgt.left) / 2,
          midY: src.cy - 14,
        };
      }
    }

    // Case 4: Standard Vertical Top-to-Bottom Flow
    const startX = src.cx;
    const startY = src.bottom;
    const endX = tgt.cx;
    const endY = tgt.top;

    if (Math.abs(startX - endX) < 15) {
      // Straight vertical line
      return {
        path: `M ${startX} ${startY} V ${endY}`,
        midX: startX,
        midY: (startY + endY) / 2,
      };
    } else {
      // Orthogonal step line (Vertical -> Horizontal -> Vertical)
      const midY = (startY + endY) / 2;
      return {
        path: `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`,
        midX: (startX + endX) / 2,
        midY,
      };
    }
  };

  // Breadcrumbs items
  const breadcrumbs = useMemo(() => {
    if (activeDiagramId === 'root_workflow') {
      return [
        { id: 'root_workflow', nameZh: '主架构流程图 (Root Workflow)', nameEn: 'Root Workflow', isCurrent: true }
      ];
    }
    const current = diagramsState[activeDiagramId];
    return [
      { id: 'root_workflow', nameZh: '主架构流程图', nameEn: 'Root Workflow', isCurrent: false },
      { id: activeDiagramId, nameZh: current?.titleZh || '详细子流程', nameEn: current?.titleEn || 'Sub-Workflow Detail', isCurrent: true }
    ];
  }, [activeDiagramId, diagramsState]);

  // Available Sub-diagram list for top switcher tabs
  const tabList = [
    { id: 'root_workflow', titleZh: '🌐 总架构流程图', titleEn: 'Root Architecture', badge: 'Main' },
    { id: 'phase0_detail', titleZh: '0. 意图接收 (Phase 0)', titleEn: '0. Intent Intake', badge: 'P0' },
    { id: 'pm_detail', titleZh: '1. 项目经理 Agent', titleEn: '1. PM Agent Detail', badge: 'PM' },
    { id: 'analysis_detail', titleZh: '2. 需求分析流程', titleEn: '2. Requirement Analysis', badge: 'PRD' },
    { id: 'decompose_detail', titleZh: '3. 任务拆分引擎', titleEn: '3. Task Decomposer', badge: 'DAG' },
    { id: 'assign_detail', titleZh: '4. Agent 分配引擎', titleEn: '4. Agent Assignment', badge: 'Match' },
  ];

  return (
    <div className="relative flex-1 h-full bg-[#F8FAFC] overflow-hidden select-none flex flex-col font-sans">
      
      {/* =========================================
          TOP DRAW.IO STYLE TOOLBAR & BREADCRUMBS
         ========================================= */}
      <div className="z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Breadcrumbs & Diagram Sub-tabs */}
        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                {idx > 0 && <ChevronRight size={13} className="text-slate-400" />}
                <button
                  onClick={() => onChangeDiagram(crumb.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    crumb.isCurrent
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  {crumb.nameZh}
                </button>
              </React.Fragment>
            ))}
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Quick Diagram Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {tabList.map(tab => {
              const isActive = activeDiagramId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeDiagram(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>{tab.titleZh}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Viewport Controls, Auto-Layout, Phase 0 Specs & Simulator */}
        <div className="flex items-center gap-2">
          {/* Phase 0 Specs Matrix Button */}
          <button
            onClick={() => {
              setPhase0SpecsTab('checklist');
              setIsPhase0SpecsOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="查看 Phase 0 工作事项清单与状态机表格 (Specs & State Machine)"
          >
            <FileSpreadsheet size={14} className="text-amber-600" />
            <span className="text-[11px]">Phase 0 矩阵规约</span>
          </button>

          {/* Zoom Level & Actions */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs text-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-colors"
              title="缩小 (Zoom Out)"
            >
              <ZoomOut size={15} />
            </button>
            <span className="px-2 font-mono font-bold text-[11px] min-w-[48px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-colors"
              title="放大 (Zoom In)"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-colors border-l border-slate-200 ml-1"
              title="重置视图比例 (Reset View)"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleFitView}
              className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-colors"
              title="自适应全屏 (Fit Content)"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Grid Mode Toggle */}
          <button
            onClick={() => setGridMode(g => g === 'dot' ? 'square' : g === 'square' ? 'none' : 'dot')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="切换背景网格 (Toggle Grid Mode)"
          >
            <Grid size={15} />
            <span className="hidden md:inline text-[11px]">
              {gridMode === 'dot' ? '点阵网格' : gridMode === 'square' ? '方格网格' : '纯净背景'}
            </span>
          </button>

          {/* Auto Vertical Layout Organizer Button */}
          <button
            onClick={handleAutoVerticalLayout}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="一键恢复标准垂直排版 (Organize & Restore Layout)"
          >
            <AlignVerticalSpaceAround size={15} className="text-indigo-600" />
            <span className="text-[11px]">一键规整排版</span>
          </button>

          {/* Drag & Pan Hint Indicator */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200">
            <Move size={12} className="text-slate-400" />
            <span>按住鼠标空白处拖动画布</span>
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(s => !s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause size={14} />
                <span>暂停演示</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>全流程模拟</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================
          DRAW.IO CANVAS WORKSPACE
         ========================================= */}
      <div 
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        className={`relative flex-1 w-full h-full overflow-hidden select-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Background Grid Pattern */}
        {gridMode === 'dot' && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-65"
            style={{
              backgroundImage: `radial-gradient(#94A3B8 1.1px, transparent 1.1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />
        )}
        {gridMode === 'square' && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `linear-gradient(to right, #CBD5E1 1px, transparent 1px), linear-gradient(to bottom, #CBD5E1 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />
        )}

        {/* Floating Phase 0 Specs & State Machine Collapsible Widget */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
          {!isSpecsBannerExpanded ? (
            <button
              onClick={() => setIsSpecsBannerExpanded(true)}
              className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200 shadow-md text-slate-800 hover:bg-amber-50/80 transition-all flex items-center gap-2 text-xs font-bold"
              title="展开 Phase 0 工作事项清单与状态机表格"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <FileSpreadsheet size={15} className="text-amber-600" />
              <span>Phase 0 规约与状态机表</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          ) : (
            <div className="w-80 bg-white/95 backdrop-blur-md border border-amber-200 rounded-2xl shadow-xl p-3.5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-800">Phase 0 规约矩阵速览</span>
                </div>
                <button
                  onClick={() => setIsSpecsBannerExpanded(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded-lg hover:bg-slate-100"
                >
                  <ChevronUp size={14} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                包含 0.1~0.10 工作项处理清单、Request 生命周期 7 状态机以及 Intent Object JSON 结构。
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => {
                    setPhase0SpecsTab('checklist');
                    setIsPhase0SpecsOpen(true);
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[11px] flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <FileSpreadsheet size={16} className="text-amber-600" />
                  <span>工作事项清单表</span>
                </button>
                <button
                  onClick={() => {
                    setPhase0SpecsTab('statemachine');
                    setIsPhase0SpecsOpen(true);
                  }}
                  className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-[11px] flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Activity size={16} className="text-indigo-600" />
                  <span>生命周期状态机</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setPhase0SpecsTab('intent_object');
                  setIsPhase0SpecsOpen(true);
                }}
                className="w-full mt-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Code size={14} className="text-emerald-600" />
                <span>查看 Intent Object JSON 规范</span>
              </button>
            </div>
          )}
        </div>

        {/* Diagram Title Watermark */}
        <div className="absolute bottom-5 left-5 z-10 pointer-events-none opacity-85 bg-white/95 backdrop-blur-md p-3.5 px-4.5 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold text-slate-800">{currentDiagram.titleZh}</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{currentDiagram.subtitleZh}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
            <span>Nodes: {nodes.length}</span>
            <span>•</span>
            <span>Edges: {edges.length}</span>
            <span>•</span>
            <span>Bilingual Multi-Agent DAG</span>
          </div>
        </div>

        {/* Pan/Zoom Stage */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '4200px',
            height: '4500px',
            position: 'absolute',
          }}
        >
          {/* SVG Connectors Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <marker
                id="arrowhead-default"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
              </marker>

              <marker
                id="arrowhead-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#4F46E5" />
              </marker>

              <marker
                id="arrowhead-dashed"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#9333EA" />
              </marker>

              {/* Glowing Pulse Filter */}
              <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Edge Lines */}
            {edges.map(edge => {
              const { path } = generateConnectorPath(edge);
              if (!path) return null;
              const isReference = edge.type === 'reference' || edge.isDashed;
              const isActive = edge.active || isSimulating;

              return (
                <g key={edge.id} className="transition-all duration-200">
                  {/* Background shadow stroke for crisp contrast */}
                  <path
                    d={path}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={isActive ? 6 : 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.85}
                  />

                  {/* Main connection line */}
                  <path
                    d={path}
                    fill="none"
                    stroke={isReference ? '#C084FC' : isActive ? '#6366F1' : '#94A3B8'}
                    strokeWidth={isActive ? 3.5 : 2.4}
                    strokeDasharray={isReference ? '6,5' : 'none'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isActive ? 0.95 : 0.8}
                    markerEnd={
                      isReference 
                        ? 'url(#arrowhead-dashed)' 
                        : isActive 
                        ? 'url(#arrowhead-active)' 
                        : 'url(#arrowhead-default)'
                    }
                  />

                  {/* Animated flow particle dot on active edges */}
                  {isActive && (
                    <circle r="4.5" fill="#4F46E5" className="filter drop-shadow-sm">
                      <animateMotion
                        path={path}
                        dur={edge.pulseSpeed ? `${edge.pulseSpeed}s` : '2.5s'}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Render Flow Nodes (Cards) */}
          {nodes.map(node => {
            const isSelected = activeNodeId === node.id;
            const isDragging = draggingNodeId === node.id;
            const nodeW = node.width || (node.shapeType === 'rhombus' ? 280 : node.shapeType === 'reference_box' ? 380 : 480);
            const nodeH = node.height || (node.shapeType === 'rhombus' ? 110 : node.shapeType === 'header' ? 65 : 85);

            // Shape 1: Header Title Node
            if (node.shapeType === 'header') {
              return (
                <div
                  key={node.id}
                  data-node-card="true"
                  onMouseDown={e => handleNodeMouseDown(e, node)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${nodeW}px`,
                    height: `${nodeH}px`,
                  }}
                  className="absolute cursor-move bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500/80 rounded-2xl flex items-center justify-between px-5 shadow-sm select-none z-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <DynamicIcon name={node.iconName} size={20} />
                    </div>
                    <div>
                      <h1 className="text-sm font-bold text-emerald-950">{node.labelZh || node.label}</h1>
                      <p className="text-[11px] text-emerald-800 font-medium font-mono">{node.labelEn || node.summaryEn}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Draw.io Process Spec
                  </span>
                </div>
              );
            }

            // Shape 2: Decision Rhombus / Diamond Node
            if (node.shapeType === 'rhombus') {
              return (
                <div
                  key={node.id}
                  data-node-card="true"
                  onMouseDown={e => handleNodeMouseDown(e, node)}
                  onClick={() => onSelectNode(node)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${nodeW}px`,
                    height: `${nodeH}px`,
                  }}
                  className={`absolute cursor-move select-none group ${
                    isDragging ? 'scale-105 z-30' : 'z-10'
                  }`}
                >
                  {/* Diamond SVG Container */}
                  <div className="relative w-full h-full flex items-center justify-center p-3">
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-sm">
                      <polygon
                        points={`${nodeW / 2},4 ${nodeW - 6},${nodeH / 2} ${nodeW / 2},${nodeH - 4} 6,${nodeH / 2}`}
                        fill={node.fillColor || '#FFFBEB'}
                        stroke={isSelected ? '#D97706' : node.strokeColor || '#F59E0B'}
                        strokeWidth={isSelected ? 2.8 : 2}
                      />
                    </svg>

                    {/* Content inside diamond */}
                    <div className="relative z-10 text-center px-4 max-w-[220px]">
                      <div className="text-xs font-bold text-amber-950 leading-tight">
                        {node.labelZh || node.label}
                      </div>
                      <div className="text-[10px] text-amber-800 font-mono mt-0.5 font-medium leading-tight line-clamp-1">
                        {node.labelEn}
                      </div>
                    </div>
                  </div>

                  {/* Quick Decision Action Hint */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-bold font-mono whitespace-nowrap">
                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">是 (Yes) ↓</span>
                    <span className="text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">否 (No) ←</span>
                  </div>
                </div>
              );
            }

            // Shape 3: Reference Knowledge Box
            if (node.shapeType === 'reference_box') {
              return (
                <div
                  key={node.id}
                  data-node-card="true"
                  onMouseDown={e => handleNodeMouseDown(e, node)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${nodeW}px`,
                    height: `${nodeH}px`,
                  }}
                  className={`absolute cursor-move p-4.5 rounded-2xl bg-[#FAF5FF] border-2 border-dashed border-purple-400 text-purple-950 shadow-xs select-none ${
                    isDragging ? 'scale-105 z-30 ring-2 ring-purple-400' : 'z-10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-200">
                    <Layers size={16} className="text-purple-600" />
                    <div>
                      <h4 className="text-xs font-bold text-purple-900">{node.labelZh || node.label}</h4>
                      <p className="text-[10px] text-purple-700 font-mono">{node.labelEn}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-purple-900">
                    {node.bulletItems?.map((item, bIdx) => (
                      <div key={bIdx} className="text-[11px] leading-relaxed font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Shape 4: Standard Process Card (with Layered Colors & Bilingual)
            const isCompleted = node.status === 'completed';
            const isRunning = node.status === 'running';

            return (
              <div
                key={node.id}
                data-node-card="true"
                onMouseDown={e => handleNodeMouseDown(e, node)}
                onClick={() => {
                  onSelectNode(node);
                  setInspectedNode(node);
                }}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${nodeW}px`,
                  minHeight: `${nodeH}px`,
                  backgroundColor: node.fillColor || '#FFFFFF',
                  borderColor: isSelected ? '#4F46E5' : node.strokeColor || '#E2E8F0',
                }}
                className={`absolute cursor-move border-2 rounded-2xl p-4 shadow-sm transition-all duration-150 group select-none ${
                  isSelected 
                    ? 'ring-4 ring-indigo-500/20 shadow-lg z-30' 
                    : isDragging 
                    ? 'scale-105 shadow-xl z-40' 
                    : 'hover:shadow-md hover:border-slate-400 z-10'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-xs"
                      style={{ backgroundColor: node.strokeColor || '#4F46E5' }}
                    >
                      <DynamicIcon name={node.iconName} size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{node.labelZh || node.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium">
                        {node.labelEn}
                      </div>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                        <CheckCircle2 size={11} />
                        Done
                      </span>
                    ) : isRunning ? (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 animate-pulse">
                        <Loader2 size={11} className="animate-spin" />
                        Running
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
                        Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtitle / Bilingual Summary */}
                <div className="mt-2.5 text-[11px] text-slate-700 font-medium leading-relaxed bg-white/70 p-2 rounded-xl border border-black/5">
                  <div className="font-semibold text-slate-900">{node.summaryZh || node.summary}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{node.summaryEn}</div>
                </div>

                {/* Bullet Points */}
                {node.bulletItems && node.bulletItems.length > 0 && (
                  <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
                    {node.bulletItems.map((bullet, idx) => (
                      <div key={idx} className="leading-tight font-medium">
                        {bullet}
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Footer: Sub-diagram Drilldown Button or Tag */}
                <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
                  {/* Left: Tags */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {node.tags?.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/80 text-slate-600 font-medium border border-slate-200/80">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Right: Drilldown Button (CRITICAL FEATURE FOR SUB-DIAGRAMS) */}
                  {node.hasSubDiagram && node.subDiagramId ? (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onChangeDiagram(node.subDiagramId!);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Sparkles size={11} />
                      <span>查看子流程图</span>
                      <ArrowRight size={11} />
                    </button>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-mono">
                      {node.badge || 'Execution Node'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* =========================================
              EDGE LABELS OVERLAY LAYER (Z-25 Above Cards)
              Guarantees Edge Labels are NEVER obscured under cards!
             ========================================= */}
          <div className="absolute inset-0 pointer-events-none z-25 overflow-visible">
            {edges.map(edge => {
              const { path, midX, midY } = generateConnectorPath(edge);
              if (!path) return null;
              const labelTextZh = edge.labelZh || edge.label;
              const labelTextEn = edge.labelEn;
              if (!labelTextZh && !labelTextEn) return null;
              const isReference = edge.type === 'reference' || edge.isDashed;
              const isActive = edge.active || isSimulating;

              return (
                <div
                  key={`edge-label-overlay-${edge.id}`}
                  style={{
                    left: `${midX}px`,
                    top: `${midY}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute px-3 py-1 rounded-full text-[11px] font-bold tracking-tight shadow-md whitespace-nowrap transition-all duration-200 pointer-events-none select-none ${
                    isReference
                      ? 'bg-purple-50 text-purple-800 border-2 border-purple-300 shadow-purple-100'
                      : isActive
                      ? 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-indigo-200 ring-2 ring-indigo-300'
                      : 'bg-white text-slate-800 border-2 border-slate-300 shadow-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />}
                    <span>{labelTextZh || labelTextEn}</span>
                    {labelTextEn && labelTextZh && labelTextEn !== labelTextZh && (
                      <span className={`text-[9.5px] font-mono font-medium ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                        · {labelTextEn}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================
          NODE INSPECTION DRAWER (On Click)
         ========================================= */}
      {inspectedNode && (
        <div className="absolute top-16 right-4 z-30 w-96 max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <DynamicIcon name={inspectedNode.iconName} size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{inspectedNode.labelZh || inspectedNode.label}</h3>
                <p className="text-[10px] text-slate-500 font-mono">{inspectedNode.labelEn}</p>
              </div>
            </div>
            <button
              onClick={() => setInspectedNode(null)}
              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">业务描述 (Description)</label>
              <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                <p className="font-semibold">{inspectedNode.summaryZh || inspectedNode.summary}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">{inspectedNode.summaryEn}</p>
              </div>
            </div>

            {inspectedNode.bulletItems && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">执行规约 (Bullet Specifications)</label>
                <div className="mt-1 space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  {inspectedNode.bulletItems.map((b, idx) => (
                    <div key={idx} className="font-medium text-[11px]">{b}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 0 Quick Specs Table Access */}
            {(inspectedNode.id === 'human' || inspectedNode.id.startsWith('p0-')) && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-amber-700 uppercase">Phase 0 规约与生命周期速查</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setPhase0SpecsTab('checklist');
                      setIsPhase0SpecsOpen(true);
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet size={14} className="text-amber-600" />
                    <span>0.1~0.10 工作清单</span>
                  </button>
                  <button
                    onClick={() => {
                      setPhase0SpecsTab('statemachine');
                      setIsPhase0SpecsOpen(true);
                    }}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Activity size={14} className="text-indigo-600" />
                    <span>生命周期状态机</span>
                  </button>
                </div>
              </div>
            )}

            {inspectedNode.hasSubDiagram && inspectedNode.subDiagramId && (
              <button
                onClick={() => {
                  onChangeDiagram(inspectedNode.subDiagramId!);
                  setInspectedNode(null);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Sparkles size={14} />
                <span>进入该节点的详细子流程图</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          PHASE 0 SPECS & STATE MACHINE MODAL DRAWER
         ========================================= */}
      <Phase0SpecsDrawer
        isOpen={isPhase0SpecsOpen}
        onClose={() => setIsPhase0SpecsOpen(false)}
        initialTab={phase0SpecsTab}
      />
    </div>
  );
};

// Dynamic Icon Renderer for consistent visual styling
const DynamicIcon: React.FC<{ name?: string; size?: number; className?: string }> = ({ name, size = 16, className = '' }) => {
  switch (name) {
    case 'UserCheck':
      return <UserCheck size={size} className={className} />;
    case 'Sparkles':
      return <Sparkles size={size} className={className} />;
    case 'FileText':
    case 'FileSpreadsheet':
      return <FileText size={size} className={className} />;
    case 'Layers':
      return <Layers size={size} className={className} />;
    case 'Cpu':
      return <Cpu size={size} className={className} />;
    case 'Terminal':
      return <Terminal size={size} className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} className={className} />;
    case 'Activity':
      return <Activity size={size} className={className} />;
    default:
      return <Sparkles size={size} className={className} />;
  }
};
